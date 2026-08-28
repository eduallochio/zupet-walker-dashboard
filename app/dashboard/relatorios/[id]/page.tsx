import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const C = {
  card: '#132219', border: 'rgba(0,200,167,0.12)',
  accent: '#00C6A7', accentDim: 'rgba(0,198,167,0.12)',
  text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
  success: '#22D3A5', warning: '#F59E0B',
};

const EVENT_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  pee:         { emoji: '💧', label: 'Xixi',      color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
  poop:        { emoji: '💩', label: 'Cocô',      color: '#fbbf24', bg: 'rgba(251,191,36,0.15)'  },
  interaction: { emoji: '🐾', label: 'Interação', color: '#22D3A5', bg: 'rgba(34,211,165,0.12)' },
  mood:        { emoji: '😊', label: 'Humor',     color: '#c084fc', bg: 'rgba(192,132,252,0.15)' },
  note:        { emoji: '📝', label: 'Nota',      color: '#7FA898', bg: 'rgba(127,168,152,0.12)' },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(min: number | null) {
  if (!min) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

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

  const photos = report.photos ?? [];

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Breadcrumb + voltar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link href="/dashboard/relatorios" style={{ fontSize: 13, color: C.accent, textDecoration: 'none', fontWeight: 600 }}>
          ← Relatórios
        </Link>
        <span style={{ fontSize: 13, color: C.textMuted }}>/</span>
        <span style={{ fontSize: 13, color: C.textSec }}>Detalhe do passeio</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>
          Passeio — {new Date(report.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </h1>
        <p style={{ fontSize: 13, color: C.textSec, marginTop: 3, textTransform: 'capitalize' }}>
          {formatDateTime(report.created_at)}
        </p>
      </div>

      <div className="db-row2" style={{ marginBottom: 16 }}>
        {/* Card tutor */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.accentDim, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            👤
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 4 }}>Tutor</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{ownerName}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(34,211,165,0.15)', borderRadius: 20, padding: '4px 10px' }}>
            <span style={{ fontSize: 13 }}>✓</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.success }}>Concluído</span>
          </div>
        </div>

        {/* Card pets */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 10 }}>Pets do passeio</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {pets.map((pet: any) => (
              <div key={pet.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.accentDim, border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 12px' }}>
                <span style={{ fontSize: 14 }}>{pet.species === 'cat' ? '🐱' : '🐶'}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{pet.name}</span>
                {pet.breed && <span style={{ fontSize: 11, color: C.textSec }}>{pet.breed}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats principais */}
      <div className="db-stat-grid" style={{ marginBottom: 16 }}>
        {[
          { label: 'Duração', value: formatDuration(report.duration_minutes), diff: durationDiff, fmt: (v: number) => `${Math.abs(v)}min` },
          { label: 'Distância', value: report.distance_meters > 0 ? `${(report.distance_meters / 1000).toFixed(2)} km` : '—', diff: distanceDiff, fmt: (v: number) => `${(Math.abs(v) / 1000).toFixed(1)}km` },
          { label: 'Eventos', value: String(events.length), diff: null, fmt: null },
          { label: 'Fotos', value: String(photos.length), diff: null, fmt: null },
        ].map(({ label, value, diff, fmt }) => (
          <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 10 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
            {diff !== null && fmt && avgDuration !== null && (
              <p style={{ fontSize: 11.5, color: diff >= 0 ? C.success : C.warning, marginTop: 6 }}>
                {diff >= 0 ? '▲' : '▼'} {fmt(diff)} vs. média
              </p>
            )}
            {diff === null && avgDuration !== null && (
              <p style={{ fontSize: 11.5, color: C.textSec, marginTop: 6 }}>neste passeio</p>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: photos.length > 0 ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
        {/* Linha do tempo de eventos */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>
              Linha do tempo — {events.length} eventos
            </h2>
          </div>
          {events.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: C.textSec }}>
              Nenhum evento registrado.
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {(report.pet_ids ?? []).map((pid: string) => {
                const petEvents = eventsByPet[pid] ?? [];
                if (petEvents.length === 0) return null;
                const pet = petMap[pid];
                return (
                  <div key={pid} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: 'rgba(0,198,167,0.06)', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 14 }}>{pet?.species === 'cat' ? '🐱' : '🐶'}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{pet?.name ?? pid}</span>
                      <span style={{ fontSize: 11, color: C.textSec, marginLeft: 'auto' }}>{petEvents.length} eventos</span>
                    </div>
                    {petEvents.map((ev: any, i: number) => {
                      const meta = EVENT_META[ev.type] ?? { emoji: '•', label: ev.type, color: C.textSec, bg: 'rgba(127,168,152,0.12)' };
                      return (
                        <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 20px', borderBottom: i < petEvents.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <div style={{ flexShrink: 0, paddingTop: 2 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                              {meta.emoji}
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: meta.color }}>{meta.label}</span>
                              <span style={{ fontSize: 11, color: C.textMuted, fontVariantNumeric: 'tabular-nums' }}>{formatTime(ev.recorded_at)}</span>
                            </div>
                            {ev.value && (
                              <p style={{ fontSize: 12, color: C.textSec, marginTop: 2, lineHeight: 1.5 }}>{ev.value}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fotos */}
        {photos.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>
                Fotos do passeio ({photos.length})
              </h2>
            </div>
            <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {photos.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', border: `1px solid ${C.border}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Obs. gerais */}
      {report.notes && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Observações do passeio</h2>
          </div>
          <p style={{ padding: '16px 20px', fontSize: 14, color: C.textSec, lineHeight: 1.6, fontStyle: 'italic' }}>{report.notes}</p>
        </div>
      )}

      {/* Comparativo com passeios anteriores */}
      {prevReports.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>
              Comparativo — últimos {prevReports.length} passeios
            </h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,198,167,0.06)' }}>
                  {['Data', 'Duração', 'Distância', '💧', '💩'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: i > 1 ? 'center' : 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'rgba(0,198,167,0.08)', borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 20px', fontWeight: 700, color: C.accent }}>Este passeio</td>
                  <td style={{ padding: '12px 20px', color: C.text, fontWeight: 600 }}>{formatDuration(report.duration_minutes)}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', color: C.text, fontWeight: 600 }}>{report.distance_meters > 0 ? `${(report.distance_meters / 1000).toFixed(1)} km` : '—'}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 600, color: C.text }}>{report.pee_count}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: 600, color: C.text }}>{report.poop_count}</td>
                </tr>
                {prevReports.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '11px 20px', color: C.textSec }}>
                      {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td style={{ padding: '11px 20px', color: C.textSec }}>{formatDuration(r.duration_minutes)}</td>
                    <td style={{ padding: '11px 20px', textAlign: 'center', color: C.textSec }}>{r.distance_meters > 0 ? `${(r.distance_meters / 1000).toFixed(1)} km` : '—'}</td>
                    <td style={{ padding: '11px 20px', textAlign: 'center', color: C.textSec }}>{r.pee_count}</td>
                    <td style={{ padding: '11px 20px', textAlign: 'center', color: C.textSec }}>{r.poop_count}</td>
                  </tr>
                ))}
                <tr style={{ background: 'rgba(0,198,167,0.06)', borderTop: `2px solid ${C.border}` }}>
                  <td style={{ padding: '11px 20px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec }}>Média</td>
                  <td style={{ padding: '11px 20px', color: C.textSec, fontWeight: 600 }}>{formatDuration(avgDuration)}</td>
                  <td style={{ padding: '11px 20px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>{avgDistance ? `${(avgDistance / 1000).toFixed(1)} km` : '—'}</td>
                  <td style={{ padding: '11px 20px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>
                    {prevReports.length ? (prevReports.reduce((s: number, r: any) => s + r.pee_count, 0) / prevReports.length).toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '11px 20px', textAlign: 'center', color: C.textSec, fontWeight: 600 }}>
                    {prevReports.length ? (prevReports.reduce((s: number, r: any) => s + r.poop_count, 0) / prevReports.length).toFixed(1) : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
