import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Zupet Walker',
  description: 'Política de privacidade do aplicativo Zupet Walker.',
};

const SECTIONS = [
  {
    title: '1. Informações que coletamos',
    body: `Coletamos as seguintes informações quando você usa o Zupet Walker:

• **Dados de cadastro:** nome, e-mail, CPF, telefone e endereço, fornecidos por você ao criar seu perfil de walker.
• **Dados de localização:** o app registra a rota percorrida durante os passeios (distância e pontos GPS) exclusivamente para geração do relatório. Os dados de localização são processados localmente no dispositivo e armazenados apenas como resumo (distância total) ao finalizar o passeio.
• **Fotos e eventos:** imagens e registros de eventos (como necessidades fisiológicas) adicionados durante o passeio para compor o relatório enviado ao tutor.
• **Dados financeiros:** registro de pagamentos combinados entre walker e tutor, armazenado somente para histórico interno. O Zupet não processa nem intermedia pagamentos.
• **Token de push:** identificador do dispositivo para envio de notificações.`,
  },
  {
    title: '2. Como usamos suas informações',
    body: `Utilizamos seus dados para:

• Operar e melhorar o aplicativo Zupet Walker.
• Gerar relatórios de passeio para tutores.
• Enviar notificações sobre passeios e atualizações do serviço.
• Cumprir obrigações legais e regulatórias.

Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.`,
  },
  {
    title: '3. Compartilhamento de dados',
    body: `Seus dados podem ser compartilhados apenas nas seguintes situações:

• **Com tutores vinculados:** nome, foto de perfil, cidade e relatórios de passeio são visíveis para tutores que contratam seus serviços.
• **Com prestadores de serviço:** utilizamos o Supabase (banco de dados e autenticação) e serviços de push notification. Esses parceiros processam dados exclusivamente para prover a infraestrutura técnica.
• **Por exigência legal:** quando exigido por lei, ordem judicial ou autoridade competente.`,
  },
  {
    title: '4. Armazenamento e segurança',
    body: `Seus dados são armazenados em servidores seguros gerenciados pelo Supabase, com criptografia em trânsito (TLS) e em repouso. Adotamos práticas de segurança razoáveis para proteger suas informações contra acesso não autorizado, alteração ou divulgação.

Dados de localização detalhados (pontos GPS individuais) não são armazenados permanentemente — apenas o resumo do passeio (distância total e duração) é mantido.`,
  },
  {
    title: '5. Seus direitos',
    body: `De acordo com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você tem direito a:

• Acessar os dados pessoais que mantemos sobre você.
• Corrigir dados incorretos ou desatualizados.
• Solicitar a exclusão de seus dados (direito ao esquecimento).
• Revogar o consentimento para tratamento de dados.
• Solicitar portabilidade dos seus dados.

Para exercer esses direitos, entre em contato: **contato@zupet.io**`,
  },
  {
    title: '6. Retenção de dados',
    body: `Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta, seus dados pessoais serão removidos em até 30 dias, exceto quando a retenção for exigida por obrigação legal.`,
  },
  {
    title: '7. Cookies e tecnologias similares',
    body: `O dashboard web (walker.zupet.io) utiliza cookies de sessão para autenticação. Não utilizamos cookies de rastreamento ou publicidade.`,
  },
  {
    title: '8. Alterações nesta política',
    body: `Podemos atualizar esta política periodicamente. Quando houver alterações relevantes, notificaremos via app ou e-mail. A data da última atualização está indicada no rodapé desta página.`,
  },
  {
    title: '9. Contato',
    body: `Dúvidas, solicitações ou reclamações relacionadas à privacidade:

**Zupet — contato@zupet.io**
Responsável pelo tratamento de dados: Eduardo Allochio`,
  },
];

export default function PrivacidadePage() {
  return (
    <div className="priv-wrap">
      <nav className="priv-nav">
        <Link href="/" className="lp-logo" style={{ textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-simbolo.png" alt="" width={26} height={26} style={{ objectFit: 'contain' }} />
          Zupet Walker
        </Link>
      </nav>

      <main className="priv-main">
        <div className="priv-header">
          <p className="lp-section-label">Legal</p>
          <h1 className="priv-title">Política de Privacidade</h1>
          <p className="priv-meta">Última atualização: agosto de 2025</p>
          <p className="priv-intro">
            Esta Política de Privacidade descreve como o <strong>Zupet Walker</strong> coleta, usa e protege as informações pessoais dos passeadores (walkers) que utilizam nosso aplicativo e dashboard.
          </p>
        </div>

        <div className="priv-sections">
          {SECTIONS.map((s) => (
            <section key={s.title} className="priv-section">
              <h2 className="priv-section-title">{s.title}</h2>
              <div className="priv-section-body">
                {s.body.split('\n').map((line, i) =>
                  line.trim() === '' ? null : (
                    <p key={i} dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/^•\s/, '<span class="priv-bullet">•</span> ')
                    }} />
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="priv-footer">
        <Link href="/">← Voltar para o início</Link>
        <span>© {new Date().getFullYear()} Zupet</span>
      </footer>

      <style>{`
        .priv-wrap { min-height: 100vh; background: var(--bg); color: var(--text); }
        .priv-nav {
          padding: 20px 6vw;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
        }
        .priv-main { max-width: 720px; margin: 0 auto; padding: 56px 6vw 80px; }
        .priv-header { margin-bottom: 48px; }
        .priv-title {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800; letter-spacing: -.03em;
          line-height: 1.1; margin-bottom: 10px; margin-top: 8px;
        }
        .priv-meta { font-size: .8rem; color: var(--muted); margin-bottom: 20px; }
        .priv-intro { font-size: .97rem; color: var(--muted); line-height: 1.7; }
        .priv-sections { display: flex; flex-direction: column; gap: 36px; }
        .priv-section { border-top: 1px solid var(--border); padding-top: 28px; }
        .priv-section-title {
          font-size: 1.05rem; font-weight: 700;
          color: var(--text); margin-bottom: 14px;
        }
        .priv-section-body { display: flex; flex-direction: column; gap: 10px; }
        .priv-section-body p {
          font-size: .9rem; color: var(--muted); line-height: 1.7;
        }
        .priv-bullet { color: var(--accent); margin-right: 2px; }
        .priv-footer {
          border-top: 1px solid var(--border);
          padding: 20px 6vw;
          display: flex; justify-content: space-between;
          font-size: .82rem; color: var(--muted);
        }
        .priv-footer a { color: var(--accent-lt); text-decoration: none; }
        .priv-footer a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
