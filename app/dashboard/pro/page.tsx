import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import ProClient from './ProClient';

const PIX_KEY = '33065719000160';

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

  const { data: profile } = await supabase
    .from('walker_profiles')
    .select('name, plan')
    .eq('user_id', user.id)
    .single();

  return <ProClient isPro={profile?.plan === 'pro'} email={user.email ?? ''} pixKey={PIX_KEY} />;
}
