import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  paid:      'Pago',
  pending:   'Pendente',
  cancelled: 'Cancelado',
};
const STATUS_COLOR: Record<string, string> = {
  paid:      'bg-emerald-100 text-emerald-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default async function FinanceiroPage() {
  const jar = await cookies();
  const accessToken = jar.get('sb-access-token')?.value!;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: payments } = await supabase
    .from('walker_payments')
    .select('id, amount, status, billing_type, created_at, notes')
    .eq('walker_id', user.id)
    .order('created_at', { ascending: false });

  const totalPaid = (payments ?? [])
    .filter((p: any) => p.status === 'paid')
    .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

  const totalPending = (payments ?? [])
    .filter((p: any) => p.status === 'pending')
    .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Financeiro</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Total recebido</p>
          <p className="text-2xl font-extrabold text-emerald-700">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
          <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide mb-1">A receber</p>
          <p className="text-2xl font-extrabold text-yellow-700">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {!payments?.length ? (
          <div className="p-10 text-center text-gray-400">Nenhum pagamento registrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Data</th>
                <th className="px-5 py-3 text-left">Tipo</th>
                <th className="px-5 py-3 text-right">Valor</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 text-gray-600">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{p.billing_type ?? '—'}</td>
                  <td className="px-5 py-3 text-right font-bold text-gray-800">{formatCurrency(p.amount ?? 0)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
