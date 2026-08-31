import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import ProClient from './ProClient';

const PIX_KEY = '33065719000160';

const DEFAULT_PLAN_CONFIG = {
  price_full: 79.9,
  price_promo: 49.9,
  promo_active: true,
  promo_label: 'Tempo limitado',
  currency: 'BRL',
};

export default async function ProPage() {
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: configRow }] = await Promise.all([
    supabase.from('walker_profiles').select('name, plan').eq('user_id', user.id).single(),
    supabase.from('app_config').select('value').eq('key', 'walker_pro_plan').maybeSingle(),
  ]);

  const planConfig = (configRow?.value as typeof DEFAULT_PLAN_CONFIG) ?? DEFAULT_PLAN_CONFIG;

  return (
    <ProClient
      isPro={profile?.plan === 'pro'}
      email={user.email ?? ''}
      pixKey={PIX_KEY}
      planConfig={planConfig}
    />
  );
}
