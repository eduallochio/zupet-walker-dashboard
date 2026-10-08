// Primitivos visuais do dashboard do walker (direção "Seu dia").
// Tokens em um só lugar: troque aqui para mudar o painel inteiro.
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

export const T = {
  bg: '#0B1512',
  side: '#0D2420',
  card: '#11201B',
  card2: '#152822',
  line: 'rgba(134,239,172,0.12)',
  lineStrong: 'rgba(134,239,172,0.35)',
  text: '#EEF6F1',
  muted: '#A3BCB0',
  label: '#8FAB9E',
  accent: '#22C55E',
  accentLt: '#86EFAC',
  accentDim: 'rgba(34,197,94,0.12)',
  amber: '#FBBF24',
  amberDim: 'rgba(251,191,36,0.12)',
  amberLine: 'rgba(251,191,36,0.3)',
  danger: '#FCA5A5',
  onAccent: '#05130A',
} as const;

export function Card({ children, style, pad = true }: { children: ReactNode; style?: CSSProperties; pad?: boolean }) {
  return (
    <section style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, overflow: 'hidden', ...(pad ? { padding: 18 } : {}), ...style }}>
      {children}
    </section>
  );
}

export function CardHeader({ title, href, linkLabel, extra }: { title: ReactNode; href?: string; linkLabel?: string; extra?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '16px 18px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>{title}</h2>
      {extra}
      {href && (
        <Link href={href} style={{ fontSize: 13, fontWeight: 700, color: T.accentLt, textDecoration: 'none' }}>
          {linkLabel ?? 'Ver tudo'}
        </Link>
      )}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.label }}>{children}</span>;
}

export function Kpi({ label, value, sub, icon: Icon, tone = 'accent', valueColor }: {
  label: string; value: ReactNode; sub?: ReactNode; icon?: LucideIcon; tone?: 'accent' | 'amber'; valueColor?: string;
}) {
  const bg = tone === 'amber' ? T.amberDim : T.accentDim;
  const fg = tone === 'amber' ? T.amber : T.accent;
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label>{label}</Label>
        {Icon && <IconBox icon={Icon} bg={bg} fg={fg} />}
      </div>
      <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: valueColor ?? T.text, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      {sub && <span style={{ fontSize: 13, color: T.muted }}>{sub}</span>}
    </Card>
  );
}

export function IconBox({ icon: Icon, bg = T.accentDim, fg = T.accent, size = 36 }: { icon: LucideIcon; bg?: string; fg?: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 10, background: bg, color: fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={Math.round(size / 2)} strokeWidth={2} aria-hidden />
    </span>
  );
}

export function Chip({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'amber' | 'neutral' }) {
  const map = {
    accent: { bg: T.accentDim, fg: T.accentLt },
    amber: { bg: T.amberDim, fg: T.amber },
    neutral: { bg: 'rgba(255,255,255,0.06)', fg: T.muted },
  }[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap', background: map.bg, color: map.fg }}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, text, actions }: { icon: LucideIcon; title: string; text?: string; actions?: ReactNode }) {
  return (
    <div style={{ padding: '26px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <IconBox icon={icon} size={48} />
      <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
      {text && <span style={{ fontSize: 13, color: T.muted, maxWidth: 340, lineHeight: 1.5 }}>{text}</span>}
      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>{actions}</div>}
    </div>
  );
}

export function Avatar({ name, src, size = 36, bg = T.accentLt }: { name: string; src?: string | null; size?: number; bg?: string }) {
  const ini = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#0B1512', fontSize: Math.round(size * 0.36), fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : ini}
    </span>
  );
}

export function ButtonLink({ href, children, variant = 'primary', small }: { href: string; children: ReactNode; variant?: 'primary' | 'ghost'; small?: boolean }) {
  return (
    <Link href={href} className={`zw-btn zw-btn-${variant}${small ? ' zw-btn-s' : ''}`}>
      {children}
    </Link>
  );
}

/** Cor estável por nome (para avatares sem foto). */
export function corPorNome(nome: string) {
  const cores = ['#86EFAC', '#FCD34D', '#93C5FD', '#F9A8D4', '#C4B5FD', '#FDBA74'];
  let h = 0;
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return cores[h % cores.length];
}
