import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Clock, MapPin, MapPinOff, Droplet, Camera, StickyNote, Lock } from 'lucide-react';
import { MonthNav } from '../financeiro/MonthNav';
import { T, Card, CardHeader, Kpi, Chip, EmptyState } from '@/components/walker/dash-ui';
import { duracao, km, plural, dataCurta, hora } from '@/lib/format';

const SERVICE_LABEL: Record<string, string> = {
  walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem',
  daycare: 'Day Care', vet_visit: 'Visita Veterinária', training: 'Adestramento',
};



export default async function RelatoriosPage({ searchParams }: { searchParams?: Promise<{ mes?: string; ano?: string }> }) {
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
    .from('walker_profiles').select('id, plan').eq('user_id', user.id).single();

  const isPro = profile?.plan === 'pro';

  const [{ data: reports }, { data: doneSchedules }] = await Promise.all([
    profile?.id
      ? supabase.from('walk_reports')
          .select('id, created_at, duration_minutes, distance_meters, pee_count, poop_count, note_count, photos, notes, pet_ids, owner_id')
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

      {/* Relatórios de passeio */}
      {rows.length > 0 && (
        <Card pad={false}>
          <CardHeader title="Passeios" extra={<span style={{ fontSize: 13, color: T.muted }}>{plural(rows.length, 'relatório', 'relatórios')}</span>} />
          {rows.map((r: any) => {
            const dist = km(r.distance_meters);
            const owner = ownerNames[r.owner_id];
            return (
              <div key={r.id} className="zw-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', padding: '16px 18px' }}>
                <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{nomesPets(r.pet_ids)} · {dataCurta(r.created_at)} às {hora(r.created_at)}</span>
                  {owner && <span style={{ fontSize: 13, color: T.muted }}>Tutor: {owner}</span>}
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: T.muted }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={14} aria-hidden />{duracao(r.duration_minutes)}</span>
                    {dist ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MapPin size={14} aria-hidden />{dist}</span> : <Chip tone="amber">Rota não registrada</Chip>}
                    {(r.pee_count > 0 || r.poop_count > 0) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Droplet size={14} aria-hidden />{[r.pee_count ? `Xixi ${r.pee_count}` : null, r.poop_count ? `Cocô ${r.poop_count}` : null].filter(Boolean).join(' · ')}</span>}
                    {r.note_count > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><StickyNote size={14} aria-hidden />{plural(r.note_count, 'nota', 'notas')}</span>}
                    {r.photos?.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Camera size={14} aria-hidden />{plural(r.photos.length, 'foto', 'fotos')}</span>}
                  </span>
                  {r.notes && <span style={{ fontSize: 13, color: T.muted, fontStyle: 'italic' }}>&ldquo;{r.notes}&rdquo;</span>}
                  {r.photos?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {r.photos.slice(0, 5).map((url: string, j: number) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={j} src={url} alt={`Foto ${j + 1} do passeio`} loading="lazy" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: `1px solid ${T.line}` }} />
                      ))}
                    </div>
                  )}
                </div>
                <a href={`/dashboard/relatorios/${r.id}`} className="zw-btn zw-btn-ghost zw-btn-s">Ver relatório</a>
              </div>
            );
          })}
        </Card>
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
