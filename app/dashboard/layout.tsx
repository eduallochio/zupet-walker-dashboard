import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import WalkerSidebar from '@/components/walker/WalkerSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Verifica sessão Supabase via cookie
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value;
  if (!accessToken) redirect('/login');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('walker_profiles')
    .select('id, name, plan, avatar_url, username')
    .eq('user_id', user.id)
    .single();

  // Contador de pagamentos pendentes para o selo no menu "Financeiro"
  const { count: pendingPayments } = profile?.id
    ? await supabase.from('walker_payments').select('id', { count: 'exact', head: true }).eq('walker_id', profile.id).eq('status', 'pending')
    : { count: 0 };

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1512' }}>
      <WalkerSidebar profile={profile} pendingPayments={pendingPayments ?? 0} />
      <main className="flex-1 overflow-auto dashboard-main">{children}</main>
    </div>
  );
}
