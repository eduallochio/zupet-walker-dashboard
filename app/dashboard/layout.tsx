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
    .select('name, plan, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <WalkerSidebar profile={profile} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
