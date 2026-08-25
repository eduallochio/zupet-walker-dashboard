import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'Código obrigatório' }, { status: 400 });

  // Autenticar walker
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  // Buscar perfil do walker
  const { data: profile } = await supabaseAdmin
    .from('walker_profiles')
    .select('id, plan')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
  if (profile.plan === 'pro') return NextResponse.json({ error: 'Você já é Pro' }, { status: 400 });

  // Buscar cupom
  const { data: coupon } = await supabaseAdmin
    .from('walker_coupons')
    .select('id, code, description, discount_pct, discount_brl, max_uses, used_count, valid_from, valid_until, active')
    .eq('code', code)
    .single();

  if (!coupon) return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
  if (!coupon.active) return NextResponse.json({ error: 'Cupom inativo' }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);
  if (coupon.valid_from && today < coupon.valid_from)
    return NextResponse.json({ error: 'Cupom ainda não está válido' }, { status: 400 });
  if (coupon.valid_until && today > coupon.valid_until)
    return NextResponse.json({ error: 'Cupom expirado' }, { status: 400 });
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses)
    return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 });

  // Verificar se walker já usou este cupom
  const { data: alreadyUsed } = await supabaseAdmin
    .from('walker_coupon_uses')
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('walker_id', profile.id)
    .maybeSingle();

  if (alreadyUsed) return NextResponse.json({ error: 'Você já usou este cupom' }, { status: 400 });

  // Calcular desconto
  const BASE_PRICE = 29;
  let discountAmount = 0;
  if (coupon.discount_pct) discountAmount = Math.round(BASE_PRICE * coupon.discount_pct / 100 * 100) / 100;
  else if (coupon.discount_brl) discountAmount = Math.min(coupon.discount_brl, BASE_PRICE);
  const finalAmount = Math.max(0, BASE_PRICE - discountAmount);

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountPct: coupon.discount_pct,
      discountBrl: coupon.discount_brl,
    },
    pricing: {
      original: BASE_PRICE,
      discount: discountAmount,
      final: finalAmount,
      isFree: finalAmount === 0,
    },
  });
}
