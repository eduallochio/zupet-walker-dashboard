import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPage() {
  const [
    { count: totalWalkers },
    { count: proWalkers },
    { count: totalSessions },
    { data: recentWalkers },
  ] = await Promise.all([
    supabaseAdmin.from('walker_profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('walker_profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    supabaseAdmin.from('walk_sessions').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('walker_profiles')
      .select('id, name, plan, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: 'Total de Walkers', value: totalWalkers ?? 0, icon: '🦮' },
    { label: 'Plano Pro', value: proWalkers ?? 0, icon: '⭐' },
    { label: 'Plano Gratuito', value: (totalWalkers ?? 0) - (proWalkers ?? 0), icon: '🆓' },
    { label: 'Passeios realizados', value: totalSessions ?? 0, icon: '🐾' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-white">Visão Geral</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-3xl font-extrabold text-white">{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="font-bold text-white">Walkers recentes</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-left">
              <th className="px-6 py-3 font-semibold">Nome</th>
              <th className="px-6 py-3 font-semibold">Plano</th>
              <th className="px-6 py-3 font-semibold">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {recentWalkers?.map((w) => (
              <tr key={w.id} className="hover:bg-gray-750">
                <td className="px-6 py-3 text-white">{w.name}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    w.plan === 'pro' ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {w.plan === 'pro' ? '⭐ Pro' : 'Gratuito'}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-400">
                  {new Date(w.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
