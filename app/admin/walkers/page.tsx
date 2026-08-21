import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminWalkersPage() {
  const { data: walkers } = await supabaseAdmin
    .from('walker_profiles')
    .select('id, name, bio, plan, created_at, rating, total_walks')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Walkers</h1>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-left border-b border-gray-700">
              <th className="px-6 py-4 font-semibold">Nome</th>
              <th className="px-6 py-4 font-semibold">Plano</th>
              <th className="px-6 py-4 font-semibold">Avaliação</th>
              <th className="px-6 py-4 font-semibold">Passeios</th>
              <th className="px-6 py-4 font-semibold">Cadastro</th>
              <th className="px-6 py-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {walkers?.map((w) => (
              <tr key={w.id} className="hover:bg-gray-750 transition">
                <td className="px-6 py-4 text-white font-medium">{w.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    w.plan === 'pro' ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {w.plan === 'pro' ? '⭐ Pro' : 'Gratuito'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {w.rating != null ? `⭐ ${Number(w.rating).toFixed(1)}` : '—'}
                </td>
                <td className="px-6 py-4 text-gray-300">{w.total_walks ?? 0}</td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(w.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/walkers/${w.id}`}
                    className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition">
                    Gerenciar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
