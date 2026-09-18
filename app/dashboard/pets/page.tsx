import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const C = {
  card: '#132219', border: 'rgba(0,200,167,0.12)',
  accent: '#00C6A7', accentDim: 'rgba(0,198,167,0.12)',
  text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
  bg: '#0D1F18',
};

const SPECIES_ICON: Record<string, string> = {
  dog: '🐕', cat: '🐈', bird: '🐦', rabbit: '🐇', hamster: '🐹',
};

export default async function PetsPage({ searchParams }: { searchParams?: Promise<{ pet?: string }> }) {
  const sp = await (searchParams ?? Promise.resolve({} as { pet?: string }));
  const selectedPetId = sp.pet ?? null;

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
  if (!profile?.id) return null;

  const walkerId = profile.id;

  // Pets vinculados a este walker
  const { data: links } = await supabase
    .from('walker_pet_links')
    .select('pet_id, owner_id, status, linked_at, billing_override, service_id')
    .eq('walker_id', walkerId);

  const petIds = (links ?? []).map((l) => l.pet_id);

  // Dados dos pets
  const { data: petsData } = petIds.length > 0
    ? await supabase.from('pets').select('id, name, species, breed, photo_uri').in('id', petIds)
    : { data: [] };

  // Nomes dos tutores
  const ownerIds = [...new Set((links ?? []).map((l) => l.owner_id).filter(Boolean))];
  const { data: ownersData } = ownerIds.length > 0
    ? await supabase.from('user_profiles').select('user_id, name').in('user_id', ownerIds)
    : { data: [] };

  const ownerMap: Record<string, string> = {};
  (ownersData ?? []).forEach((o: any) => { ownerMap[o.user_id] = o.name; });

  const petMap: Record<string, any> = {};
  (petsData ?? []).forEach((p: any) => { petMap[p.id] = p; });

  const linkMap: Record<string, any> = {};
  (links ?? []).forEach((l) => { linkMap[l.pet_id] = l; });

  // Métricas por pet via walk_reports e walk_schedules
  const [{ data: reports }, { data: schedules }, { data: payments }] = await Promise.all([
    supabase.from('walk_reports')
      .select('id, pet_ids, duration_minutes, distance_meters, created_at')
      .eq('walker_id', walkerId),
    supabase.from('walk_schedules')
      .select('id, pet_ids, scheduled_at, amount, status, service_type')
      .eq('walker_id', walkerId)
      .eq('status', 'done'),
    supabase.from('walker_payments')
      .select('id, pet_ids, amount, status, created_at')
      .eq('walker_id', walkerId)
      .eq('status', 'paid'),
  ]);

  type PetMetrics = {
    totalWalks: number;
    totalRevenue: number;
    totalDistanceMeters: number;
    totalMinutes: number;
    serviceCount: Record<string, number>;
    lastActivity: string | null;
    walkHistory: Array<{ id: string; date: string; type: string; duration: number | null; distance: number | null; amount: number | null }>;
  };

  const metricsMap: Record<string, PetMetrics> = {};
  const ensureMetrics = (pid: string) => {
    if (!metricsMap[pid]) metricsMap[pid] = { totalWalks: 0, totalRevenue: 0, totalDistanceMeters: 0, totalMinutes: 0, serviceCount: {}, lastActivity: null, walkHistory: [] };
    return metricsMap[pid];
  };

  for (const r of reports ?? []) {
    for (const pid of r.pet_ids ?? []) {
      if (!petIds.includes(pid)) continue;
      const m = ensureMetrics(pid);
      m.totalWalks++;
      m.totalDistanceMeters += r.distance_meters ?? 0;
      m.totalMinutes += r.duration_minutes ?? 0;
      m.serviceCount['walk'] = (m.serviceCount['walk'] ?? 0) + 1;
      m.walkHistory.push({ id: r.id, date: r.created_at, type: 'walk', duration: r.duration_minutes, distance: r.distance_meters, amount: null });
      if (!m.lastActivity || r.created_at > m.lastActivity) m.lastActivity = r.created_at;
    }
  }

  for (const s of schedules ?? []) {
    for (const pid of s.pet_ids ?? []) {
      if (!petIds.includes(pid)) continue;
      const m = ensureMetrics(pid);
      const stype = s.service_type ?? 'service';
      m.serviceCount[stype] = (m.serviceCount[stype] ?? 0) + 1;
      m.walkHistory.push({ id: s.id, date: s.scheduled_at, type: stype, duration: null, distance: null, amount: s.amount });
      if (!m.lastActivity || s.scheduled_at > m.lastActivity) m.lastActivity = s.scheduled_at;
    }
  }

  for (const p of payments ?? []) {
    for (const pid of p.pet_ids ?? []) {
      if (!petIds.includes(pid)) continue;
      const m = ensureMetrics(pid);
      m.totalRevenue += Number(p.amount ?? 0);
    }
  }

  // Ordenar histórico por data desc
  for (const pid of petIds) {
    if (metricsMap[pid]) {
      metricsMap[pid].walkHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  const selectedPet = selectedPetId ? petMap[selectedPetId] : null;
  const selectedLink = selectedPetId ? linkMap[selectedPetId] : null;
  const selectedMetrics = selectedPetId ? metricsMap[selectedPetId] : null;

  const SERVICE_LABEL: Record<string, string> = {
    walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem',
    daycare: 'Creche', vet_visit: 'Visita ao Vet', training: 'Adestramento',
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

  return (
    <div style={{ padding: '28px 24px', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', marginBottom: 24 }}>
        Pets vinculados
      </h1>

      {petIds.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '48px 20px', textAlign: 'center', color: C.textSec, fontSize: 14 }}>
          Nenhum pet vinculado ainda. Os pets aparecerão aqui quando tutores aceitarem sua solicitação.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Lista de pets */}
          <div style={{ flex: '0 0 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {petIds.map((pid) => {
              const pet = petMap[pid];
              const link = linkMap[pid];
              const m = metricsMap[pid];
              if (!pet) return null;
              const isSelected = selectedPetId === pid;
              const speciesIcon = SPECIES_ICON[pet.species ?? ''] ?? '🐾';
              const ownerName = ownerMap[link?.owner_id] ?? '—';
              const isActive = link?.status === 'active';
              return (
                <Link key={pid} href={`/dashboard/pets?pet=${pid}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: isSelected ? 'rgba(0,198,167,0.14)' : C.card,
                    border: `1px solid ${isSelected ? C.accent : C.border}`,
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 10,
                      background: 'rgba(0,198,167,0.15)',
                      flexShrink: 0,
                      overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>
                      {pet.photo_uri
                        ? <img src={pet.photo_uri} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : speciesIcon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pet.name}
                        </p>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
                          background: isActive ? 'rgba(34,211,165,0.15)' : 'rgba(245,158,11,0.12)',
                          color: isActive ? '#22D3A5' : '#F59E0B',
                          flexShrink: 0,
                        }}>
                          {isActive ? 'Ativo' : link?.status === 'pending' ? 'Pendente' : link?.status ?? '—'}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 4 }}>
                        {[pet.breed, pet.species].filter(Boolean).join(' · ')}
                      </p>
                      <p style={{ fontSize: 11, color: C.textMuted }}>
                        👤 {ownerName}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: C.accent, letterSpacing: '-0.04em', lineHeight: 1 }}>
                        {m?.totalWalks ?? 0}
                      </p>
                      <p style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>passeios</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Detalhe do pet selecionado */}
          {selectedPet && selectedMetrics ? (
            <div style={{ flex: 1, minWidth: 280 }}>
              {/* Card de métricas */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: 'rgba(0,198,167,0.15)',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                  }}>
                    {selectedPet.photo_uri
                      ? <img src={selectedPet.photo_uri} alt={selectedPet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (SPECIES_ICON[selectedPet.species ?? ''] ?? '🐾')}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: 2 }}>
                      {selectedPet.name}
                    </h2>
                    <p style={{ fontSize: 12, color: C.textSec }}>
                      {[selectedPet.breed, selectedPet.species].filter(Boolean).join(' · ')}
                    </p>
                    <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                      Tutor: {ownerMap[selectedLink?.owner_id] ?? '—'}
                    </p>
                  </div>
                </div>

                <div className="db-stat-grid">
                  {[
                    { label: 'Passeios', value: String(selectedMetrics.totalWalks) },
                    { label: 'Distância total', value: selectedMetrics.totalDistanceMeters >= 1000 ? `${(selectedMetrics.totalDistanceMeters / 1000).toFixed(1)} km` : `${selectedMetrics.totalDistanceMeters} m` },
                    { label: 'Tempo total', value: selectedMetrics.totalMinutes >= 60 ? `${Math.floor(selectedMetrics.totalMinutes / 60)}h ${selectedMetrics.totalMinutes % 60}min` : selectedMetrics.totalMinutes > 0 ? `${selectedMetrics.totalMinutes}min` : '—' },
                    { label: 'Receita gerada', value: selectedMetrics.totalRevenue > 0 ? `R$ ${selectedMetrics.totalRevenue.toFixed(2).replace('.', ',')}` : 'R$ 0,00' },
                    { label: 'Último atendimento', value: selectedMetrics.lastActivity ? formatDate(selectedMetrics.lastActivity) : '—' },
                    { label: 'Vínculo desde', value: selectedLink?.linked_at ? formatDate(selectedLink.linked_at) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: '#0D1F18', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 6 }}>{label}</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Serviços realizados */}
                {Object.keys(selectedMetrics.serviceCount).length > 1 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.textSec, marginBottom: 10 }}>Serviços realizados</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {Object.entries(selectedMetrics.serviceCount).map(([type, count]) => (
                        <div key={type} style={{ background: C.accentDim, border: `1px solid rgba(0,198,167,0.18)`, borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12 }}>{SERVICE_LABEL[type] ?? type}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>{count}×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Histórico de passeios */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                  <h3 style={{ fontWeight: 700, fontSize: 13, color: C.text }}>Histórico</h3>
                </div>
                {selectedMetrics.walkHistory.length === 0 ? (
                  <div style={{ padding: '32px 18px', textAlign: 'center', color: C.textSec, fontSize: 13 }}>
                    Nenhum atendimento registrado.
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none' }}>
                    {selectedMetrics.walkHistory.slice(0, 20).map((h, i) => (
                      <li key={`${h.id}-${i}`} style={{
                        padding: '12px 18px',
                        borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                      }}>
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <p style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>
                            {formatDate(h.date)}
                          </p>
                          <p style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>
                            {SERVICE_LABEL[h.type] ?? h.type}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {h.duration && (
                            <span style={{ fontSize: 11, color: C.textSec, background: C.accentDim, border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 20 }}>
                              {h.duration >= 60 ? `${Math.floor(h.duration / 60)}h ${h.duration % 60}min` : `${h.duration}min`}
                            </span>
                          )}
                          {h.distance && (
                            <span style={{ fontSize: 11, color: C.textSec, background: C.accentDim, border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: 20 }}>
                              {(h.distance / 1000).toFixed(1)} km
                            </span>
                          )}
                          {h.amount && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: C.accentDim, border: `1px solid rgba(0,198,167,0.2)`, padding: '2px 8px', borderRadius: 20 }}>
                              R$ {Number(h.amount).toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 280, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '40px 20px', textAlign: 'center', color: C.textSec, fontSize: 13 }}>
              Selecione um pet para ver o histórico e métricas detalhadas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
