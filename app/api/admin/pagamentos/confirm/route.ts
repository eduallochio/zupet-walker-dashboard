import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth-admin';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { paymentId } = await req.json();
  if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });

  const { data: payment, error: fetchErr } = await supabaseAdmin
    .from('walker_payments')
    .select('walker_id, description')
    .eq('id', paymentId)
    .single();

  if (fetchErr || !payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

  const { error } = await supabaseAdmin
    .from('walker_payments')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', paymentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If payment is for Pro plan, activate Pro on walker
  if (payment.description?.toLowerCase().includes('pro')) {
    await supabaseAdmin
      .from('walker_profiles')
      .update({ plan: 'pro' })
      .eq('id', payment.walker_id);
  }

  return NextResponse.json({ ok: true });
}
