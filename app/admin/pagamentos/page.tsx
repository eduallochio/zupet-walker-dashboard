import { createClient } from '@supabase/supabase-js';
import ConfirmPaymentButton from './ConfirmPaymentButton';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPagamentosPage() {
  const { data: payments } = await supabaseAdmin
    .from('walker_payments')
    .select('id, amount, status, description, created_at, walker_id, walker_profiles(name)')
    .order('created_at', { ascending: false })
    .limit(50);

  const pending = payments?.filter((p) => p.status !== 'paid') ?? [];
  const paid    = payments?.filter((p) => p.status === 'paid') ?? [];

  const fmt = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  const totalPaid    = paid.reduce((a, p) => a + (p.amount ?? 0), 0);
  const totalPending = pending.reduce((a, p) => a + (p.amount ?? 0), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-white">Pagamentos</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total confirmado</p>
          <p className="text-3xl font-extrabold text-emerald-400 tabular-nums">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Aguardando confirmação</p>
          <p className="text-3xl font-extrabold text-yellow-400 tabular-nums">{fmt(totalPending)}</p>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="bg-gray-800 rounded-2xl border border-yellow-700/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-2">
            <span className="text-yellow-400">⏳</span>
            <h2 className="font-bold text-white">Pendentes</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="px-6 py-3 font-semibold">Walker</th>
                <th className="px-6 py-3 font-semibold">Descrição</th>
                <th className="px-6 py-3 font-semibold">Valor</th>
                <th className="px-6 py-3 font-semibold">Data</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {pending.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-3 text-white">
                    {(p.walker_profiles as any)?.name ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-300">{p.description ?? '—'}</td>
                  <td className="px-6 py-3 text-white font-semibold tabular-nums">{fmt(p.amount)}</td>
                  <td className="px-6 py-3 text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3">
                    <ConfirmPaymentButton paymentId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="font-bold text-white">Histórico</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-left">
              <th className="px-6 py-3 font-semibold">Walker</th>
              <th className="px-6 py-3 font-semibold">Descrição</th>
              <th className="px-6 py-3 font-semibold">Valor</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paid.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-3 text-white">{(p.walker_profiles as any)?.name ?? '—'}</td>
                <td className="px-6 py-3 text-gray-300">{p.description ?? '—'}</td>
                <td className="px-6 py-3 text-white font-semibold tabular-nums">{fmt(p.amount)}</td>
                <td className="px-6 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-900 text-emerald-300">
                    Pago
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-400">
                  {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
