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
    .eq('user_id', user.id)
    .single();

  const isPro = profile?.plan === 'pro';

  if (isPro) {
    return (
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.03em', marginBottom: 28 }}>Plano Pro</h1>
        <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#00A88E', marginBottom: 8 }}>Você já é Pro!</h2>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Aproveite todos os recursos sem limites.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0D2926', letterSpacing: '-0.03em', marginBottom: 28 }}>Assinar Plano Pro</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Benefícios */}
        <div style={{ background: '#fff', border: '1px solid #D1EEEA', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #e8f4f2' }}>
            <h2 style={{ fontWeight: 700, color: '#0D2926', fontSize: 13, letterSpacing: '-0.01em' }}>O que você ganha com o Pro</h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none' }}>
              {[
                ['🐾', 'Pets ilimitados (free: até 10)'],
                ['🛎️', 'Serviços ilimitados'],
                ['📸', 'Relatórios com fotos do passeio'],
                ['📊', 'Histórico completo (free: 30 dias)'],
                ['🔍', 'Destaque na busca de tutores'],
              ].map(([icon, text]) => (
                <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4a6b65' }}>
                  <span style={{ fontSize: 16, lineHeight: 1.4 }}>{icon}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pagamento */}
        <div style={{ background: '#0D2926', borderRadius: 12, padding: 24, color: '#fff', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>Investimento</p>
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>R$ 29<span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>/mês</span></p>
          </div>

          <div style={{ background: 'rgba(0,198,167,0.12)', borderRadius: 10, padding: 16, border: '1px solid rgba(0,198,167,0.2)' }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#00C6A7', marginBottom: 6 }}>Chave Pix</p>
            <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: '#fff' }}>{PIX_KEY}</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <p style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>Como ativar:</p>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 16 }}>
              <li>Faça o Pix de R$ 29 para a chave acima</li>
              <li>Envie o comprovante para <span style={{ color: '#00C6A7', fontWeight: 600 }}>contato@zupet.io</span></li>
              <li>Informe seu email de cadastro no app</li>
              <li>Ativamos em até 24h úteis</li>
            </ol>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
            Seu email: <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
