'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

async function getSupabase() {
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
}

async function sendPushToOwner(ownerId: string, title: string, body: string, data: Record<string, any>) {
  const supabase = await getSupabase();
  const { data: profile } = await supabase
    .from('user_profiles').select('expo_push_token').eq('user_id', ownerId).maybeSingle();
  const token = (profile as any)?.expo_push_token;
  if (!token) return;
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: token, title, body, data }),
  });
}

export async function atualizarStatusAgendamento(
  scheduleId: string,
  newStatus: 'confirmed' | 'cancelled',
) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado' };

  const { data: profile } = await supabase
    .from('walker_profiles').select('id, name').eq('user_id', user.id).single();
  if (!profile) return { error: 'Perfil não encontrado' };

  // Busca o agendamento
  const { data: schedule, error: schedErr } = await supabase
    .from('walk_schedules')
    .select('id, scheduled_at, owner_id, service_id, pet_ids, status')
    .eq('id', scheduleId)
    .single();
  if (schedErr || !schedule) return { error: 'Agendamento não encontrado' };

  // Atualiza status
  const { error } = await supabase
    .from('walk_schedules')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', scheduleId);
  if (error) return { error: error.message };

  // Atualiza blocked_slots do serviço
  if ((schedule as any).service_id) {
    const scheduledDate = new Date((schedule as any).scheduled_at);
    const dateKey  = scheduledDate.toISOString().split('T')[0];
    const timeSlot = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;

    const [{ data: svcData }, { count: confirmedCount }] = await Promise.all([
      supabase.from('walker_services')
        .select('blocked_slots, max_pets, price, label, type')
        .eq('id', (schedule as any).service_id)
        .maybeSingle(),
      supabase.from('walk_schedules')
        .select('id', { count: 'exact', head: true })
        .eq('service_id', (schedule as any).service_id)
        .eq('status', 'confirmed')
        .eq('scheduled_at', (schedule as any).scheduled_at),
    ]);

    if (svcData) {
      const blocked: Record<string, string[]> = (svcData as any).blocked_slots ?? {};
      const daySlots: string[] = blocked[dateKey] ?? [];
      const maxPets: number = (svcData as any).max_pets ?? 1;

      if (newStatus === 'confirmed') {
        const totalConfirmed = (confirmedCount ?? 0) + 1;
        if (totalConfirmed >= maxPets && !daySlots.includes(timeSlot)) {
          blocked[dateKey] = [...daySlots, timeSlot];
        }
      } else {
        blocked[dateKey] = daySlots.filter((s) => s !== timeSlot);
        if (blocked[dateKey].length === 0) delete blocked[dateKey];
      }

      await supabase.from('walker_services')
        .update({ blocked_slots: blocked })
        .eq('id', (schedule as any).service_id);

      // Cria pagamento pendente ao aceitar
      if (newStatus === 'confirmed') {
        const { data: existing } = await supabase
          .from('walker_payments').select('id').eq('schedule_id', scheduleId).maybeSingle();
        if (!existing) {
          await supabase.from('walker_payments').insert({
            walker_id:    profile.id,
            owner_id:     (schedule as any).owner_id,
            schedule_id:  scheduleId,
            service_type: (svcData as any).type ?? 'walk',
            description:  (svcData as any).label ?? 'Serviço',
            amount:       (svcData as any).price ?? 0,
            billing_type: 'per_session',
            status:       'pending',
          });
        }
      }
    }
  }

  // Notifica tutor
  const scheduledDate = new Date((schedule as any).scheduled_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  const notifTitle = newStatus === 'confirmed' ? 'Agendamento confirmado!' : 'Agendamento recusado';
  const notifBody  = newStatus === 'confirmed'
    ? `${(profile as any).name} confirmou o agendamento de ${scheduledDate}.`
    : `${(profile as any).name} não pôde aceitar o agendamento de ${scheduledDate}.`;

  await Promise.all([
    supabase.from('notifications').insert({
      user_id: (schedule as any).owner_id,
      type:    newStatus === 'confirmed' ? 'schedule_confirmed' : 'schedule_cancelled',
      title:   notifTitle,
      body:    notifBody,
      data:    { schedule_id: scheduleId, walker_id: profile.id },
    }),
    sendPushToOwner((schedule as any).owner_id, notifTitle, notifBody, {
      type: newStatus === 'confirmed' ? 'schedule_confirmed' : 'schedule_cancelled',
      schedule_id: scheduleId,
      walker_id: profile.id,
    }),
  ]);

  revalidatePath('/dashboard/agenda', 'layout');
  revalidatePath('/dashboard', 'layout');
  return { error: null };
}

export async function criarAgendamentoManual(payload: {
  service_type: string;
  scheduled_at: string;
  duration_minutes: number;
  amount: number | null;
  pet_ids: string[];
  notes: string | null;
}) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado' };

  const { data: profile } = await supabase
    .from('walker_profiles').select('id, name').eq('user_id', user.id).single();
  if (!profile) return { error: 'Perfil não encontrado' };

  // Descobre owner_id se algum pet tem vínculo ativo com este walker
  let ownerId: string | null = null;
  if (payload.pet_ids.length > 0) {
    const { data: links } = await supabase
      .from('walker_pet_links')
      .select('owner_id')
      .eq('walker_id', (profile as any).id)
      .eq('status', 'active')
      .in('pet_id', payload.pet_ids);

    const ownerIds = [...new Set((links ?? []).map((l: any) => l.owner_id).filter(Boolean))];
    if (ownerIds.length === 1) ownerId = ownerIds[0];
  }

  const { error } = await supabase.from('walk_schedules').insert({
    walker_id:        (profile as any).id,
    owner_id:         ownerId,
    service_type:     payload.service_type,
    scheduled_at:     payload.scheduled_at,
    duration_minutes: payload.duration_minutes,
    pet_ids:          payload.pet_ids,
    status:           'confirmed',
    notes:            payload.notes,
    amount:           payload.amount,
    proposed_by:      'walker',
  });

  if (error) return { error: error.message };

  // Notifica tutor se há owner_id
  if (ownerId) {
    const dateLabel = new Date(payload.scheduled_at).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
    const svcLabels: Record<string, string> = {
      walk: 'Passeio', bath: 'Banho e Tosa', boarding: 'Hospedagem',
      daycare: 'Day Care', training: 'Adestramento', vet_visit: 'Visita Veterinária',
    };
    const svcLabel = svcLabels[payload.service_type] ?? 'Serviço';
    const title = `📅 ${svcLabel} agendado`;
    const body  = `${(profile as any).name} agendou um ${svcLabel.toLowerCase()} para ${dateLabel}.`;

    await Promise.all([
      supabase.from('notifications').insert({
        user_id: ownerId,
        type:    'schedule_confirmed',
        title,
        body,
        data:    { walker_id: (profile as any).id, service_type: payload.service_type },
      }),
      sendPushToOwner(ownerId, title, body, {
        type: 'schedule_confirmed',
        walker_id: (profile as any).id,
        service_type: payload.service_type,
      }),
    ]);
  }

  revalidatePath('/dashboard/agenda', 'layout');
  return { error: null };
}
