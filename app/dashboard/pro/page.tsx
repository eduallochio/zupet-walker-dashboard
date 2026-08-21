import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const PIX_KEY = process.env.PIX_KEY ?? 'contato@zupet.io';

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
    .eq('id', user.id)
    .single();

  const isPro = profile?.plan === 'pro';

  if (isPro) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Plano Pro</h1>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h2 className="text-xl font-extrabold text-emerald-700 mb-2">Você já é Pro!</h2>
          <p className="text-emerald-600 text-sm">Aproveite todos os recursos sem limites.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Assinar Plano Pro</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Benefícios */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">O que você ganha com o Pro</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            {[
              ['🐾', 'Pets ilimitados (free: até 10)'],
              ['🛎️', 'Serviços ilimitados'],
              ['📸', 'Relatórios com fotos do passeio'],
              ['📊', 'Histórico completo (free: 30 dias)'],
              ['🔍', 'Destaque na busca de tutores'],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-lg">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagamento */}
        <div className="bg-emerald-600 rounded-2xl p-6 text-white space-y-4">
          <h2 className="font-bold text-lg">R$ 29/mês</h2>
          <p className="text-emerald-100 text-sm">Pague via Pix e ative em até 24h úteis.</p>

          <div className="bg-emerald-700 rounded-xl p-4 space-y-2">
            <p className="text-xs text-emerald-300 uppercase tracking-wide font-semibold">Chave Pix</p>
            <p className="font-mono font-bold text-lg">{PIX_KEY}</p>
          </div>

          <div className="bg-emerald-700 rounded-xl p-4 text-sm text-emerald-100 space-y-1">
            <p className="font-semibold text-white">Como ativar:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Faça o Pix de R$ 29 para a chave acima</li>
              <li>Envie o comprovante para <span className="text-white font-semibold">contato@zupet.io</span></li>
              <li>Informe seu email de cadastro no app</li>
              <li>Ativamos em até 24h úteis</li>
            </ol>
          </div>

          <p className="text-xs text-emerald-300">
            Seu email de cadastro: <span className="text-white font-semibold">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
