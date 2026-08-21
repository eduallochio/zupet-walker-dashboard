import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seja um Walker — Zupet Walker',
  description: 'Vire um passeador profissional com o Zupet Walker. Baixe o app, crie seu perfil e comece a atender tutores na sua região.',
};

const STEPS = [
  {
    n: '01',
    title: 'Baixe o app Zupet Walker',
    desc: 'Disponível gratuitamente para Android e iOS. Basta buscar "Zupet Walker" na loja ou usar o link abaixo.',
    cta: { label: 'Baixar agora', href: 'https://zupet.io/download' },
  },
  {
    n: '02',
    title: 'Crie sua conta e perfil',
    desc: 'Cadastre-se com e-mail ou Google. Preencha seu nome, cidade, serviços que oferece e defina seu preço por hora.',
    cta: null,
  },
  {
    n: '03',
    title: 'Configure sua agenda',
    desc: 'Defina os dias e horários disponíveis e o raio de atendimento. Tutores na sua região vão te encontrar automaticamente.',
    cta: null,
  },
  {
    n: '04',
    title: 'Comece a atender',
    desc: 'Aceite solicitações de tutores, realize os passeios com GPS ativo e envie relatórios com fotos ao final de cada sessão.',
    cta: null,
  },
];

const REQS = [
  'Amor por animais e responsabilidade',
  'Smartphone Android ou iOS',
  'Disponibilidade mínima de alguns horários por semana',
  'Conta bancária ou Pix para receber pagamentos',
];

export default function CadastroPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* NAV */}
      <nav style={{ padding: '20px 6vw', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" className="lp-logo" style={{ textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-simbolo.png" alt="" width={26} height={26} style={{ objectFit: 'contain' }} />
          Zupet Walker
        </Link>
        <Link href="/login" className="lp-nav-cta">Já tenho conta</Link>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '64px 6vw 100px' }}>
        {/* Header */}
        <p className="lp-section-label">Seja um walker</p>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, letterSpacing: '-.035em', lineHeight: 1.05, marginBottom: 16, marginTop: 8 }}>
          Transforme seu amor<br />por pets em <span style={{ color: 'var(--accent-lt)' }}>profissão.</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.65, maxWidth: 520, marginBottom: 56 }}>
          O cadastro como walker é feito pelo app Zupet Walker — gratuito, sem burocracia. Siga os passos abaixo e comece a atender tutores na sua região.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 56 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px 24px' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '.1em', minWidth: 28, paddingTop: 3, flexShrink: 0 }}>{s.n}</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{s.title}</h2>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65 }}>{s.desc}</p>
                {s.cta && (
                  <a href={s.cta.href} target="_blank" rel="noopener noreferrer" className="parallax-btn-p" style={{ display: 'inline-block', marginTop: 14, fontSize: '.85rem', padding: '10px 22px' }}>
                    {s.cta.label}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Requirements */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, padding: '28px 28px', marginBottom: 48 }}>
          <h2 style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>O que você precisa</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REQS.map((r) => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.9rem', color: 'var(--muted)' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>✓</span>
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <a href="https://zupet.io/download" target="_blank" rel="noopener noreferrer" className="parallax-btn-p" style={{ display: 'inline-block', fontSize: '1rem', padding: '14px 36px' }}>
            Baixar o app e começar
          </a>
          <p style={{ marginTop: 14, fontSize: '.82rem', color: 'var(--muted)' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: 'var(--accent-lt)', fontWeight: 600, textDecoration: 'none' }}>
              Acesse o dashboard
            </Link>
          </p>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 6vw', display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: 'var(--muted)' }}>
        <Link href="/" style={{ color: 'var(--accent-lt)', textDecoration: 'none' }}>← Voltar para o início</Link>
        <span>© {new Date().getFullYear()} Zupet</span>
      </footer>
    </div>
  );
}
