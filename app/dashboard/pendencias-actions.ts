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

/**
 * Resolve um agendamento confirmado cuja data já passou.
 * 'done' = o atendimento aconteceu · 'cancelled' = não aconteceu.
 */
export async function resolverAgendamentoAtrasado(scheduleId: string, resultado: 'done' | 'cancelled') {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado' };

  const { data: profile } = await supabase
    .from('walker_profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return { error: 'Perfil não encontrado' };

  const { error } = await supabase
    .from('walk_schedules')
    .update({ status: resultado, updated_at: new Date().toISOString() })
    .eq('id', scheduleId)
    .eq('walker_id', profile.id)
    .eq('status', 'confirmed');
  if (error) return { error: error.message };

  revalidatePath('/dashboard', 'layout');
  return { error: null };
}
