import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { MapPin, MapPinOff, Lock, CheckCheck, Send, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { MonthNav } from '../financeiro/MonthNav';
import { T, Card, CardHeader, Kpi, Chip, EmptyState, Label } from '@/components/walker/dash-ui';
import { duracao, km, plural, dataCurta, hora } from '@/lib/format';

const SERVICE_LABEL: Record<string, string> = {
  walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem',
  daycare: 'Day Care', vet_visit: 'Visita Veterinária', training: 'Adestramento',
};



export default async function RelatoriosPage({ searchParams }: { searchParams?: Promise<{ mes?: string; ano?: string; r?: string }> }) {
  const sp = await (searchParams ?? Promise.resolve({} as { mes?: string; ano?: string; r?: string }));
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
    .from('walker_profiles').select('id, plan').eq('user_id', user.id).single();

  const isPro = profile?.plan === 'pro';

  const [{ data: reports }, { data: doneSchedules }] = await Promise.all([
    profile?.id
      ? supabase.from('walk_reports')
          .select('id, session_id, created_at, sent_at, read_at, duration_minutes, distance_meters, pee_count, poop_count, note_count, photos, notes, pet_ids, owner_id')
          .eq('walker_id', profile.id)
          .gte('created_at', filterStart)
          .lte('created_at', filterEnd)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    profile?.id
      ? supabase.from('walk_schedules')
          .select('id, scheduled_at, duration_minutes, pet_ids, owner_id, walker_services(type, label)')
          .eq('walker_id', profile.id)
          .eq('status', 'done')
          .gte('scheduled_at', filterStart)
          .lte('scheduled_at', filterEnd)
          .order('scheduled_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const rows = (reports ?? []) as any[];
  const scheduleRows = (doneSchedules ?? []) as any[];

  // Buscar nomes dos pets (de ambas as fontes)
  const allPetIds = [...new Set([
    ...rows.flatMap((r: any) => r.pet_ids ?? []),
    ...scheduleRows.flatMap((s: any) => s.pet_ids ?? []),
  ])];
  let petNames: Record<string, string> = {};
  if (allPetIds.length > 0) {
    const { data: petsData } = await supabase
      .from('pets').select('id, name').in('id', allPetIds);
    (petsData ?? []).forEach((p: any) => { petNames[p.id] = p.name; });
  }

  // Buscar nomes dos tutores (de ambas as fontes)
  const ownerIds = [...new Set([
    ...rows.map((r: any) => r.owner_id),
    ...scheduleRows.map((s: any) => s.owner_id),
  ].filter(Boolean))];
  let ownerNames: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from('user_profiles').select('user_id, name').in('user_id', ownerIds);
    (owners ?? []).forEach((o: any) => { ownerNames[o.user_id] = o.name; });
  }

  // Relatório selecionado (painel ao lado da lista) e seus eventos
  const sel = rows.find((r: any) => r.id === sp.r) ?? rows[0] ?? null;
  const { data: selEvents } = sel?.session_id
    ? await supabase.from('walk_events').select('id, type, pet_id, value, recorded_at').eq('session_id', sel.session_id).order('recorded_at', { ascending: true })
    : { data: [] as any[] };
  const { data: selSession } = sel?.session_id
    ? await supabase.from('walk_sessions').select('started_at, ended_at').eq('id', sel.session_id).maybeSingle()
    : { data: null as any };
  const qs = (id: string) => `/dashboard/relatorios?mes=${viewMonth + 1}&ano=${viewYear}&r=${id}`;

  // Totais do mês
  const totalDist = rows.reduce((s: number, r: any) => s + (r.distance_meters ?? 0), 0);
  const totalMin  = rows.reduce((s: number, r: any) => s + (r.duration_minutes ?? 0), 0);

  const NOMES_MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const semRota = rows.filter((r: any) => !r.distance_meters || r.distance_meters <= 0).length;
  const nomesPets = (ids: string[] | null) => (ids ?? []).map((id) => petNames[id]).filter(Boolean).join(' e ') || 'Pet';

  return (
    <div className="zw-page">
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Relatórios</h1>
          <MonthNav viewMonth={viewMonth} viewYear={viewYear} basePath="/dashboard/relatorios" />
        </div>
        {!isPro && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.muted }}>
            <Lock size={15} aria-hidden /> No plano grátis: últimos 7 dias.
            <a href="/dashboard/pro" style={{ color: T.accentLt, fontWeight: 700, textDecoration: 'none' }}>Ver tudo com o Pro</a>
          </span>
        )}
      </header>

      <div className="zw-grid-kpi">
        <Kpi label="Passeios" value={String(rows.length)} sub={rows.length ? `média de ${duracao(Math.round(totalMin / rows.length))}` : `em ${NOMES_MES[viewMonth]}`} />
        <Kpi label="Outros atendimentos" value={String(scheduleRows.length)} sub="banho, adestramento e outros" />
        <Kpi label="Tempo total" value={duracao(totalMin)} sub="somando os passeios" />
        <Kpi label="Distância" value={km(totalDist) ?? '0,0 km'} sub={km(totalDist) ? 'percorridos com GPS' : 'nenhuma rota gravada'} />
      </div>

      {semRota > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(251,191,36,0.08)', border: `1px solid ${T.amberLine}` }}>
          <MapPinOff size={22} color={T.amber} aria-hidden />
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{plural(semRota, 'passeio ficou', 'passeios ficaram')} sem rota registrada</span>
            <span style={{ fontSize: 13, color: T.muted }}>O tutor recebe o relatório sem mapa. Confira se a localização do app está ativa durante o passeio.</span>
          </div>
        </div>
      )}

      {rows.length === 0 && scheduleRows.length === 0 && (
        <Card><EmptyState icon={MapPin} title={`Nenhum relatório em ${NOMES_MES[viewMonth]}`} text="Os relatórios aparecem aqui quando você finaliza um passeio ou atendimento no app." /></Card>
      )}

      {/* Relatórios de passeio: lista + painel de detalhe */}
      {rows.length > 0 && sel && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((r: any) => {
              const dist = km(r.distance_meters);
              const ativo = r.id === sel.id;
              const eventos = [r.pee_count ? `Xixi ${r.pee_count}` : null, r.poop_count ? `Cocô ${r.poop_count}` : null].filter(Boolean).join(' · ');
              return (
                <Link
                  key={r.id}
                  href={qs(r.id)}
                  scroll={false}
                  aria-current={ativo ? 'true' : undefined}
                  style={{
                    display: 'flex', gap: 14, alignItems: 'center', padding: 12, borderRadius: 14, textDecoration: 'none', color: T.text,
                    background: T.card2, border: `1px solid ${ativo ? T.accent : T.line}`, boxShadow: ativo ? `0 0 0 1px ${T.accent}` : 'none',
                  }}
                >
                  <span style={{ width: 84, height: 64, borderRadius: 10, background: '#0F1D18', flexShrink: 0, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="84" height="64" viewBox="0 0 84 64" fill="none" aria-hidden style={{ position: 'absolute', inset: 0 }}><path d="M0 20H84M0 46H84M28 0V64M60 0V64" stroke="rgba(255,255,255,0.05)" strokeWidth="4" /></svg>
                    {dist
                      ? <span style={{ position: 'relative', fontSize: 12, fontWeight: 800, color: T.accentLt }}>{dist}</span>
                      : <span style={{ position: 'relative', fontSize: 10, fontWeight: 800, color: T.amber }}>sem rota</span>}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{nomesPets(r.pet_ids)} · {dataCurta(r.created_at)}</span>
                    {ownerNames[r.owner_id] && <span style={{ fontSize: 13, color: T.muted }}>{ownerNames[r.owner_id]}</span>}
                    <span style={{ fontSize: 12, color: T.muted }}>{[duracao(r.duration_minutes), eventos, r.photos?.length ? plural(r.photos.length, 'foto', 'fotos') : null].filter(Boolean).join(' · ')}</span>
                  </span>
                  {r.read_at ? <Chip>Lido</Chip> : r.sent_at ? <Chip>Enviado</Chip> : <Chip tone="neutral">Rascunho</Chip>}
                </Link>
              );
            })}
          </div>

          <ReportPanel r={sel} events={selEvents ?? []} session={selSession} petNames={petNames} ownerName={ownerNames[sel.owner_id]} />
        </div>
      )}

      {/* Outros atendimentos concluídos */}
      {scheduleRows.length > 0 && (
        <Card pad={false} style={{ marginBottom: 8 }}>
          <CardHeader title="Outros atendimentos concluídos" />
          {scheduleRows.map((s: any) => {
            const svc = s.walker_services;
            return (
              <div key={s.id} className="zw-row" style={{ flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{SERVICE_LABEL[svc?.type] ?? svc?.label ?? 'Atendimento'} · {nomesPets(s.pet_ids)}</span>
                  <span style={{ fontSize: 13, color: T.muted }}>{dataCurta(s.scheduled_at)}{ownerNames[s.owner_id] ? ` · ${ownerNames[s.owner_id]}` : ''}</span>
                </div>
                {s.duration_minutes && <Chip tone="neutral">{duracao(s.duration_minutes)}</Chip>}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}


const EVENT_META: Record<string, { label: string; color: string }> = {
  pee: { label: 'Xixi', color: '#60A5FA' },
  poop: { label: 'Cocô', color: '#A78BFA' },
  interaction: { label: 'Interação', color: '#86EFAC' },
  mood: { label: 'Humor', color: '#F9A8D4' },
  note: { label: 'Nota', color: '#A3BCB0' },
};

function ReportPanel({ r, events, session, petNames, ownerName }: { r: any; events: any[]; session: any; petNames: Record<string, string>; ownerName?: string }) {
  const dist = km(r.distance_meters);
  const pets = (r.pet_ids ?? []).map((id: string) => petNames[id]).filter(Boolean).join(' e ') || 'Pet';
  const multiPet = (r.pet_ids ?? []).length > 1;
  const linha: { t: string; h: string; c: string; sub?: string | null }[] = [];
  if (session?.started_at) linha.push({ t: 'Início do passeio', h: hora(session.started_at), c: T.accent });
  events.forEach((ev: any) => {
    const m = EVENT_META[ev.type] ?? { label: ev.type, color: T.muted };
    linha.push({ t: multiPet && petNames[ev.pet_id] ? `${m.label} · ${petNames[ev.pet_id]}` : m.label, h: hora(ev.recorded_at), c: m.color, sub: ev.value });
  });
  if (session?.ended_at) linha.push({ t: 'Fim do passeio', h: hora(session.ended_at), c: T.accent });
  if (r.sent_at) linha.push({ t: 'Relatório enviado ao tutor', h: hora(r.sent_at), c: T.accent });
  if (r.read_at) linha.push({ t: 'Lido pelo tutor', h: `${dataCurta(r.read_at)} ${hora(r.read_at)}`, c: T.accentLt });

  return (
    <Card pad={false} style={{ flex: '1 1 420px', minWidth: 0 }}>
      {/* Área do mapa: o app hoje salva só a distância, não o trajeto */}
      <div style={{ position: 'relative', height: 200, background: '#0F1D18', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
        <svg width="100%" height="200" viewBox="0 0 420 200" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden style={{ position: 'absolute', inset: 0 }}>
          <path d="M0 60H420M0 140H420M90 0V200M210 0V200M330 0V200" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <path d="M0 100H420M150 0V200M270 0V200" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
        </svg>
        {dist ? (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <MapPin size={22} color={T.accent} aria-hidden />
            <span style={{ fontSize: 28, fontWeight: 800 }}>{dist}</span>
            <span style={{ fontSize: 12, color: T.muted }}>percorridos neste passeio</span>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <MapPinOff size={22} color={T.amber} aria-hidden />
            <span style={{ fontSize: 15, fontWeight: 800, color: T.amber }}>Rota não registrada</span>
            <span style={{ fontSize: 13, color: T.muted, maxWidth: 300 }}>O GPS não gravou distância neste passeio. Os eventos e a duração foram salvos.</span>
          </div>
        )}
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label>{new Date(r.created_at).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'America/Sao_Paulo' })} · {hora(r.created_at)}</Label>
            <span style={{ fontSize: 20, fontWeight: 800 }}>Passeio com {pets}</span>
            {ownerName && <span style={{ fontSize: 13, color: T.muted }}>Tutor: {ownerName}</span>}
          </div>
          <Link href={`/dashboard/relatorios/${r.id}`} className="zw-btn zw-btn-ghost zw-btn-s"><ExternalLink size={14} aria-hidden />Relatório completo</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {[['Duração', duracao(r.duration_minutes)], ['Distância', dist ?? '—'], ['Fotos', String(r.photos?.length ?? 0)]].map(([l, v]) => (
            <div key={l} style={{ padding: 12, borderRadius: 12, background: T.card2 }}>
              <Label>{l}</Label>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>

        {r.photos?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
            {r.photos.map((url: string, j: number) => (
              <a key={j} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto ${j + 1} do passeio`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </a>
            ))}
          </div>
        )}

        {r.notes && <span style={{ fontSize: 14, color: T.muted, fontStyle: 'italic' }}>&ldquo;{r.notes}&rdquo;</span>}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8 }}><Label>Linha do tempo</Label></div>
          {linha.length === 0 && <span style={{ fontSize: 13, color: T.muted }}>Nenhum evento registrado neste passeio.</span>}
          {linha.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.c, marginTop: 4 }} />
                {i < linha.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 22, background: T.line }} />}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 10, paddingBottom: 10 }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t.t}</span>
                  {t.sub && <span style={{ fontSize: 12, color: T.muted }}>{t.sub}</span>}
                </span>
                <span style={{ fontSize: 13, color: T.muted, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{t.h}</span>
              </div>
            </div>
          ))}
        </div>

        {r.sent_at && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: r.read_at ? T.accentLt : T.muted }}>
            {r.read_at ? <CheckCheck size={16} aria-hidden /> : <Send size={14} aria-hidden />}
            {r.read_at ? 'O tutor já viu este relatório' : 'Enviado ao tutor, ainda não lido'}
          </span>
        )}
      </div>
    </Card>
  );
}
