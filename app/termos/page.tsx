import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso — Zupet Walker',
  description: 'Termos de Uso do aplicativo e dashboard Zupet Walker.',
};

const SECTIONS = [
  {
    title: '1. Aceitação dos termos',
    body: `Ao criar uma conta ou utilizar o Zupet Walker (aplicativo móvel e dashboard web em walker.zupet.io), você declara ter lido e concordado com estes Termos de Uso e com a nossa [Política de Privacidade](/privacidade). Se não concordar, não utilize o serviço.`,
  },
  {
    title: '2. O que é o Zupet Walker',
    body: `O Zupet Walker é uma ferramenta de gestão para passeadores de pets (walkers), que permite organizar agenda, serviços, pets vinculados, registrar passeios e enviar relatórios aos tutores.

O Zupet é uma plataforma de tecnologia. Não somos empregador, agência ou parte do contrato entre walker e tutor, e não garantimos a contratação de serviços.`,
  },
  {
    title: '3. Cadastro e conta',
    body: `• Você deve ter 18 anos ou mais e fornecer informações verdadeiras, completas e atualizadas.
• Você é responsável pela segurança de suas credenciais e por toda atividade realizada na sua conta.
• Podemos suspender ou encerrar contas que violem estes termos ou a legislação aplicável.`,
  },
  {
    title: '4. Responsabilidades do walker',
    body: `Ao utilizar o Zupet Walker, você se compromete a:

• Prestar seus serviços com cuidado, segurança e respeito aos animais e aos tutores.
• Registrar passeios, fotos e eventos de forma fiel à realidade.
• Utilizar os dados dos tutores e dos pets apenas para a prestação do serviço contratado.
• Respeitar a legislação vigente, incluindo normas de proteção animal e de proteção de dados (LGPD).

Você é o único responsável pelos serviços que presta, por eventuais danos, acidentes ou perdas ocorridos durante os passeios e pelas obrigações fiscais e trabalhistas decorrentes da sua atividade.`,
  },
  {
    title: '5. Pagamentos entre walker e tutor',
    body: `Os valores dos serviços são combinados diretamente entre walker e tutor. O Zupet registra os pagamentos apenas para controle interno e **não processa nem intermedia** pagamentos de serviços de passeio.`,
  },
  {
    title: '6. Planos Free e Pro',
    body: `O Zupet Walker oferece o **Plano Free**, gratuito e com limites de uso, e o **Plano Pro**, uma assinatura paga com recursos ampliados: pets vinculados e serviços ilimitados, histórico completo de passeios e sem limite de pets por passeio.

**Assinatura Pro (iOS):**
• Título: Zupet Walker Pro.
• Duração: mensal, com renovação automática a cada mês.
• Preço: exibido na tela de assinatura do app, na moeda e com os impostos da sua região, conforme a App Store.
• O pagamento é cobrado na sua conta do Apple ID na confirmação da compra.
• A assinatura renova automaticamente, a menos que seja cancelada pelo menos 24 horas antes do fim do período atual. A cobrança da renovação ocorre em até 24 horas antes do fim do período.
• Você pode gerenciar e cancelar a assinatura a qualquer momento nos Ajustes do seu dispositivo, em Apple ID > Assinaturas. A exclusão do app não cancela a assinatura.
• Reembolsos de compras feitas pela App Store são tratados pela Apple, conforme as políticas dela.

Ao cancelar, você mantém o acesso ao Plano Pro até o fim do período já pago e depois retorna ao Plano Free. Os limites do Plano Free podem restringir o acesso a dados acima desses limites, mas seus dados não são apagados por isso.

O uso da App Store também está sujeito ao [Contrato de Licença de Usuário Final da Apple](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/).`,
  },
  {
    title: '7. Conteúdo e propriedade intelectual',
    body: `O aplicativo, a marca Zupet, o design e o código são de propriedade do Zupet e protegidos por lei. Você recebe uma licença limitada, não exclusiva e intransferível para usar o serviço.

Você mantém a titularidade do conteúdo que envia (como fotos e textos), mas nos concede licença para armazená-lo e exibi-lo na medida necessária para operar o serviço, inclusive aos tutores vinculados.`,
  },
  {
    title: '8. Condutas proibidas',
    body: `É proibido:

• Usar o serviço para fins ilegais, fraudulentos ou que causem dano a pessoas ou animais.
• Tentar acessar áreas restritas, interferir no funcionamento ou realizar engenharia reversa do serviço.
• Enviar conteúdo ofensivo, discriminatório ou que viole direitos de terceiros.
• Criar perfis falsos ou se passar por outra pessoa.`,
  },
  {
    title: '9. Limitação de responsabilidade',
    body: `O serviço é oferecido "no estado em que se encontra". Empregamos esforços razoáveis para mantê-lo disponível e seguro, mas não garantimos funcionamento ininterrupto ou livre de erros.

Na extensão permitida pela lei, o Zupet não se responsabiliza por danos decorrentes da relação entre walker e tutor, da prestação dos serviços de passeio ou do uso indevido da plataforma.`,
  },
  {
    title: '10. Encerramento e exclusão de conta',
    body: `Você pode solicitar a exclusão da sua conta a qualquer momento pelo contato abaixo. Os dados serão tratados conforme a [Política de Privacidade](/privacidade). Cancelar a conta não cancela automaticamente uma assinatura feita pela App Store; isso deve ser feito nos Ajustes do Apple ID.`,
  },
  {
    title: '11. Alterações dos termos',
    body: `Podemos atualizar estes termos periodicamente. Quando houver mudanças relevantes, avisaremos pelo app ou por e-mail. O uso continuado do serviço após a atualização indica sua concordância com a nova versão.`,
  },
  {
    title: '12. Lei aplicável e contato',
    body: `Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do usuário para dirimir quaisquer controvérsias, nos termos da legislação consumerista.

Dúvidas ou solicitações:

**Zupet — eduallochio2@outlook.com**`,
  },
];

function renderLine(line: string) {
  return line
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="priv-link">$1</a>')
    .replace(/^•\s/, '<span class="priv-bullet">•</span> ');
}

export default function TermosPage() {
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
          <h1 className="priv-title">Termos de Uso</h1>
          <p className="priv-meta">Última atualização: outubro de 2026</p>
          <p className="priv-intro">
            Estes Termos de Uso regem o uso do <strong>Zupet Walker</strong> por passeadores (walkers), incluindo o aplicativo móvel, o dashboard web e a assinatura do Plano Pro.
          </p>
        </div>

        <div className="priv-sections">
          {SECTIONS.map((s) => (
            <section key={s.title} className="priv-section">
              <h2 className="priv-section-title">{s.title}</h2>
              <div className="priv-section-body">
                {s.body.split('\n').map((line, i) =>
                  line.trim() === '' ? null : (
                    <p key={i} dangerouslySetInnerHTML={{ __html: renderLine(line) }} />
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
        .priv-link { color: var(--accent-lt); text-decoration: none; }
        .priv-link:hover { text-decoration: underline; }
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
