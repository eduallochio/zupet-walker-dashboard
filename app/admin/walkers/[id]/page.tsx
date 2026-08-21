import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import TogglePlanButton from './TogglePlanButton';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function WalkerDetailPage({ params }: { params: { id: string } }) {
  const { data: walker } = await supabaseAdmin
    .from('walker_profiles')
    .select('id, name, bio, plan, created_at, rating, total_walks')
    .eq('id', params.id)
    .single();

  if (!walker) notFound();

  const { data: payments } = await supabaseAdmin
    .from('walker_payments')
    .select('amount, status, created_at, description')
    .eq('walker_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{walker.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Cadastrado em {new Date(walker.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <TogglePlanButton walkerId={walker.id} currentPlan={walker.plan} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Plano', value: walker.plan === 'pro' ? '⭐ Pro' : 'Gratuito' },
          { label: 'Avaliação', value: walker.rating != null ? `${Number(walker.rating).toFixed(1)} / 5` : '—' },
          { label: 'Passeios', value: walker.total_walks ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-extrabold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {walker.bio && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Bio</p>
          <p className="text-gray-200 text-sm">{walker.bio}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="font-bold text-white">Últimos pagamentos</h2>
        </div>
        {payments && payments.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="px-6 py-3 font-semibold">Descrição</th>
                <th className="px-6 py-3 font-semibold">Valor</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {payments.map((p, i) => (
                <tr key={i}>
                  <td className="px-6 py-3 text-gray-200">{p.description ?? '—'}</td>
                  <td className="px-6 py-3 text-white font-semibold tabular-nums">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.status === 'paid' ? 'bg-emerald-900 text-emerald-300' : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {p.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-6 py-8 text-gray-500 text-sm text-center">Nenhum pagamento registrado.</p>
        )}
      </div>
    </div>
  );
}
