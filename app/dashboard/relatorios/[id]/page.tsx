import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { T, Card, CardHeader, Chip, EmptyState, Avatar, Label, corPorNome } from '@/components/walker/dash-ui';
import { decimal, duracao, hora, km, dataCurta } from '@/lib/format';
import {
  ArrowLeft, Camera, CheckCheck, CircleDot, Droplet, MapPinOff, PawPrint, Send, Smile, StickyNote,
  TrendingDown, TrendingUp, type LucideIcon,
} from 'lucide-react';

const EVENT_META: Record<string, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  pee:         { label: 'Xixi',      icon: Droplet,       color: '#93C5FD', bg: 'rgba(147,197,253,0.14)' },
  poop:        { label: 'Cocô',      icon: CircleDot,     color: '#FBBF24', bg: 'rgba(251,191,36,0.14)' },
  interaction: { label: 'Interação', icon: PawPrint,      color: '#86EFAC', bg: 'rgba(134,239,172,0.12)' },
  mood:        { label: 'Humor',     icon: Smile,         color: '#C4B5FD', bg: 'rgba(196,181,253,0.14)' },
  note:        { label: 'Nota',      icon: StickyNote,    color: '#A3BCB0', bg: 'rgba(163,188,176,0.12)' },
};

const TZ = 'America/Sao_Paulo';
const dataLonga = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });

export default async function RelatoriDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: report } = await supabase
    .from('walk_reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!report) notFound();

  // Buscar dados relacionados em paralelo
  const [eventsRes, petsRes, ownerRes, prevReportsRes] = await Promise.all([
    report.session_id
      ? supabase.from('walk_events')
          .select('id, type, pet_id, value, recorded_at')
          .eq('session_id', report.session_id)
          .order('recorded_at', { ascending: true })
      : Promise.resolve({ data: [] }),

    (report.pet_ids?.length ?? 0) > 0
      ? supabase.from('pets').select('id, name, breed, species, photo_uri').in('id', report.pet_ids)
      : Promise.resolve({ data: [] }),

    supabase.from('user_profiles').select('name').eq('user_id', report.owner_id).maybeSingle(),

    // Últimos 5 relatórios do mesmo walker para comparativo
    supabase.from('walk_reports')
      .select('id, duration_minutes, distance_meters, pee_count, poop_count, created_at')
      .eq('walker_id', report.walker_id)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const events     = (eventsRes.data ?? []) as any[];
  const pets       = (petsRes.data ?? []) as any[];
  const ownerName  = (ownerRes.data as any)?.name ?? '—';
  const prevReports = (prevReportsRes.data ?? []) as any[];

  // Mapa de nome dos pets
  const petMap: Record<string, any> = {};
  pets.forEach((p: any) => { petMap[p.id] = p; });

  // Agrupar eventos por pet
  const eventsByPet: Record<string, any[]> = {};
  (report.pet_ids ?? []).forEach((pid: string) => { eventsByPet[pid] = []; });
  events.forEach((ev: any) => {
    if (!eventsByPet[ev.pet_id]) eventsByPet[ev.pet_id] = [];
    eventsByPet[ev.pet_id].push(ev);
  });

  // Comparativo com média dos últimos passeios
  const avgDuration = prevReports.length
    ? Math.round(prevReports.reduce((s: number, r: any) => s + (r.duration_minutes ?? 0), 0) / prevReports.length)
    : null;
  const avgDistance = prevReports.length
    ? Math.round(prevReports.reduce((s: number, r: any) => s + (r.distance_meters ?? 0), 0) / prevReports.length)
    : null;

  const durationDiff = avgDuration && report.duration_minutes ? report.duration_minutes - avgDuration : null;
  const distanceDiff = avgDistance && report.distance_meters  ? report.distance_meters  - avgDistance  : null;

  const photos: string[] = report.photos ?? [];
  const media = (k: 'pee_count' | 'poop_count') =>
    prevReports.length ? decimal(prevReports.reduce((acc: number, r: any) => acc + (r[k] ?? 0), 0) / prevReports.length) : '—';

  const stats = [
    { label: 'Duração', value: duracao(report.duration_minutes), diff: durationDiff, fmt: (v: number) => duracao(Math.abs(v)) },
    { label: 'Distância', value: km(report.distance_meters) ?? '—', diff: distanceDiff, fmt: (v: number) => km(Math.abs(v)) ?? '0 km' },
    { label: 'Xixi · Cocô', value: `${report.pee_count ?? 0} · ${report.poop_count ?? 0}`, diff: null, fmt: null },
    { label: 'Fotos', value: String(photos.length), diff: null, fmt: null },
  ];

  const th = (txt: string, center = false) => (
    <th key={txt} style={{ padding: '10px 18px', textAlign: center ? 'center' : 'left', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.label, borderBottom: `1px solid ${T.line}` }}>{txt}</th>
  );
  const td = (v: ReactNode, opts: { center?: boolean; strong?: boolean; color?: string } = {}) => (
    <td style={{ padding: '11px 18px', textAlign: opts.center ? 'center' : 'left', color: opts.color ?? (opts.strong ? T.text : T.muted), fontWeight: opts.strong ? 700 : 500, fontVariantNumeric: 'tabular-nums' }}>{v}</td>
  );

  return (
    <div className="zw-page">
      {/* ── Cabeçalho ── */}
      <header className="zw-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link href="/dashboard/relatorios" style={{ fontSize: 14, color: T.accentLt, textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
          <ArrowLeft size={16} aria-hidden /> Relatórios
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Passeio com {pets.map((p: any) => p.name).join(', ') || 'pet'}
            </h1>
            <span style={{ fontSize: 14, color: T.muted, textTransform: 'capitalize' }}>
              {dataLonga(report.created_at)} · {hora(report.created_at)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {report.sent_at && <Chip tone="neutral"><Send size={12} aria-hidden /> Enviado {dataCurta(report.sent_at)}</Chip>}
            {report.read_at
              ? <Chip><CheckCheck size={12} aria-hidden /> Lido pelo tutor</Chip>
              : report.sent_at ? <Chip tone="amber">Ainda não lido</Chip> : null}
          </div>
        </div>
      </header>

      {/* ── Tutor e pets ── */}
      <div className="zw-grid-2 zw-in">
        <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={ownerName} size={44} bg={corPorNome(ownerName)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Label>Tutor</Label>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{ownerName}</span>
          </div>
        </Card>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Label>{pets.length === 1 ? 'Pet do passeio' : 'Pets do passeio'}</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {pets.map((pet: any) => (
              <div key={pet.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={pet.name} src={pet.photo_uri} size={32} bg={corPorNome(pet.name)} />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{pet.name}</span>
                  {pet.breed && <span style={{ fontSize: 12, color: T.muted }}>{pet.breed}</span>}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Números ── */}
      <div className="zw-grid-kpi zw-in">
        {stats.map(({ label, value, diff, fmt }) => (
          <Card key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{label}</Label>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            {diff !== null && fmt && diff !== 0 && (
              <span style={{ fontSize: 13, color: diff > 0 ? T.accentLt : T.amber, display: 'flex', alignItems: 'center', gap: 5 }}>
                {diff > 0 ? <TrendingUp size={14} aria-hidden /> : <TrendingDown size={14} aria-hidden />}
                {fmt(diff)} {diff > 0 ? 'acima' : 'abaixo'} da média
              </span>
            )}
          </Card>
        ))}
      </div>

      {!report.distance_meters && (
        <span style={{ fontSize: 13, color: T.label, display: 'flex', alignItems: 'center', gap: 6, marginTop: -6 }}>
          <MapPinOff size={14} aria-hidden /> Rota não registrada: a distância aparece quando o passeio é feito com o GPS do app ligado.
        </span>
      )}

      <div className="zw-grid-2">
        {/* ── Linha do tempo ── */}
        <Card pad={false}>
          <CardHeader title="Linha do tempo" extra={<span style={{ fontSize: 13, color: T.muted }}>{events.length} {events.length === 1 ? 'evento' : 'eventos'}</span>} />
          {events.length === 0 ? (
            <EmptyState icon={PawPrint} title="Nenhum evento registrado" text="Xixi, cocô, humor e notas marcados durante o passeio aparecem aqui." />
          ) : (report.pet_ids ?? []).map((pid: string) => {
            const petEvents = eventsByPet[pid] ?? [];
            if (petEvents.length === 0) return null;
            const pet = petMap[pid];
            return (
              <div key={pid}>
                {(report.pet_ids ?? []).length > 1 && (
                  <div style={{ padding: '10px 18px', borderTop: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{pet?.name ?? 'Pet'}</span>
                    <span style={{ fontSize: 12, color: T.label }}>{petEvents.length} eventos</span>
                  </div>
                )}
                <ol style={{ listStyle: 'none', padding: '6px 18px 14px', borderTop: `1px solid ${T.line}` }}>
                  {petEvents.map((ev: any, i: number) => {
                    const meta = EVENT_META[ev.type] ?? { label: ev.type, icon: CircleDot, color: T.muted, bg: 'rgba(255,255,255,0.06)' };
                    const last = i === petEvents.length - 1;
                    return (
                      <li key={ev.id} style={{ display: 'flex', gap: 12, position: 'relative', paddingTop: 10 }}>
                        {!last && <span aria-hidden style={{ position: 'absolute', left: 14, top: 40, bottom: -10, width: 2, background: T.line }} />}
                        <span style={{ width: 30, height: 30, borderRadius: '50%', background: meta.bg, color: meta.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <meta.icon size={15} aria-hidden />
                        </span>
                        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{meta.label}</span>
                            <span style={{ fontSize: 12, color: T.label, fontVariantNumeric: 'tabular-nums' }}>{hora(ev.recorded_at)}</span>
                          </div>
                          {ev.value && <p style={{ fontSize: 13, color: T.muted, marginTop: 2, lineHeight: 1.5 }}>{ev.value}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* ── Fotos ── */}
          <Card pad={false}>
            <CardHeader title={<><Camera size={18} color={T.accent} aria-hidden /> Fotos</>} extra={photos.length ? <span style={{ fontSize: 13, color: T.muted }}>{photos.length}</span> : undefined} />
            {photos.length === 0 ? (
              <EmptyState icon={Camera} title="Sem fotos neste passeio" text="Fotos tiradas pelo app durante o passeio são enviadas junto com o relatório." />
            ) : (
              <div style={{ padding: '0 18px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                {photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', border: `1px solid ${T.line}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Foto ${i + 1} do passeio`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </a>
                ))}
              </div>
            )}
          </Card>

          {/* ── Observações ── */}
          {report.notes && (
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Observações</Label>
              <p style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{report.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* ── Comparativo ── */}
      {prevReports.length > 0 && (
        <Card pad={false}>
          <CardHeader title="Comparado aos últimos passeios" extra={<span style={{ fontSize: 13, color: T.muted }}>{prevReports.length} anteriores</span>} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr>{th('Data')}{th('Duração')}{th('Distância', true)}{th('Xixi', true)}{th('Cocô', true)}</tr>
              </thead>
              <tbody>
                <tr style={{ background: T.accentDim }}>
                  {td('Este passeio', { strong: true, color: T.accentLt })}
                  {td(duracao(report.duration_minutes), { strong: true })}
                  {td(km(report.distance_meters) ?? '—', { center: true, strong: true })}
                  {td(report.pee_count ?? 0, { center: true, strong: true })}
                  {td(report.poop_count ?? 0, { center: true, strong: true })}
                </tr>
                {prevReports.map((r: any) => (
                  <tr key={r.id} style={{ borderTop: `1px solid ${T.line}` }}>
                    {td(<Link href={`/dashboard/relatorios/${r.id}`} style={{ color: T.muted, textDecoration: 'none' }}>{dataCurta(r.created_at)}</Link>)}
                    {td(duracao(r.duration_minutes))}
                    {td(km(r.distance_meters) ?? '—', { center: true })}
                    {td(r.pee_count ?? 0, { center: true })}
                    {td(r.poop_count ?? 0, { center: true })}
                  </tr>
                ))}
                <tr style={{ borderTop: `1px solid ${T.lineStrong}` }}>
                  {td('Média', { strong: true })}
                  {td(duracao(avgDuration))}
                  {td(km(avgDistance) ?? '—', { center: true })}
                  {td(media('pee_count'), { center: true })}
                  {td(media('poop_count'), { center: true })}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
