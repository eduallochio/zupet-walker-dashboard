import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth-admin';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — listar cupons
export async function GET() {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('walker_coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — criar cupom
export async function POST(req: NextRequest) {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { code, description, discount_pct, discount_brl, max_uses, valid_from, valid_until } = body;

  if (!code) return NextResponse.json({ error: 'Código obrigatório' }, { status: 400 });
  if (!discount_pct && !discount_brl) return NextResponse.json({ error: 'Informe desconto_pct ou desconto_brl' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('walker_coupons')
    .insert({
      code: code.trim().toUpperCase(),
      description: description ?? null,
      discount_pct: discount_pct ?? null,
      discount_brl: discount_brl ?? null,
      max_uses: max_uses ?? null,
      valid_from: valid_from ?? null,
      valid_until: valid_until ?? null,
      active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH — ativar/desativar cupom
export async function PATCH(req: NextRequest) {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, active } = await req.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('walker_coupons')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
