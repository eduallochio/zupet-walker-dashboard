import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: sessions }, { data: links }, { data: payments }] = await Promise.all([
    supabase.from('walker_profiles').select('name, rating, plan').eq('id', user.id).single(),
    supabase.from('walk_sessions').select('id').eq('walker_id', user.id),
    supabase.from('walker_pet_links').select('id').eq('walker_id', user.id),
    supabase.from('walker_payments').select('amount, status').eq('walker_id', user.id),
  ]);

  const totalEarned = (payments ?? [])
    .filter((p: any) => p.status === 'paid')
    .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

  const stats = [
    { label: 'Passeios realizados', value: sessions?.length ?? 0, icon: '🦮' },
    { label: 'Pets vinculados',     value: links?.length ?? 0,    icon: '🐾' },
    { label: 'Avaliação',           value: profile?.rating ? `${profile.rating.toFixed(1)} ⭐` : '—', icon: '⭐' },
    { label: 'Total recebido',      value: formatCurrency(totalEarned), icon: '💰' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Olá, {profile?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Bem-vindo ao seu painel de controle</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
