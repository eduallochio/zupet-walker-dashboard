import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { formatDate, formatDuration } from '@/lib/utils';

const C = {
  card: '#132219', border: 'rgba(0,200,167,0.12)',
  accent: '#00C6A7', accentDim: 'rgba(0,198,167,0.12)',
  text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
  success: '#22D3A5',
};

export default async function RelatoriosPage() {
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

  const [{ data: reports }, { data: doneSchedules }] = await Promise.all([
    profile?.id
      ? supabase.from('walk_reports')
          .select('id, created_at, duration_minutes, distance_meters, pee_count, poop_count, note_count, photos, notes, pet_ids, owner_id')
          .eq('walker_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
    profile?.id
      ? supabase.from('walk_schedules')
          .select('id, scheduled_at, duration_minutes, pet_ids, owner_id, walker_services(type, label)')
          .eq('walker_id', profile.id)
          .eq('status', 'done')
          .order('scheduled_at', { ascending: false })
          .limit(50)
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

  // Totais gerais
  const totalDist = rows.reduce((s: number, r: any) => s + (r.distance_meters ?? 0), 0);
  const totalMin  = rows.reduce((s: number, r: any) => s + (r.duration_minutes ?? 0), 0);

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 28 }}>
        Relatórios e Atendimentos
      </h1>

      {/* Resumo geral */}
      {rows.length > 0 && (
        <div className="db-stat-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Passeios', value: String(rows.length) },
            { label: 'Atendimentos', value: String(scheduleRows.length) },
            { label: 'Tempo total', value: totalMin >= 60 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}min` : `${totalMin}min` },
            { label: 'Distância total', value: `${(totalDist / 1000).toFixed(1)} km` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 10 }}>{label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {!rows.length && !scheduleRows.length && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '48px 20px', textAlign: 'center', color: C.textSec, fontSize: 14 }}>
          Nenhum relatório ainda.
        </div>
      )}

      {/* Atendimentos concluídos */}
      {scheduleRows.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Atendimentos concluídos</h2>
          </div>
          <ul style={{ listStyle: 'none' }}>
            {scheduleRows.map((s: any, i: number) => {
              const svc = s.walker_services;
              const SERVICE_LABEL: Record<string, string> = {
                walk: '🦮 Passeio', bath: '🛁 Banho e Tosa', boarding: '🌙 Hospedagem',
                daycare: '🏠 Creche', vet_visit: '🏥 Visita ao Vet', training: '🎯 Adestramento',
              };
              const pets = (s.pet_ids ?? []).map((id: string) => petNames[id] ?? id);
              return (
                <li key={s.id} style={{ padding: '14px 20px', borderTop: i > 0 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>
                        {new Date(s.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </p>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.accent, background: C.accentDim, padding: '2px 8px', borderRadius: 20 }}>
                        {SERVICE_LABEL[svc?.type] ?? svc?.label ?? '—'}
                      </span>
                    </div>
                    {ownerNames[s.owner_id] && (
                      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 4 }}>👤 {ownerNames[s.owner_id]}</p>
                    )}
                    {pets.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {pets.map((name: string, j: number) => (
                          <span key={j} style={{ fontSize: 11, fontWeight: 600, color: C.accent, background: C.accentDim, padding: '2px 8px', borderRadius: 20 }}>
                            🐾 {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {s.duration_minutes && (
                    <span style={{ fontSize: 12, color: C.textSec, background: 'rgba(0,198,167,0.08)', border: `1px solid ${C.border}`, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
                      {formatDuration(s.duration_minutes)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Lista de passeios com GPS */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {rows.length > 0 && (
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Relatórios de passeio</h2>
          </div>
        )}
        <ul>
          {rows.map((r: any, i: number) => {
            const pets = (r.pet_ids ?? []).map((id: string) => petNames[id] ?? id);
            const owner = ownerNames[r.owner_id];
            return (
              <li key={r.id} style={{ padding: '16px 20px', borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{formatDate(r.created_at)}</p>
                    {owner && <p style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>👤 {owner}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: C.textSec, background: 'rgba(0,198,167,0.08)', border: `1px solid ${C.border}`, padding: '3px 10px', borderRadius: 20 }}>
                      {formatDuration(r.duration_minutes)}
                    </span>
                    <a href={`/dashboard/relatorios/${r.id}`} style={{ fontSize: 12, fontWeight: 600, color: C.accent, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Ver detalhes →
                    </a>
                  </div>
                </div>

                {pets.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {pets.map((name: string, j: number) => (
                      <span key={j} style={{ fontSize: 12, fontWeight: 600, color: C.accent, background: C.accentDim, padding: '2px 10px', borderRadius: 20 }}>
                        🐾 {name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 flex-wrap" style={{ fontSize: 13, color: C.textMuted }}>
                  {r.distance_meters > 0  && <span>📍 {(r.distance_meters / 1000).toFixed(1)} km</span>}
                  {r.pee_count > 0        && <span>💧 {r.pee_count} xixi</span>}
                  {r.poop_count > 0       && <span>💩 {r.poop_count} cocô</span>}
                  {r.note_count > 0       && <span>📝 {r.note_count} nota{r.note_count > 1 ? 's' : ''}</span>}
                </div>

                {r.notes && (
                  <p style={{ marginTop: 8, fontSize: 13, color: C.textSec, fontStyle: 'italic' }}>{r.notes}</p>
                )}

                {r.photos?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {r.photos.map((url: string, j: number) => (
                      <img key={j} src={url} alt="foto do passeio"
                        style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}` }} />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
