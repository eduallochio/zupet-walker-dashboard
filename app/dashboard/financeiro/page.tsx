import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
import { formatCurrency } from '@/lib/utils';
import { NovoLancamentoModal } from './NovoLancamentoModal';
import { TabelaPagamentos } from './TabelaPagamentos';
import { MonthNav } from './MonthNav';
import { BotaoRegistrarPagamento } from './BotaoRegistrarPagamento';

const C = {
  card: '#132219', border: 'rgba(0,200,167,0.12)',
  accent: '#00C6A7', accentDim: 'rgba(0,198,167,0.12)',
  text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
  success: '#22D3A5', warning: '#F59E0B', danger: '#F87171',
};

const BILLING_TYPE_LABEL: Record<string, string> = {
  walk:        '🦮 Passeio',
  bath:        '🛁 Banho e Tosa',
  boarding:    '🌙 Hospedagem',
  daycare:     '🏠 Creche',
  vet_visit:   '🏥 Visita ao Vet',
  training:    '🎯 Adestramento',
  per_session: '📋 Por sessão',
  daily:       '📅 Diário',
  weekly:      '📆 Semanal',
  monthly:     '🗓️ Mensal',
};

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// Gráfico de barras SVG simples
function BarChart({ data }: { data: { label: string; paid: number; pending: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.paid + d.pending), 1);
  const W = 100 / data.length;
  const BAR_H = 80;

  return (
    <div style={{ padding: '8px 20px 16px' }}>
      <svg viewBox={`0 0 ${data.length * 60} 110`} style={{ width: '100%', height: 110, overflow: 'visible' }}>
        {data.map((d, i) => {
          const totalH = ((d.paid + d.pending) / maxVal) * BAR_H;
          const paidH = (d.paid / maxVal) * BAR_H;
          const pendH = (d.pending / maxVal) * BAR_H;
          const x = i * 60 + 8;
          const barW = 44;

          return (
            <g key={i}>
              {/* Barra pendente (fundo) */}
              {pendH > 0 && (
                <rect x={x} y={BAR_H - totalH + 2} width={barW} height={pendH} rx={3} fill="#fef3c7" stroke="#fde68a" strokeWidth={0.5} />
              )}
              {/* Barra paga (frente) */}
              {paidH > 0 && (
                <rect x={x} y={BAR_H - paidH + 2} width={barW} height={paidH} rx={3} fill="#00C6A7" />
              )}
              {/* Barra vazia */}
              {totalH === 0 && (
                <rect x={x} y={BAR_H - 4 + 2} width={barW} height={4} rx={2} fill="#e8f4f2" />
              )}
              {/* Label mês */}
              <text x={x + barW / 2} y={BAR_H + 16} textAnchor="middle" fontSize={9} fill="#7FA898">{d.label}</text>
              {/* Valor total acima da barra */}
              {(d.paid + d.pending) > 0 && (
                <text x={x + barW / 2} y={BAR_H - totalH - 2} textAnchor="middle" fontSize={8.5} fill="#E8F5F0" fontWeight="700">
                  {formatCurrency(d.paid + d.pending)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* Legenda */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#7FA898' }}>
          <div style={{ width: 10, height: 10, background: '#00C6A7', borderRadius: 2 }} />
          Recebido
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#7FA898' }}>
          <div style={{ width: 10, height: 10, background: 'rgba(245,158,11,0.5)', borderRadius: 2, border: '1px solid rgba(245,158,11,0.4)' }} />
          Pendente
        </div>
      </div>
    </div>
  );
}

export default async function FinanceiroPage({ searchParams }: { searchParams?: Promise<{ mes?: string; ano?: string }> }) {
  const sp  = await (searchParams ?? Promise.resolve({}));
  const now = new Date();
  const viewMonth = sp.mes !== undefined ? parseInt(sp.mes) : now.getMonth();
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

  const admin = createAdminClient();

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
      ? admin.from('walk_reports')
          .select('id, owner_id, pet_ids, duration_minutes, distance_meters, created_at, walk_session_id')
          .eq('walker_id', profile.id)
          .gte('created_at', filterStart)
          .lte('created_at', filterEnd)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    profile?.id
      ? admin.from('walk_sessions')
          .select('id, started_at, ended_at, owner_id, pet_ids, walker_service_id')
          .eq('walker_id', profile.id)
          .not('ended_at', 'is', null)
          .gte('ended_at', sixMonthsAgo.toISOString())
          .order('ended_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    profile?.id
      ? supabase.from('walk_schedules')
          .select('id, scheduled_at, duration_minutes, status, owner_id, pet_ids, service_id, walker_services(type, label, price)')
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

  // Reports já vêm filtrados pelo mês selecionado
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
  const projecaoMes = diaAtual > 0
    ? (paidMes / diaAtual) * diasNoMes
    : 0;

  // ── Item 3: Receita mensal (6 meses) ──────────────────────────
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = MONTHS[d.getMonth()];
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const rows = paymentsRows.filter((p: any) => {
      const pd = new Date(p.created_at);
      return pd.getFullYear() === yr && pd.getMonth() === mo;
    });
    const paid    = rows.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    const pending = rows.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    return { label, paid, pending };
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

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>Financeiro</h1>
          <MonthNav viewMonth={viewMonth} viewYear={viewYear} />
        </div>
        <NovoLancamentoModal owners={allOwnerIds.map(id => ({ user_id: id, name: ownerNames[id] ?? id }))} />
      </div>

      {!isPro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, fontSize: 13, color: '#F59E0B' }}>
          <span>🔒</span>
          <span>Plano Free: exibindo apenas os últimos 7 dias. <a href="/dashboard/pro" style={{ color: '#F59E0B', fontWeight: 700, textDecoration: 'underline' }}>Faça upgrade para ver o histórico completo.</a></span>
        </div>
      )}

      {/* ── Stats principais ── */}
      <div className="db-stat-grid" style={{ marginBottom: 24 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 10 }}>Total recebido</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: C.success, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalPaid)}</p>
          <p style={{ fontSize: 11.5, color: C.textSec, marginTop: 6 }}>pagamentos confirmados</p>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 10 }}>A receber</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: C.warning, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalPending)}</p>
          <p style={{ fontSize: 11.5, color: C.textSec, marginTop: 6 }}>aguardando pagamento</p>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 10 }}>Passeios</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{totalWalks}</p>
          <p style={{ fontSize: 11.5, color: C.textSec, marginTop: 6 }}>{formatDuration(totalMin)} no total</p>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 10 }}>Distância</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{(totalDist / 1000).toFixed(1)}</p>
          <p style={{ fontSize: 11.5, color: C.textSec, marginTop: 6 }}>km percorridos</p>
        </div>
      </div>

      {/* ── Gráfico de receita mensal ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Receita mensal</h2>
          <span style={{ fontSize: 12, color: C.textSec }}>últimos 6 meses</span>
        </div>
        <BarChart data={chartData} />
      </div>

      {/* ── Projeção do mês atual ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Projeção — {MONTHS[now.getMonth()]} {now.getFullYear()}</h2>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 8 }}>Confirmado no mês</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: C.success, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(paidMes)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 8 }}>Pendente no mês</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: C.warning, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(pendingMes)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 8 }}>Projeção até fim do mês</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(projecaoMes)}</p>
            <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>baseado no ritmo atual (dia {diaAtual}/{diasNoMes})</p>
          </div>
        </div>
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ height: 6, background: 'rgba(0,198,167,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(diaAtual / diasNoMes) * 100}%`, background: 'linear-gradient(90deg, #00C6A7, #22D3A5)', borderRadius: 3 }} />
          </div>
          <p style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>{Math.round((diaAtual / diasNoMes) * 100)}% do mês decorrido</p>
        </div>
      </div>

      {/* ── Passeios não cobrados ── */}
      {uncoveredSessions.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.warning, letterSpacing: '-0.01em' }}>Passeios sem cobrança registrada</h2>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: C.warning, background: 'rgba(245,158,11,0.2)', padding: '2px 10px', borderRadius: 20 }}>{uncoveredSessions.length}</span>
          </div>
          <ul style={{ listStyle: 'none' }}>
            {uncoveredSessions.slice(0, 5).map((s: any, i: number) => (
              <li key={s.id} style={{ padding: '12px 20px', borderTop: i > 0 ? '1px solid rgba(245,158,11,0.2)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.warning }}>
                    {s.ended_at ? new Date(s.ended_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'}
                  </p>
                  <p style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>
                    {ownerNames[s.owner_id] ?? 'Tutor'} · {(s.pet_ids ?? []).map((id: string) => petNames[id] ?? id).join(', ')}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: C.warning, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 10px', borderRadius: 20 }}>
                  Sem cobrança
                </span>
              </li>
            ))}
          </ul>
          {uncoveredSessions.length > 5 && (
            <p style={{ padding: '10px 20px', fontSize: 12, color: C.warning, borderTop: '1px solid rgba(245,158,11,0.2)' }}>
              + {uncoveredSessions.length - 5} passeio{uncoveredSessions.length - 5 > 1 ? 's' : ''} sem cobrança — registre no app
            </p>
          )}
        </div>
      )}

      <div className="db-row2" style={{ marginBottom: 16 }}>
        {/* Por tipo de serviço */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Por tipo de serviço</h2>
          </div>
          {typeRows.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: C.textSec }}>Nenhum dado ainda.</div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {typeRows.map(([type, data], i) => {
                const total = data.paid + data.pending;
                const maxType = typeRows[0][1].paid + typeRows[0][1].pending;
                const pct = maxType > 0 ? (total / maxType) * 100 : 0;
                return (
                  <li key={type} style={{ padding: '12px 20px', borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                        {BILLING_TYPE_LABEL[type] ?? type}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.success, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(data.paid)}</span>
                        {data.pending > 0 && <span style={{ fontSize: 11, color: C.warning, marginLeft: 6 }}>+{formatCurrency(data.pending)}</span>}
                      </div>
                    </div>
                    <div style={{ height: 4, background: 'rgba(0,198,167,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: C.accent, borderRadius: 2 }} />
                    </div>
                    <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{data.count} registro{data.count !== 1 ? 's' : ''}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Por tutor */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Por tutor</h2>
          </div>
          {ownerRows.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: C.textSec }}>Nenhum dado ainda.</div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {ownerRows.map(([ownerId, data], i) => (
                <li key={ownerId} style={{ padding: '12px 20px', borderTop: i > 0 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.accentDim, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                    👤
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.name}</p>
                    <p style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>{data.walks} passeio{data.walks !== 1 ? 's' : ''} · {formatDuration(data.minutes)}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {data.paid > 0 && <p style={{ fontSize: 13, fontWeight: 700, color: C.success, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(data.paid)}</p>}
                    {data.pending > 0 && <p style={{ fontSize: 11, color: C.warning, fontVariantNumeric: 'tabular-nums' }}>+ {formatCurrency(data.pending)} pend.</p>}
                    {data.paid === 0 && data.pending === 0 && <p style={{ fontSize: 11, color: C.textMuted }}>sem cobrança</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Por pet */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Por pet</h2>
        </div>
        {petRows.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: C.textSec }}>Nenhum passeio registrado.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', padding: '12px 20px', gap: 12 }}>
            {petRows.map(([petId, data]) => (
              <div key={petId} style={{ background: C.accentDim, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,198,167,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🐶</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.name}</p>
                  <p style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{data.walks} passeio{data.walks !== 1 ? 's' : ''}</p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>{(data.distance / 1000).toFixed(1)} km · {formatDuration(data.minutes)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Atendimentos concluídos ── */}
      {doneSchedulesRows.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Atendimentos concluídos</h2>
            <span style={{ fontSize: 12, color: C.textSec }}>últimos 6 meses</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,198,167,0.06)' }}>
                  {['Data', 'Tutor', 'Serviço', 'Valor', 'Pagamento'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 20px',
                      textAlign: i === 3 ? 'right' : i === 4 ? 'center' : 'left',
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                      textTransform: 'uppercase' as const, color: C.textSec,
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doneSchedulesRows.map((s: any, i: number) => {
                  const svc = s.walker_services;
                  const pmt = paymentBySchedule[s.id];
                  const serviceLabel = BILLING_TYPE_LABEL[svc?.type] ?? svc?.label ?? '—';
                  const price = svc?.price ?? pmt?.amount ?? 0;
                  const pmtStatus = pmt?.status;
                  const pmtMethod = pmt?.payment_method;
                  const PAYMENT_METHOD_LABEL: Record<string, string> = { cash: '💵 Dinheiro', pix: '📲 PIX', card: '💳 Cartão' };
                  return (
                    <tr key={s.id} style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '12px 20px', color: C.textSec, fontSize: 13 }}>
                        {new Date(s.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 20px', color: C.textSec, fontSize: 13 }}>{ownerNames[s.owner_id] ?? '—'}</td>
                      <td style={{ padding: '12px 20px', color: C.textSec, fontSize: 13 }}>{serviceLabel}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                        {price > 0 ? `R$ ${price.toFixed(2).replace('.', ',')}` : '—'}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        {!pmt ? (
                          <BotaoRegistrarPagamento
                            scheduleId={s.id}
                            ownerId={s.owner_id}
                            serviceType={svc?.type ?? 'walk'}
                            amount={price}
                            scheduledAt={s.scheduled_at}
                          />
                        ) : pmtStatus === 'paid' ? (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, color: C.success, background: 'rgba(34,211,165,0.15)' }}>
                            {pmtMethod ? PAYMENT_METHOD_LABEL[pmtMethod] ?? pmtMethod : 'Pago'}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, color: C.warning, background: 'rgba(245,158,11,0.15)' }}>
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Histórico de pagamentos ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Histórico de pagamentos</h2>
        </div>
        <TabelaPagamentos payments={paymentsRows} ownerNames={ownerNames} viewMonth={viewMonth} viewYear={viewYear} />
      </div>
    </div>
  );
}
