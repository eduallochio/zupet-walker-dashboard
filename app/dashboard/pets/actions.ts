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

export async function desvincularPet(
  linkId: string,
  petId: string,
  ownerId: string | null,
  cancelPayments: boolean,
  cancelSchedules: boolean,
) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado' };

  const { data: profile } = await supabase
    .from('walker_profiles').select('id, name').eq('user_id', user.id).single();
  if (!profile) return { error: 'Perfil não encontrado' };

  // Cancela o vínculo
  const { error } = await supabase
    .from('walker_pet_links')
    .update({ status: 'cancelled' })
    .eq('id', linkId)
    .eq('walker_id', profile.id);
  if (error) return { error: error.message };

  // Cancela pagamentos pendentes desse pet se solicitado
  if (cancelPayments && ownerId) {
    await supabase.from('walker_payments')
      .update({ status: 'cancelled' })
      .eq('walker_id', profile.id)
      .eq('owner_id', ownerId)
      .eq('status', 'pending')
      .contains('pet_ids', [petId]);
  }

  // Cancela agendamentos futuros desse pet se solicitado
  if (cancelSchedules && ownerId) {
    const now = new Date().toISOString();
    await supabase.from('walk_schedules')
      .update({ status: 'cancelled', updated_at: now })
      .eq('walker_id', profile.id)
      .eq('owner_id', ownerId)
      .in('status', ['confirmed', 'pending'])
      .gte('scheduled_at', now)
      .contains('pet_ids', [petId]);
  }

  // Notifica o tutor
  if (ownerId) {
    const { data: petData } = await supabase
      .from('pets').select('name').eq('id', petId).maybeSingle();
    const petName = (petData as any)?.name ?? 'seu pet';
    await supabase.from('notifications').insert({
      user_id: ownerId,
      type: 'pet_unlinked_by_walker',
      title: 'Pet desvinculado pelo walker',
      body: `${profile.name} encerrou o atendimento de ${petName}.`,
      data: { pet_id: petId, walker_id: profile.id },
    });
  }

  revalidatePath('/dashboard/pets', 'page');
  return { error: null };
}
