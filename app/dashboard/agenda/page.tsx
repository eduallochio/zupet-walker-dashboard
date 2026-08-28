import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

type ScheduleStatus = 'proposed' | 'confirmed' | 'cancelled' | 'done';

const C = {
  bg: '#0D1F18', card: '#132219', border: 'rgba(0,200,167,0.12)',
  accent: '#00C6A7', accentDim: 'rgba(0,198,167,0.12)',
  text: '#E8F5F0', textSec: '#7FA898', textMuted: '#4A6B60',
  success: '#22D3A5', warning: '#F59E0B', danger: '#F87171',
};

const STATUS_CONFIG: Record<ScheduleStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmado', color: C.success,  bg: 'rgba(34,211,165,0.15)' },
  proposed:  { label: 'Pendente',   color: C.warning,  bg: 'rgba(245,158,11,0.15)' },
  cancelled: { label: 'Cancelado',  color: C.danger,   bg: 'rgba(248,113,113,0.15)' },
  done:      { label: 'Concluído',  color: C.textSec,  bg: 'rgba(127,168,152,0.12)' },
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
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header + stats */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>Agenda</h1>
          <p style={{ fontSize: 13, color: C.textSec, marginTop: 3 }}>
            {confirmedToday.length > 0
              ? `${confirmedToday.length} passeio${confirmedToday.length > 1 ? 's' : ''} confirmado${confirmedToday.length > 1 ? 's' : ''} hoje`
              : 'Nenhum passeio confirmado para hoje'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Próximos agendamentos</h2>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', fontSize: 13, color: C.textSec }}>
            Nenhum agendamento pendente ou confirmado.
          </div>
        ) : (
          <ul>
            {upcoming.map((s: any, i: number) => {
              const cfg = STATUS_CONFIG[s.status as ScheduleStatus] ?? STATUS_CONFIG.proposed;
              const pets = (s.pet_ids ?? []).map((id: string) => petNames[id] ?? id);
              return (
                <li key={s.id} style={{ padding: '14px 20px', borderTop: i > 0 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accentDim, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    🐾
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{formatDateTime(s.scheduled_at)}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{cfg.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textSec, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {ownerNames[s.owner_id] && <span>👤 {ownerNames[s.owner_id]}</span>}
                      {pets.length > 0 && <span>🐶 {pets.join(', ')}</span>}
                      <span>⏱ {formatDuration(s.duration_minutes)}</span>
                    </div>
                    {s.notes && <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4, fontStyle: 'italic' }}>{s.notes}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Histórico */}
      {past.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontWeight: 700, fontSize: 13, color: C.text, letterSpacing: '-0.01em' }}>Histórico</h2>
          </div>
          <ul>
            {past.slice(0, 20).map((s: any, i: number) => {
              const cfg = STATUS_CONFIG[s.status as ScheduleStatus] ?? STATUS_CONFIG.done;
              const pets = (s.pet_ids ?? []).map((id: string) => petNames[id] ?? id);
              return (
                <li key={s.id} style={{ padding: '12px 20px', borderTop: i > 0 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', gap: 14, opacity: s.status === 'cancelled' ? 0.55 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 2, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{formatDateTime(s.scheduled_at)}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{cfg.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textSec, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
