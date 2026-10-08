import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { T, Card, CardHeader, Chip, EmptyState, Avatar, Label, corPorNome } from '@/components/walker/dash-ui';
import { brl, dataCurta, duracao, km, plural, relativo } from '@/lib/format';
import { Clock, Dog, Footprints, MapPin, PawPrint, Route, Wallet, CalendarHeart, History, UserRound } from 'lucide-react';
import { BotaoDesvincular } from './BotaoDesvincular';

const ESPECIE: Record<string, string> = {
  dog: 'Cachorro', cat: 'Gato', bird: 'Ave', rabbit: 'Coelho', hamster: 'Hamster',
};

const SERVICE_LABEL: Record<string, string> = {
  walk: 'Passeio', bath: 'Banho e tosa', boarding: 'Hospedagem',
  daycare: 'Day care', vet_visit: 'Visita ao vet', training: 'Adestramento', service: 'Serviço',
};

const descricao = (p: { breed?: string | null; species?: string | null }) =>
  [p.breed, p.species ? (ESPECIE[p.species] ?? p.species) : null].filter(Boolean).join(' · ');

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
    .select('id, pet_id, owner_id, status, linked_at, billing_override, service_id')
    .eq('walker_id', walkerId);

  const petIds = (links ?? []).map((l) => l.pet_id);

  // Pets avulsos cadastrados pelo walker (sem tutor vinculado)
  const { data: ownPetsData } = await supabase
    .from('pets')
    .select('id, name, species, breed, photo_uri')
    .eq('walker_owner_id', user.id)
    .is('merged_into', null)
    .eq('is_memorial', false)
    .order('name');

  const ownPets = (ownPetsData ?? []) as Array<{ id: string; name: string; species: string | null; breed: string | null; photo_uri: string | null }>;

  // Dados dos pets vinculados
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

  ownPets.forEach((p) => { if (!petMap[p.id]) petMap[p.id] = p; });

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

  const allTrackedPetIds = [...petIds, ...ownPets.map((p) => p.id)];

  for (const r of reports ?? []) {
    for (const pid of r.pet_ids ?? []) {
      if (!allTrackedPetIds.includes(pid)) continue;
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
      if (!allTrackedPetIds.includes(pid)) continue;
      const m = ensureMetrics(pid);
      const stype = s.service_type ?? 'service';
      m.serviceCount[stype] = (m.serviceCount[stype] ?? 0) + 1;
      m.walkHistory.push({ id: s.id, date: s.scheduled_at, type: stype, duration: null, distance: null, amount: s.amount });
      if (!m.lastActivity || s.scheduled_at > m.lastActivity) m.lastActivity = s.scheduled_at;
    }
  }

  for (const p of payments ?? []) {
    for (const pid of p.pet_ids ?? []) {
      if (!allTrackedPetIds.includes(pid)) continue;
      const m = ensureMetrics(pid);
      m.totalRevenue += Number(p.amount ?? 0);
    }
  }

  // Ordenar histórico por data desc
  for (const pid of allTrackedPetIds) {
    if (metricsMap[pid]) {
      metricsMap[pid].walkHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }

  const selectedPet = selectedPetId ? petMap[selectedPetId] : null;
  const selectedLink = selectedPetId ? linkMap[selectedPetId] : null;
  const selectedMetrics: PetMetrics | null = selectedPet
    ? (metricsMap[selectedPetId!] ?? { totalWalks: 0, totalRevenue: 0, totalDistanceMeters: 0, totalMinutes: 0, serviceCount: {}, lastActivity: null, walkHistory: [] })
    : null;

  const linkedIds = petIds.filter((pid) => petMap[pid]);
  const ativos = linkedIds.filter((pid) => linkMap[pid]?.status === 'active').length;
  const totalPets = linkedIds.length + ownPets.length;

  const statusVinculo = (st?: string) =>
    st === 'active' ? { label: 'Ativo', tone: 'accent' as const }
    : st === 'pending' ? { label: 'Pendente', tone: 'amber' as const }
    : { label: 'Encerrado', tone: 'neutral' as const };

  const itemPet = (pid: string, avulso: boolean) => {
    const pet = petMap[pid];
    const link = linkMap[pid];
    const m = metricsMap[pid];
    const sel = selectedPetId === pid;
    const st = statusVinculo(link?.status);
    return (
      <Link
        key={pid}
        href={`/dashboard/pets?pet=${pid}`}
        scroll={false}
        aria-current={sel ? 'true' : undefined}
        className="zw-row"
        style={{
          textDecoration: 'none', color: 'inherit',
          background: sel ? T.accentDim : 'transparent',
          boxShadow: sel ? `inset 3px 0 0 ${T.accent}` : 'none',
        }}
      >
        <Avatar name={pet.name} src={pet.photo_uri} size={42} bg={corPorNome(pet.name)} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pet.name}</span>
            {!avulso && st.tone !== 'accent' && <Chip tone={st.tone}>{st.label}</Chip>}
          </span>
          <span style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {avulso ? 'Cadastrado por você' : `Tutor: ${ownerMap[link?.owner_id] ?? '—'}`}
            {m?.lastActivity ? ` · ${relativo(m.lastActivity)}` : ''}
          </span>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.accentLt, fontVariantNumeric: 'tabular-nums' }}>{m?.totalWalks ?? 0}</div>
          <div style={{ fontSize: 11, color: T.label }}>{(m?.totalWalks ?? 0) === 1 ? 'passeio' : 'passeios'}</div>
        </div>
      </Link>
    );
  };

  const stats = selectedMetrics ? [
    { label: 'Passeios', value: String(selectedMetrics.totalWalks), icon: Footprints },
    { label: 'Distância', value: km(selectedMetrics.totalDistanceMeters) ?? '—', icon: Route },
    { label: 'Tempo total', value: duracao(selectedMetrics.totalMinutes), icon: Clock },
    { label: 'Receita', value: brl(selectedMetrics.totalRevenue), icon: Wallet },
    { label: 'Último atendimento', value: selectedMetrics.lastActivity ? dataCurta(selectedMetrics.lastActivity) : '—', icon: History },
    { label: 'Vínculo desde', value: selectedLink?.linked_at ? dataCurta(selectedLink.linked_at) : '—', icon: CalendarHeart },
  ] : [];

  return (
    <div className="zw-page">
      <header className="zw-in" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Pets</h1>
        <span style={{ fontSize: 14, color: T.muted }}>
          {totalPets
            ? `${plural(ativos, 'vínculo ativo', 'vínculos ativos')}${ownPets.length ? ` · ${plural(ownPets.length, 'pet cadastrado', 'pets cadastrados')} por você` : ''}`
            : 'Os pets que você atende aparecem aqui'}
        </span>
      </header>

      {totalPets === 0 ? (
        <Card>
          <EmptyState
            icon={PawPrint}
            title="Nenhum pet ainda"
            text="Quando um tutor vincular um pet a você, ou quando você cadastrar um pet avulso no app, ele aparece aqui com histórico e métricas."
          />
        </Card>
      ) : (
        <div className="zw-split zw-in">
          {/* ── Lista ── */}
          <Card pad={false}>
            {linkedIds.length > 0 && (
              <>
                <div style={{ padding: '14px 18px 10px', display: 'flex', justifyContent: 'space-between' }}>
                  <Label>Pets de tutores</Label>
                  <span style={{ fontSize: 12, color: T.label }}>{linkedIds.length}</span>
                </div>
                {linkedIds.map((pid) => itemPet(pid, false))}
              </>
            )}
            {ownPets.length > 0 && (
              <>
                <div style={{ padding: '14px 18px 10px', display: 'flex', justifyContent: 'space-between', borderTop: linkedIds.length ? `1px solid ${T.line}` : 'none' }}>
                  <Label>Cadastrados por você</Label>
                  <span style={{ fontSize: 12, color: T.label }}>{ownPets.length}</span>
                </div>
                {ownPets.map((p) => itemPet(p.id, true))}
              </>
            )}
          </Card>

          {/* ── Detalhe ── */}
          {selectedPet && selectedMetrics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <Avatar name={selectedPet.name} src={selectedPet.photo_uri} size={56} bg={corPorNome(selectedPet.name)} />
                  <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{selectedPet.name}</h2>
                    {descricao(selectedPet) && <span style={{ fontSize: 13, color: T.muted }}>{descricao(selectedPet)}</span>}
                    <span style={{ fontSize: 13, color: T.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserRound size={14} aria-hidden />
                      {selectedLink ? `Tutor: ${ownerMap[selectedLink.owner_id] ?? '—'}` : 'Pet cadastrado por você, sem tutor no Zupet'}
                    </span>
                  </div>
                  {selectedLink && (
                    <BotaoDesvincular
                      linkId={selectedLink.id ?? ''}
                      petId={selectedPetId!}
                      ownerId={selectedLink.owner_id ?? null}
                      petName={selectedPet.name}
                    />
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                  {stats.map(({ label, value, icon: Icon }) => (
                    <div key={label} style={{ background: T.card2, border: `1px solid ${T.line}`, borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: T.label }}>
                        <Icon size={14} aria-hidden /> {label}
                      </span>
                      <span style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {selectedMetrics.totalWalks > 0 && selectedMetrics.totalDistanceMeters === 0 && (
                  <span style={{ fontSize: 12, color: T.label, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} aria-hidden /> Distância aparece quando o passeio é registrado com GPS pelo app.
                  </span>
                )}

                {Object.keys(selectedMetrics.serviceCount).length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Label>Serviços realizados</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {Object.entries(selectedMetrics.serviceCount).map(([type, count]) => (
                        <Chip key={type}>{SERVICE_LABEL[type] ?? type} · {count}</Chip>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Card pad={false}>
                <CardHeader title="Histórico" extra={<span style={{ fontSize: 13, color: T.muted }}>{plural(selectedMetrics.walkHistory.length, 'registro', 'registros')}</span>} />
                {selectedMetrics.walkHistory.length === 0 ? (
                  <EmptyState icon={History} title="Nenhum atendimento registrado" text="Passeios e serviços concluídos com este pet aparecem aqui." />
                ) : selectedMetrics.walkHistory.slice(0, 20).map((h, i) => (
                  <div key={`${h.id}-${i}`} className="zw-row" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 160px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{SERVICE_LABEL[h.type] ?? h.type}</span>
                      <span style={{ fontSize: 12, color: T.muted }}>{dataCurta(h.date)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {!!h.duration && <Chip tone="neutral">{duracao(h.duration)}</Chip>}
                      {km(h.distance) && <Chip tone="neutral">{km(h.distance)}</Chip>}
                      {!!h.amount && <Chip>{brl(Number(h.amount))}</Chip>}
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ) : (
            <Card>
              <EmptyState icon={Dog} title="Escolha um pet" text="Selecione um pet na lista para ver histórico, distância percorrida e receita gerada." />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
