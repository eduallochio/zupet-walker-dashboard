import { createClient } from '@supabase/supabase-js';
import CuponsAdminClient from './CuponsAdminClient';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0;

export default async function AdminCuponsPage() {
  const { data: coupons } = await supabaseAdmin
    .from('walker_coupons')
    .select('*, walker_coupon_uses(id)')
    .order('created_at', { ascending: false });

  const cupons = (coupons ?? []).map((c: any) => ({
    ...c,
    uses: Array.isArray(c.walker_coupon_uses) ? c.walker_coupon_uses.length : 0,
  }));

  return <CuponsAdminClient cupons={cupons} />;
}
