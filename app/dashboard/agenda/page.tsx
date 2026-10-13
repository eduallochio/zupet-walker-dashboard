import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MonthNav } from '../financeiro/MonthNav';
import { BotoesAgendamento } from './BotoesAgendamento';
import { NovoAgendamentoBtn } from './NovoAgendamentoModal';
import { ResolverAtrasado } from '@/components/walker/PendenciaAcoes';
import { T, Card, CardHeader, Chip, EmptyState, IconBox, Label } from '@/components/walker/dash-ui';
import { dataCurta, diaKey, duracao, hora, plural, semanaAtual } from '@/lib/format';
import {
  AlertTriangle, Bath, CalendarCheck, CalendarDays, GraduationCap, History, Home, Inbox,
  Footprints, StickyNote, Stethoscope, Sun, type LucideIcon,
} from 'lucide-react';

type ScheduleStatus = 'proposed' | 'confirmed' | 'cancelled' | 'done';

const STATUS: Record<ScheduleStatus, { label: string; tone: 'accent' | 'amber' | 'neutral' }> = {
  confirmed: { label: 'Confirmado', tone: 'accent' },
  proposed:  { label: 'Aguardando você', tone: 'amber' },
  cancelled: { label: 'Cancelado', tone: 'neutral' },
  done:      { label: 'Concluído', tone: 'neutral' },
};

const SERVICO: Record<string, { label: string; icon: LucideIcon; cor: string }> = {
  walk:      { label: 'Passeio', icon: Footprints, cor: '#22C55E' },
  bath:      { label: 'Banho e tosa', icon: Bath, cor: '#93C5FD' },
  boarding:  { label: 'Hospedagem', icon: Home, cor: '#C4B5FD' },
  daycare:   { label: 'Day care', icon: Sun, cor: '#FCD34D' },
  training:  { label: 'Adestramento', icon: GraduationCap, cor: '#FDBA74' },
  vet_visit: { label: 'Visita veterinária', icon: Stethoscope, cor: '#F9A8D4' },
};
const servicoDe = (t?: string | null) => SERVICO[t ?? 'walk'] ?? SERVICO.walk;

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function tituloDia(key: string, hojeKey: string, amanhaKey: string) {
  const d = new Date(`${key}T12:00:00Z`);
  const rot = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  if (key === hojeKey) return `Hoje · ${rot}`;
  if (key === amanhaKey) return `Amanhã · ${rot}`;
  return rot;
}

export default async function AgendaPage({ searchParams }: { searchParams?: Promise<{ mes?: string; ano?: string }> }) {
  const sp = await (searchParams ?? Promise.resolve({} as { mes?: string; ano?: string }));
  const now = new Date();
  // URL usa mês 1-based; internamente 0-based
  const viewMonth = sp.mes !== undefined ? parseInt(sp.mes) - 1 : now.getMonth();
  const viewYear  = sp.ano !== undefined ? parseInt(sp.ano)     : now.getFullYear();

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
    .from('walker_profiles').select('id').eq('user_id', user.id).single();

  // Próximos: sem filtro de mês (são futuros)
  // Histórico: filtrado pelo mês selecionado
  const [{ data: upcoming }, { data: pastSchedules }] = await Promise.all([
    profile?.id
      ? supabase.from('walk_schedules')
          .select('id, scheduled_at, duration_minutes, pet_ids, status, notes, owner_id, service_type')
          .eq('walker_id', profile.id)
          .in('status', ['proposed', 'confirmed'])
          .order('scheduled_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    profile?.id
      ? supabase.from('walk_schedules')
          .select('id, scheduled_at, duration_minutes, pet_ids, status, notes, owner_id, service_type')
          .eq('walker_id', profile.id)
          .in('status', ['done', 'cancelled'])
          .gte('scheduled_at', filterStart)
          .lte('scheduled_at', filterEnd)
          .order('scheduled_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const upcomingRows = (upcoming ?? []) as any[];
  const pastRows     = (pastSchedules ?? []) as any[];
  const allRows      = [...upcomingRows, ...pastRows];

  // Buscar nomes dos pets
  const allPetIds = [...new Set(allRows.flatMap((s: any) => s.pet_ids ?? []))];
  const petNames: Record<string, string> = {};
  if (allPetIds.length > 0) {
    const { data: petsData } = await supabase
      .from('pets').select('id, name').in('id', allPetIds);
    (petsData ?? []).forEach((p: any) => { petNames[p.id] = p.name; });
  }

  // Buscar nomes dos tutores
  const ownerIds = [...new Set(allRows.map((s: any) => s.owner_id).filter(Boolean))];
  const ownerNames: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from('user_profiles').select('user_id, name').in('user_id', ownerIds);
    (owners ?? []).forEach((o: any) => { ownerNames[o.user_id] = o.name; });
  }

  // Busca pets vinculados ao walker para o modal de novo agendamento
  let linkedPets: { pet_id: string; name: string; breed?: string; owner_name?: string }[] = [];
  if (profile?.id) {
    const { data: links } = await supabase
      .from('walker_pet_links')
      .select('pet_id, owner_id, pet:pets(id, name, breed)')
      .eq('walker_id', profile.id)
      .eq('status', 'active');

    const linkRows = (links ?? []) as any[];
    if (linkRows.length > 0) {
      const linkOwnerIds = [...new Set(linkRows.map((r: any) => r.owner_id).filter(Boolean))];
      let linkOwnerNames: Record<string, string> = {};
      if (linkOwnerIds.length > 0) {
        const { data: lo } = await supabase
          .from('user_profiles').select('user_id, name').in('user_id', linkOwnerIds);
        linkOwnerNames = Object.fromEntries((lo ?? []).map((o: any) => [o.user_id, o.name]));
      }
      linkedPets = linkRows
        .filter((r: any) => r.pet)
        .map((r: any) => ({
          pet_id:     r.pet_id,
          name:       r.pet.name,
          breed:      r.pet.breed,
          owner_name: r.owner_id ? linkOwnerNames[r.owner_id] : undefined,
        }));
    }

    // Pets avulsos cadastrados pelo walker (sem tutor)
    const { data: ownPets } = await supabase
      .from('pets')
      .select('id, name, breed')
      .eq('walker_owner_id', user.id)
      .is('merged_into', null)
      .eq('is_memorial', false)
      .order('name');

    const ownPetIds = new Set(linkedPets.map((p) => p.pet_id));
    for (const p of (ownPets ?? []) as any[]) {
      if (!ownPetIds.has(p.id)) {
        linkedPets.push({ pet_id: p.id, name: p.name, breed: p.breed ?? undefined });
      }
    }
  }

  // ── Grupos ──
  const limiteAtraso = now.getTime() - 3 * 3600_000;
  const atrasados   = upcomingRows.filter((s: any) => s.status === 'confirmed' && new Date(s.scheduled_at).getTime() < limiteAtraso);
  const solicitacoes = upcomingRows.filter((s: any) => s.status === 'proposed');
  const proximos    = upcomingRows.filter((s: any) => s.status === 'confirmed' && new Date(s.scheduled_at).getTime() >= limiteAtraso);

  const hojeKey  = diaKey(now.toISOString());
  const amanhaKey = diaKey(new Date(now.getTime() + 86400_000).toISOString());
  const porDia: Record<string, any[]> = {};
  for (const s of proximos) (porDia[diaKey(s.scheduled_at)] ??= []).push(s);
  const diasOrdenados = Object.keys(porDia).sort();
  const hojeCount = (porDia[hojeKey] ?? []).length;

  const semana = semanaAtual();
  const nomeMes = MESES[viewMonth];
  const concluidosMes = pastRows.filter((s: any) => s.status === 'done').length;

  const nomesPets = (ids: string[] | null) => (ids ?? []).map((id) => petNames[id]).filter(Boolean).join(', ') || 'Pet';

  const Linha = ({ s, children }: { s: any; children?: ReactNode }) => {
    const sv = servicoDe(s.service_type);
    return (
      <div className="zw-row" style={{ alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div style={{ width: 52, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{hora(s.scheduled_at)}</span>
          <span style={{ fontSize: 12, color: T.label }}>{duracao(s.duration_minutes)}</span>
        </div>
        <span aria-hidden style={{ width: 3, borderRadius: 3, background: sv.cor, flexShrink: 0 }} />
        <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <sv.icon size={15} color={sv.cor} aria-hidden /> {sv.label} · {nomesPets(s.pet_ids)}
          </span>
          <span style={{ fontSize: 13, color: T.muted }}>
            {ownerNames[s.owner_id] ? `Tutor: ${ownerNames[s.owner_id]}` : 'Pet cadastrado por você'}
          </span>
          {s.notes && (
            <span style={{ fontSize: 12, color: T.label, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <StickyNote size={13} aria-hidden style={{ marginTop: 1, flexShrink: 0 }} /> {s.notes}
            </span>
          )}
        </div>
        {children ?? <div style={{ alignSelf: 'center' }}><Chip tone={STATUS[s.status as ScheduleStatus]?.tone ?? 'neutral'}>{STATUS[s.status as ScheduleStatus]?.label ?? s.status}</Chip></div>}
      </div>
    );
  };

  return (
    <div className="zw-page">
      {/* ── Cabeçalho ── */}
      <header className="zw-in" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Agenda</h1>
          <span style={{ fontSize: 14, color: T.muted }}>
            {hojeCount ? `${plural(hojeCount, 'atendimento', 'atendimentos')} hoje` : 'Nenhum atendimento hoje'}
            {solicitacoes.length ? ` · ${plural(solicitacoes.length, 'solicitação aguardando', 'solicitações aguardando')}` : ''}
          </span>
        </div>
        <NovoAgendamentoBtn linkedPets={linkedPets} />
      </header>

      {/* ── Semana ── */}
      <Card pad={false} style={{ padding: '6px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 6px' }}>
          <Label>Esta semana</Label>
          <span style={{ fontSize: 13, color: T.muted }}>{plural(proximos.filter((s: any) => s.scheduled_at >= semana.inicio && s.scheduled_at <= semana.fim).length, 'confirmado', 'confirmados')}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {semana.dias.map((d, i) => {
            const n = (porDia[d.key] ?? []).length;
            return (
              <a key={d.key} href={n ? `#dia-${d.key}` : undefined} className={`zw-day${d.hoje ? ' hoje' : ''}`} aria-label={`${DIAS[i]} ${d.dia}: ${plural(n, 'atendimento', 'atendimentos')}`}>
                <span>{DIAS[i]}</span><b>{d.dia}</b>
                <span className="zw-dots">{Array.from({ length: Math.min(n, 4) }).map((_, k) => <i key={k} />)}</span>
              </a>
            );
          })}
        </div>
      </Card>

      {/* ── Precisa de atenção ── */}
      {atrasados.length > 0 && (
        <Card pad={false} style={{ borderColor: T.amberLine }}>
          <CardHeader title={<><AlertTriangle size={18} color={T.amber} aria-hidden /> Precisa de atenção <Chip tone="amber">{atrasados.length}</Chip></>} />
          <p style={{ fontSize: 13, color: T.muted, padding: '0 18px 12px', marginTop: -6 }}>
            Estes horários já passaram e continuam como confirmados. Conte o que aconteceu para manter agenda e financeiro certos.
          </p>
          {atrasados.map((s: any) => (
            <div key={s.id} className="zw-row" style={{ flexWrap: 'wrap' }}>
              <IconBox icon={servicoDe(s.service_type).icon} bg={T.amberDim} fg={T.amber} />
              <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{servicoDe(s.service_type).label} de {nomesPets(s.pet_ids)}</span>
                <span style={{ fontSize: 13, color: T.muted }}>
                  {dataCurta(s.scheduled_at)} às {hora(s.scheduled_at)}{ownerNames[s.owner_id] ? ` · ${ownerNames[s.owner_id]}` : ''}
                </span>
              </div>
              <ResolverAtrasado scheduleId={s.id} />
            </div>
          ))}
        </Card>
      )}

      {/* ── Solicitações ── */}
      {solicitacoes.length > 0 && (
        <Card pad={false}>
          <CardHeader title={<><Inbox size={18} color={T.amber} aria-hidden /> Solicitações <Chip tone="amber">{solicitacoes.length}</Chip></>} />
          {solicitacoes.map((s: any) => (
            <Linha key={s.id} s={s}>
              <div style={{ alignSelf: 'center' }}><BotoesAgendamento scheduleId={s.id} /></div>
            </Linha>
          ))}
        </Card>
      )}

      {/* ── Próximos ── */}
      <Card pad={false}>
        <CardHeader title={<><CalendarDays size={18} color={T.accent} aria-hidden /> Próximos</>} />
        {diasOrdenados.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Nada confirmado pela frente"
            text="Quando você aceitar uma solicitação ou criar um agendamento, ele aparece aqui organizado por dia."
          />
        ) : diasOrdenados.map((key) => (
          <div key={key} id={`dia-${key}`}>
            <div style={{ padding: '12px 18px 6px', borderTop: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'capitalize', color: key === hojeKey ? T.accentLt : T.text }}>
                {tituloDia(key, hojeKey, amanhaKey)}
              </span>
              <span style={{ fontSize: 12, color: T.label }}>{plural(porDia[key].length, 'atendimento', 'atendimentos')}</span>
            </div>
            {porDia[key].map((s: any) => <Linha key={s.id} s={s} />)}
          </div>
        ))}
      </Card>

      {/* ── Histórico do mês ── */}
      <Card pad={false}>
        <CardHeader
          title={<><History size={18} color={T.muted} aria-hidden /> Histórico de {nomeMes}</>}
          extra={<MonthNav viewMonth={viewMonth} viewYear={viewYear} basePath="/dashboard/agenda" />}
        />
        {pastRows.length > 0 && (
          <p style={{ fontSize: 13, color: T.muted, padding: '0 18px 12px', marginTop: -6 }}>
            {plural(concluidosMes, 'concluído', 'concluídos')} · {plural(pastRows.length - concluidosMes, 'cancelado', 'cancelados')}
          </p>
        )}
        {pastRows.length === 0 ? (
          <EmptyState icon={History} title={`Nenhum atendimento em ${nomeMes} de ${viewYear}`} text="Atendimentos concluídos e cancelados do mês aparecem aqui." />
        ) : pastRows.map((s: any) => (
          <div key={s.id} style={{ opacity: s.status === 'cancelled' ? 0.55 : 1 }}>
            <Linha s={s}>
              <div style={{ alignSelf: 'center', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: T.label }}>{dataCurta(s.scheduled_at)}</span>
                <Chip tone={STATUS[s.status as ScheduleStatus].tone}>{STATUS[s.status as ScheduleStatus].label}</Chip>
              </div>
            </Linha>
          </div>
        ))}
      </Card>
    </div>
  );
}
