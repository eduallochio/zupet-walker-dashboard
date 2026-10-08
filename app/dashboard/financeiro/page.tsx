import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
import { AlertTriangle, Clock, MapPin, Lock } from 'lucide-react';
import { T, Card, CardHeader, Kpi, Label, Chip, Avatar, corPorNome } from '@/components/walker/dash-ui';
import { brl, duracao, km, dataCurta, plural } from '@/lib/format';
import { NovoLancamentoModal } from './NovoLancamentoModal';
import { TabelaPagamentos } from './TabelaPagamentos';
import { MonthNav } from './MonthNav';
import { BotaoRegistrarPagamento } from './BotaoRegistrarPagamento';



const BILLING_TYPE_LABEL: Record<string, string> = {
  walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem', daycare: 'Day Care',
  vet_visit: 'Visita Veterinária', training: 'Adestramento',
  per_session: 'Por sessão', daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal',
};
const PAYMENT_METHOD_LABEL: Record<string, string> = { cash: 'Dinheiro', pix: 'PIX', card: 'Cartão' };

// Gráfico de receita (6 meses) com escala e valores
function ReceitaChart({ data }: { data: { label: string; paid: number; pending: number; atual: boolean }[] }) {
  const max = Math.max(...data.map((d) => d.paid + d.pending), 0);
  const topo = max <= 0 ? 50 : Math.ceil(max / 50) * 50;
  const H = 150;
  const curto = (v: number) => brl(v).replace(',00', '');
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: H + 28, paddingBottom: 22, fontSize: 11, color: T.label, textAlign: 'right', width: 64 }}>
        <span>{curto(topo)}</span><span>{curto(topo / 2)}</span><span>R$ 0</span>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, gap: 14, borderBottom: `1px solid ${T.line}` }}>
        {data.map((d) => {
          const total = d.paid + d.pending;
          return (
            <div key={d.label} title={`${d.label}: recebido ${brl(d.paid)}, a receber ${brl(d.pending)}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: H + 28 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>{total > 0 ? curto(total) : '—'}</span>
              <div style={{ width: '100%', maxWidth: 56, display: 'flex', flexDirection: 'column', borderRadius: '6px 6px 2px 2px', overflow: 'hidden' }}>
                <span style={{ height: Math.round((d.pending / topo) * H), background: T.amber }} />
                <span style={{ height: Math.round((d.paid / topo) * H), background: T.accent }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: d.atual ? T.text : T.label, paddingTop: 4 }}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function FinanceiroPage({ searchParams }: { searchParams?: Promise<{ mes?: string; ano?: string }> }) {
  const sp  = await (searchParams ?? Promise.resolve({} as { mes?: string; ano?: string }));
  const now = new Date();
  // URL usa mês 1-based (1=Jan … 12=Dez); internamente 0-based
  const viewMonth = sp.mes !== undefined ? parseInt(sp.mes) - 1 : now.getMonth();
  const viewYear  = sp.ano !== undefined ? parseInt(sp.ano) : now.getFullYear();
  // Usar datas UTC explícitas para evitar deslocamento de fuso
  const filterStart = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01T00:00:00.000Z`;
  const lastDay = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const filterEnd   = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;

  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('walker_profiles').select('id, plan').eq('user_id', user.id).single();

  const isPro = profile?.plan === 'pro';
  const freeCutoff = isPro ? null : (() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString();
  })();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [{ data: payments }, { data: reports }, { data: sessions }, { data: doneSchedules }] = await Promise.all([
    profile?.id
      ? supabase.from('walker_payments')
          .select('id, amount, status, billing_type, service_type, payment_method, description, created_at, notes, owner_id, walk_session_id, schedule_id')
          .eq('walker_id', profile.id)
          .gte('created_at', filterStart)
          .lte('created_at', filterEnd)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    profile?.id
      ? createAdminClient().from('walk_reports')
          .select('id, owner_id, pet_ids, duration_minutes, distance_meters, created_at, session_id')
          .eq('walker_id', profile.id)
          .gte('created_at', filterStart)
          .lte('created_at', filterEnd)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    profile?.id
      ? createAdminClient().from('walk_sessions')
          .select('id, started_at, ended_at, owner_id, pet_ids, walker_service_id')
          .eq('walker_id', profile.id)
          .not('ended_at', 'is', null)
          .gte('ended_at', sixMonthsAgo.toISOString())
          .order('ended_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    profile?.id
      ? supabase.from('walk_schedules')
          .select('id, scheduled_at, duration_minutes, status, owner_id, pet_ids, service_id, amount, service_type, walker_services(type, label, price)')
          .eq('walker_id', profile.id)
          .eq('status', 'done')
          .gte('scheduled_at', filterStart)
          .lte('scheduled_at', filterEnd)
          .order('scheduled_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const applyFreeCutoff = (rows: any[], dateField: string) =>
    freeCutoff ? rows.filter((r: any) => r[dateField] >= freeCutoff!) : rows;

  const paymentsRows      = applyFreeCutoff((payments      ?? []) as any[], 'created_at');
  const reportsRows       = applyFreeCutoff((reports       ?? []) as any[], 'created_at');
  const sessionsRows      = applyFreeCutoff((sessions      ?? []) as any[], 'ended_at');
  const doneSchedulesRows = applyFreeCutoff((doneSchedules ?? []) as any[], 'scheduled_at');

  // Buscar todos os tutores vinculados ao walker via walker_pet_links
  const { data: linkedPets } = profile?.id
    ? await supabase.from('walker_pet_links')
        .select('pet_id, pets(user_id)')
        .eq('walker_id', profile.id)
    : { data: [] };
  const linkedOwnerIds = [...new Set(
    (linkedPets ?? []).map((l: any) => l.pets?.user_id).filter(Boolean)
  )];

  // União de todos os owner_ids conhecidos
  const allOwnerIds = [...new Set([
    ...linkedOwnerIds,
    ...paymentsRows.map((p: any) => p.owner_id),
    ...reportsRows.map((r: any) => r.owner_id),
    ...doneSchedulesRows.map((s: any) => s.owner_id),
  ].filter(Boolean))];
  let ownerNames: Record<string, string> = {};
  if (allOwnerIds.length > 0) {
    const { data: owners } = await supabase
      .from('user_profiles').select('user_id, name').in('user_id', allOwnerIds);
    (owners ?? []).forEach((o: any) => { ownerNames[o.user_id] = o.name; });
  }

  // Buscar nomes dos pets (de todos os reports para usar em uncoveredSessions também)
  const allPetIds = [...new Set(reportsRows.flatMap((r: any) => r.pet_ids ?? []))];
  let petNames: Record<string, string> = {};
  if (allPetIds.length > 0) {
    const { data: petsData } = await supabase
      .from('pets').select('id, name').in('id', allPetIds);
    (petsData ?? []).forEach((p: any) => { petNames[p.id] = p.name; });
  }

  const reportsDoMes = reportsRows;

  // ── Totais do mês selecionado ──────────────────────────────────
  const totalPaid    = paymentsRows.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
  const totalPending = paymentsRows.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
  const totalWalks   = reportsDoMes.length;
  const totalMin     = reportsDoMes.reduce((s: number, r: any) => s + (r.duration_minutes ?? 0), 0);
  const totalDist    = reportsDoMes.reduce((s: number, r: any) => s + (r.distance_meters ?? 0), 0);

  // ── Item 5: Projeção do mês selecionado ───────────────────────
  const mesAtualStart = new Date(viewYear, viewMonth, 1);
  const mesAtualEnd   = new Date(viewYear, viewMonth + 1, 0);
  const diasNoMes     = mesAtualEnd.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const diaAtual      = isCurrentMonth ? now.getDate() : diasNoMes;

  // payments já estão filtrados pelo mês selecionado
  const paidMes    = paymentsRows.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
  const pendingMes = paymentsRows.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
  // Previsão: ritmo do mês (recebido + a receber) projetado até o último dia
  const projecaoMes = diaAtual > 0
    ? ((paidMes + pendingMes) / diaAtual) * diasNoMes
    : 0;

  // ── Item 3: Receita mensal (6 meses) ──────────────────────────
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  // Busca própria de 6 meses (antes o gráfico usava só os pagamentos do mês selecionado)
  const { data: chartPaymentsRaw } = profile?.id
    ? await supabase.from('walker_payments')
        .select('amount, status, created_at')
        .eq('walker_id', profile.id)
        .gte('created_at', sixMonthsAgo.toISOString())
    : { data: [] };
  const chartPayments = applyFreeCutoff((chartPaymentsRaw ?? []) as any[], 'created_at');
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = MONTHS[d.getMonth()];
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const rows = chartPayments.filter((p: any) => {
      const pd = new Date(p.created_at);
      return pd.getFullYear() === yr && pd.getMonth() === mo;
    });
    const paid    = rows.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    const pending = rows.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    return { label, paid, pending, atual: yr === viewYear && mo === viewMonth };
  });

  // ── Item 4: Receita por tipo de serviço ────────────────────────
  const byType: Record<string, { paid: number; pending: number; count: number }> = {};
  paymentsRows.forEach((p: any) => {
    const t = p.service_type ?? p.billing_type ?? 'outros';
    if (!byType[t]) byType[t] = { paid: 0, pending: 0, count: 0 };
    byType[t].count += 1;
    if (p.status === 'paid')    byType[t].paid    += p.amount ?? 0;
    if (p.status === 'pending') byType[t].pending += p.amount ?? 0;
  });
  const typeRows = Object.entries(byType).sort((a, b) => (b[1].paid + b[1].pending) - (a[1].paid + a[1].pending));

  // ── Mapa schedule_id → payment (para mostrar status financeiro no histórico) ──
  const paymentBySchedule: Record<string, any> = {};
  paymentsRows.forEach((p: any) => {
    if (p.schedule_id) paymentBySchedule[p.schedule_id] = p;
  });

  // ── Itens 1 e 2: Passeios não cobrados ────────────────────────
  // Walk sessions 'done' que não têm um walker_payment associado
  const paidSessionIds = new Set(paymentsRows.map((p: any) => p.walk_session_id).filter(Boolean));
  const uncoveredSessions = sessionsRows.filter((s: any) =>
    !paidSessionIds.has(s.id) &&
    s.ended_at >= filterStart && s.ended_at <= filterEnd
  );

  // Receita por tutor (combinando payments + reports)
  const byOwner: Record<string, { name: string; paid: number; pending: number; walks: number; minutes: number }> = {};
  paymentsRows.forEach((p: any) => {
    if (!p.owner_id) return;
    if (!byOwner[p.owner_id]) byOwner[p.owner_id] = { name: ownerNames[p.owner_id] ?? '—', paid: 0, pending: 0, walks: 0, minutes: 0 };
    if (p.status === 'paid')    byOwner[p.owner_id].paid    += p.amount ?? 0;
    if (p.status === 'pending') byOwner[p.owner_id].pending += p.amount ?? 0;
  });
  reportsDoMes.forEach((r: any) => {
    if (!r.owner_id) return;
    if (!byOwner[r.owner_id]) byOwner[r.owner_id] = { name: ownerNames[r.owner_id] ?? '—', paid: 0, pending: 0, walks: 0, minutes: 0 };
    byOwner[r.owner_id].walks   += 1;
    byOwner[r.owner_id].minutes += r.duration_minutes ?? 0;
  });
  const ownerRows = Object.entries(byOwner).sort((a, b) => b[1].walks - a[1].walks);

  // Receita por pet (mês selecionado)
  const byPet: Record<string, { name: string; walks: number; minutes: number; distance: number }> = {};
  reportsDoMes.forEach((r: any) => {
    (r.pet_ids ?? []).forEach((pid: string) => {
      if (!byPet[pid]) byPet[pid] = { name: petNames[pid] ?? pid, walks: 0, minutes: 0, distance: 0 };
      byPet[pid].walks    += 1;
      byPet[pid].minutes  += r.duration_minutes ?? 0;
      byPet[pid].distance += r.distance_meters  ?? 0;
    });
  });
  const petRows = Object.entries(byPet).sort((a, b) => b[1].walks - a[1].walks);

  const NOMES_MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const pendCount = paymentsRows.filter((p: any) => p.status === 'pending').length;

  return (
    <div className="zw-page">
      {/* ── Cabeçalho ── */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Financeiro</h1>
          <MonthNav viewMonth={viewMonth} viewYear={viewYear} />
        </div>
        <NovoLancamentoModal owners={allOwnerIds.map(id => ({ user_id: id, name: ownerNames[id] ?? id }))} />
      </header>

      {!isPro && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 13, color: T.muted }}>
          <Lock size={15} aria-hidden /> No plano grátis o histórico mostra os últimos 7 dias.
          <a href="/dashboard/pro" style={{ color: T.accentLt, fontWeight: 700, textDecoration: 'none' }}>Ver tudo com o Pro</a>
        </div>
      )}

      {/* ── Números do mês ── */}
      <div className="zw-grid-kpi">
        <Kpi label="Recebido" value={brl(totalPaid)} valueColor={T.accentLt} sub="pagamentos confirmados" />
        <Kpi label="A receber" value={brl(totalPending)} valueColor={T.amber} sub={pendCount ? plural(pendCount, 'lançamento aguardando', 'lançamentos aguardando') : 'nada pendente'} />
        <Kpi
          label={isCurrentMonth ? `Previsão até ${diasNoMes}/${String(viewMonth + 1).padStart(2, '0')}` : `Total de ${NOMES_MES[viewMonth]}`}
          value={brl(isCurrentMonth ? projecaoMes : paidMes + pendingMes)}
          sub={isCurrentMonth ? `no ritmo atual (dia ${diaAtual} de ${diasNoMes}), contando o que falta receber` : 'recebido + a receber'}
        />
        <Kpi label="Passeios" value={String(totalWalks)} sub={`${duracao(totalMin)} no total${km(totalDist) ? ` · ${km(totalDist)}` : ''}`} />
      </div>

      {/* ── Receita 6 meses ── */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Receita dos últimos 6 meses</h2>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: T.muted, fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: T.accent }} />Recebido</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: T.amber }} />A receber</span>
          </div>
        </div>
        <ReceitaChart data={chartData} />
      </Card>

      {/* ── Passeios sem cobrança ── */}
      {uncoveredSessions.length > 0 && (
        <Card pad={false} style={{ borderColor: T.amberLine, background: 'rgba(251,191,36,0.06)' }}>
          <CardHeader title={<><AlertTriangle size={18} color={T.amber} aria-hidden /> Passeios sem cobrança registrada <Chip tone="amber">{uncoveredSessions.length}</Chip></>} />
          {uncoveredSessions.slice(0, 5).map((s: any) => (
            <div key={s.id} className="zw-row">
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{s.ended_at ? dataCurta(s.ended_at) : '—'} · {(s.pet_ids ?? []).map((id: string) => petNames[id] ?? 'Pet').join(' e ')}</span>
                <span style={{ fontSize: 13, color: T.muted }}>{ownerNames[s.owner_id] ?? 'Tutor'}</span>
              </div>
              <Chip tone="amber">Sem cobrança</Chip>
            </div>
          ))}
          {uncoveredSessions.length > 5 && (
            <div className="zw-row" style={{ fontSize: 13, color: T.amber }}>
              + {plural(uncoveredSessions.length - 5, 'passeio', 'passeios')} sem cobrança. Registre pelo app ou em Novo lançamento.
            </div>
          )}
        </Card>
      )}

      {/* ── Por serviço, tutor e pet ── */}
      <div className="zw-grid-3">
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800 }}>Por serviço</h2>
          {typeRows.length === 0 ? <span style={{ fontSize: 13, color: T.muted }}>Nenhum lançamento no período.</span> : typeRows.map(([type, data]) => {
            const total = data.paid + data.pending;
            const maxType = typeRows[0][1].paid + typeRows[0][1].pending;
            return (
              <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 14 }}>
                  <span style={{ fontWeight: 700 }}>{BILLING_TYPE_LABEL[type] ?? type}</span>
                  <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{brl(total)}</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: `${maxType > 0 ? (total / maxType) * 100 : 0}%`, background: T.accent, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, color: T.muted }}>{plural(data.count, 'lançamento', 'lançamentos')}{data.pending > 0 ? ` · ${brl(data.pending)} a receber` : ''}</span>
              </div>
            );
          })}
        </Card>

        <Card pad={false}>
          <CardHeader title="Por tutor" />
          {ownerRows.length === 0 ? <div className="zw-row" style={{ fontSize: 13, color: T.muted }}>Nenhum dado no período.</div> : ownerRows.map(([ownerId, data]) => (
            <div key={ownerId} className="zw-row">
              <Avatar name={data.name} bg={corPorNome(data.name)} size={34} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.name}</span>
                <span style={{ fontSize: 12, color: T.muted }}>{plural(data.walks, 'passeio', 'passeios')} · {duracao(data.minutes)}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                {data.paid > 0 && <div style={{ fontSize: 14, fontWeight: 700, color: T.accentLt }}>{brl(data.paid)}</div>}
                {data.pending > 0 && <div style={{ fontSize: 12, color: T.amber }}>{brl(data.pending)} a receber</div>}
                {data.paid === 0 && data.pending === 0 && <div style={{ fontSize: 12, color: T.muted }}>sem cobrança</div>}
              </div>
            </div>
          ))}
        </Card>

        <Card pad={false}>
          <CardHeader title="Por pet" />
          {petRows.length === 0 ? <div className="zw-row" style={{ fontSize: 13, color: T.muted }}>Nenhum passeio no período.</div> : petRows.map(([petId, data]) => (
            <div key={petId} className="zw-row">
              <Avatar name={data.name} bg={corPorNome(data.name)} size={34} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{data.name}</span>
                <span style={{ fontSize: 12, color: T.muted, display: 'flex', gap: 10 }}>
                  <span>{plural(data.walks, 'passeio', 'passeios')}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} aria-hidden />{duracao(data.minutes)}</span>
                  {km(data.distance) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} aria-hidden />{km(data.distance)}</span>}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* ── Atendimentos concluídos ── */}
      {doneSchedulesRows.length > 0 && (
        <Card pad={false}>
          <CardHeader title="Atendimentos concluídos" extra={<span style={{ fontSize: 13, color: T.muted }}>em {NOMES_MES[viewMonth]}</span>} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: T.text }}>
              <thead>
                <tr>
                  {['Data', 'Tutor', 'Serviço', 'Valor', 'Pagamento'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 3 ? 'right' : 'left', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.label, padding: '12px 18px', borderBottom: `1px solid ${T.line}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doneSchedulesRows.map((s: any) => {
                  const svc = s.walker_services;
                  const pmt = paymentBySchedule[s.id];
                  const price = svc?.price ?? s.amount ?? pmt?.amount ?? 0;
                  const cell = { padding: '14px 18px', borderTop: `1px solid ${T.line}`, whiteSpace: 'nowrap' as const, fontSize: 14 };
                  return (
                    <tr key={s.id}>
                      <td style={{ ...cell, color: T.muted }}>{dataCurta(s.scheduled_at)}</td>
                      <td style={{ ...cell, fontWeight: 700 }}>{ownerNames[s.owner_id] ?? '—'}</td>
                      <td style={cell}>{BILLING_TYPE_LABEL[svc?.type ?? s.service_type] ?? svc?.label ?? '—'}</td>
                      <td style={{ ...cell, textAlign: 'right', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{price > 0 ? brl(price) : '—'}</td>
                      <td style={cell}>
                        {!pmt ? (
                          <BotaoRegistrarPagamento scheduleId={s.id} ownerId={s.owner_id} serviceType={svc?.type ?? s.service_type ?? 'walk'} amount={price} scheduledAt={s.scheduled_at} />
                        ) : pmt.status === 'paid' ? (
                          <Chip>{pmt.payment_method ? `Pago · ${PAYMENT_METHOD_LABEL[pmt.payment_method] ?? pmt.payment_method}` : 'Pago'}</Chip>
                        ) : (
                          <Chip tone="amber">Pendente</Chip>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Lançamentos ── */}
      <Card pad={false} style={{ marginBottom: 8 }}>
        <TabelaPagamentos payments={paymentsRows} ownerNames={ownerNames} viewMonth={viewMonth} viewYear={viewYear} />
      </Card>
    </div>
  );
}
