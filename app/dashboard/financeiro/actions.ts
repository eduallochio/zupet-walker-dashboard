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

export async function criarLancamento(formData: FormData) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado' };

  const { data: profile } = await supabase
    .from('walker_profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return { error: 'Perfil não encontrado' };

  const amount = parseFloat((formData.get('amount') as string).replace(',', '.'));
  if (isNaN(amount) || amount <= 0) return { error: 'Valor inválido' };

  const owner_id     = formData.get('owner_id') as string;
  const billing_type = formData.get('billing_type') as string;
  const description  = formData.get('description') as string;
  const status       = formData.get('status') as string;
  const notes        = formData.get('notes') as string;

  const { error } = await supabase.from('walker_payments').insert({
    walker_id:    profile.id,
    owner_id:     owner_id || null,
    amount,
    billing_type,
    description:  description || null,
    status:       status || 'pending',
    notes:        notes || null,
    paid_at:      status === 'paid' ? new Date().toISOString() : null,
  });

  if (error) return { error: error.message };

  // Notificar tutor se lançamento for pendente e tiver owner_id
  if (owner_id && status === 'pending') {
    const { data: walkerProfile } = await supabase
      .from('walker_profiles').select('name').eq('id', profile.id).single();
    await supabase.from('notifications').insert({
      user_id: owner_id,
      type:    'payment_created',
      title:   'Nova cobrança',
      body:    `${walkerProfile?.name ?? 'Seu walker'} registrou uma cobrança de R$ ${amount.toFixed(2).replace('.', ',')}.`,
      data:    { billing_type, amount },
    });
  }

  revalidatePath('/dashboard/financeiro', 'layout');
  return { error: null };
}

export async function registrarPagamentoDinheiro(scheduleId: string, ownerId: string, serviceType: string, amount: number, paymentMethod = 'cash') {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado' };

  const { data: profile } = await supabase
    .from('walker_profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return { error: 'Perfil não encontrado' };

  // Verifica se já existe payment para esse schedule
  const { data: existing } = await supabase
    .from('walker_payments').select('id').eq('schedule_id', scheduleId).maybeSingle();

  if (existing) {
    // Atualiza o existente para pago em dinheiro
    const { error } = await supabase.from('walker_payments')
      .update({ status: 'paid', payment_method: paymentMethod, paid_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('walker_payments').insert({
      walker_id:      profile.id,
      owner_id:       ownerId,
      amount,
      billing_type:   'per_session',
      service_type:   serviceType,
      status:         'paid',
      payment_method: paymentMethod,
      paid_at:        new Date().toISOString(),
      schedule_id:    scheduleId,
    });
    if (error) return { error: error.message };
  }

  revalidatePath('/dashboard/financeiro', 'layout');
  return { error: null };
}

export async function atualizarStatusPagamento(paymentId: string, novoStatus: 'paid' | 'cancelled') {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado' };

  const update: any = { status: novoStatus };
  if (novoStatus === 'paid') update.paid_at = new Date().toISOString();

  const { data: payment, error: fetchErr } = await supabase
    .from('walker_payments').select('owner_id, amount').eq('id', paymentId).single();
  if (fetchErr) return { error: fetchErr.message };

  const { error } = await supabase.from('walker_payments')
    .update(update).eq('id', paymentId);
  if (error) return { error: error.message };

  // Notificar tutor ao confirmar pagamento
  if (novoStatus === 'paid' && payment?.owner_id) {
    const { data: wp } = await supabase
      .from('walker_profiles').select('name').eq('user_id', user.id).single();
    await supabase.from('notifications').insert({
      user_id: payment.owner_id,
      type:    'payment_confirmed',
      title:   'Pagamento confirmado',
      body:    `${wp?.name ?? 'Seu walker'} confirmou o recebimento de R$ ${(payment.amount ?? 0).toFixed(2).replace('.', ',')}.`,
      data:    { payment_id: paymentId },
    });
  }

  revalidatePath('/dashboard/financeiro', 'layout');
  return { error: null };
}
