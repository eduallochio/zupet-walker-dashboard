import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

type ScheduleStatus = 'proposed' | 'confirmed' | 'cancelled' | 'done';

const STATUS_CONFIG: Record<ScheduleStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmado', color: '#00A88E', bg: '#D1EEEA' },
  proposed:  { label: 'Pendente',   color: '#B45309', bg: '#FEF3C7' },
  cancelled: { label: 'Cancelado',  color: '#9CA3AF', bg: '#F3F4F6' },
  done:      { label: 'Concluído',  color: '#6B7280', bg: '#F3F4F6' },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(min: number | null) {
  if (!min) return '—';
  if (min < 60) return `${min}min`;
  return `${Math.floor(min / 60)}h${min % 60 ? (min % 60) + 'min' : ''}`;
}

export default async function AgendaPage() {
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

  const { data: schedules } = profile?.id ? await supabase
    .from('walk_schedules')
    .select('id, scheduled_at, duration_minutes, pet_ids, status, notes, owner_id')
    .eq('walker_id', profile.id)
    .order('scheduled_at', { ascending: true }) : { data: [] };

  const rows = (schedules ?? []) as any[];

  // Buscar nomes dos pets
  const allPetIds = [...new Set(rows.flatMap((s: any) => s.pet_ids ?? []))];
  let petNames: Record<string, string> = {};
  if (allPetIds.length > 0) {
    const { data: petsData } = await supabase
      .from('pets').select('id, name').in('id', allPetIds);
    (petsData ?? []).forEach((p: any) => { petNames[p.id] = p.name; });
  }

  // Buscar nomes dos tutores
  const ownerIds = [...new Set(rows.map((s: any) => s.owner_id).filter(Boolean))];
  let ownerNames: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from('user_profiles').select('user_id, name').in('user_id', ownerIds);
    (owners ?? []).forEach((o: any) => { ownerNames[o.user_id] = o.name; });
  }

  // Agrupar por status
  const upcoming = rows.filter((s: any) => ['proposed', 'confirmed'].includes(s.status));
  const past     = rows.filter((s: any) => ['done', 'cancelled'].includes(s.status));

  const today = new Date();
  const confirmedToday = upcoming.filter((s: any) => {
    const d = new Date(s.scheduled_at);
    return s.status === 'confirmed' &&
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  });

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.03em' }}>Agenda</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>
            {confirmedToday.length > 0
              ? `${confirmedToday.length} passeio${confirmedToday.length > 1 ? 's' : ''} confirmado${confirmedToday.length > 1 ? 's' : ''} hoje`
              : 'Nenhum passeio confirmado para hoje'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['proposed', 'confirmed'] as ScheduleStatus[]).map((st) => {
            const count = upcoming.filter((s: any) => s.status === st).length;
            const cfg = STATUS_CONFIG[st];
            return count > 0 ? (
              <div key={st} style={{ fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '4px 12px', borderRadius: 20 }}>
                {count} {cfg.label.toLowerCase()}
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Próximos */}
      <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #e8f4f2' }}>
          <h2 style={{ fontWeight: 700, fontSize: 13, color: '#0D2926', letterSpacing: '-0.01em' }}>Próximos agendamentos</h2>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
            Nenhum agendamento pendente ou confirmado.
          </div>
        ) : (
          <ul>
            {upcoming.map((s: any, i: number) => {
              const cfg = STATUS_CONFIG[s.status as ScheduleStatus] ?? STATUS_CONFIG.proposed;
              const pets = (s.pet_ids ?? []).map((id: string) => petNames[id] ?? id);
              return (
                <li key={s.id} style={{ padding: '14px 20px', borderTop: i > 0 ? '1px solid #e8f4f2' : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F5FAFA', border: '1px solid #D1EEEA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    🐾
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0D2926' }}>{formatDateTime(s.scheduled_at)}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{cfg.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {ownerNames[s.owner_id] && <span>👤 {ownerNames[s.owner_id]}</span>}
                      {pets.length > 0 && <span>🐶 {pets.join(', ')}</span>}
                      <span>⏱ {formatDuration(s.duration_minutes)}</span>
                    </div>
                    {s.notes && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' }}>{s.notes}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Histórico */}
      {past.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #e8f4f2' }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: '#0D2926', letterSpacing: '-0.01em' }}>Histórico</h2>
          </div>
          <ul>
            {past.slice(0, 20).map((s: any, i: number) => {
              const cfg = STATUS_CONFIG[s.status as ScheduleStatus] ?? STATUS_CONFIG.done;
              const pets = (s.pet_ids ?? []).map((id: string) => petNames[id] ?? id);
              return (
                <li key={s.id} style={{ padding: '12px 20px', borderTop: i > 0 ? '1px solid #e8f4f2' : 'none', display: 'flex', alignItems: 'center', gap: 14, opacity: s.status === 'cancelled' ? 0.55 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0D2926' }}>{formatDateTime(s.scheduled_at)}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{cfg.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {ownerNames[s.owner_id] && <span>👤 {ownerNames[s.owner_id]}</span>}
                      {pets.length > 0 && <span>🐶 {pets.join(', ')}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
