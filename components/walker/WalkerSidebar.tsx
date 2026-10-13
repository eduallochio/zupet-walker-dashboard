'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, CalendarDays, FileText, PawPrint, BriefcaseBusiness, Wallet, UserRound, Sparkles, LogOut, Link2, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const NAV = [
  { href: '/dashboard',            label: 'Início',     icon: Home },
  { href: '/dashboard/agenda',     label: 'Agenda',     icon: CalendarDays },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/dashboard/pets',       label: 'Pets',       icon: PawPrint },
  { href: '/dashboard/servicos',   label: 'Serviços',   icon: BriefcaseBusiness },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/dashboard/perfil',     label: 'Perfil',     icon: UserRound },
  { href: '/dashboard/pro',        label: 'Plano Pro',  icon: Sparkles },
];

type Props = {
  profile: { name: string; plan: string; avatar_url: string | null; username?: string | null } | null;
  pendingPayments?: number;
};

export default function WalkerSidebar({ profile, pendingPayments = 0 }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  // fecha o menu ao trocar de página
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = 'sb-access-token=; path=/; max-age=0';
    document.cookie = 'sb-refresh-token=; path=/; max-age=0';
    router.push('/login');
  };

  const initials = profile?.name
    ? profile.name.trim().split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : '—';
  const isPro = profile?.plan === 'pro';

  return (
    <>
      {/* Hambúrguer — só aparece em mobile via CSS */}
      <button className="sidebar-hamburger" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Fechar menu' : 'Abrir menu'}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay escuro ao abrir no mobile */}
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`dashboard-sidebar${open ? ' open' : ''}`} style={{
        width: 240, minHeight: '100vh', height: '100%',
        background: '#0D2420', borderRight: '1px solid rgba(134,239,172,0.12)',
        display: 'flex', flexDirection: 'column', gap: 18,
        padding: '20px 14px', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-simbolo-branco.png" alt="" width={28} height={28} style={{ objectFit: 'contain', display: 'block' }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: '#EEF6F1', letterSpacing: '-0.02em' }}>Zupet Walker</span>
        </div>

        {/* Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(134,239,172,0.12)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
            background: 'linear-gradient(145deg, #166534, #0B1512)', border: '2px solid #22C55E',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#BBF7D0',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#EEF6F1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name ?? '—'}</span>
            <span style={{ fontSize: 12, color: '#A3BCB0' }}>{isPro ? 'Plano Pro' : 'Plano gratuito'}</span>
          </div>
        </div>

        {/* Navegação */}
        <nav aria-label="Menu principal" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
            const badge = item.href === '/dashboard/financeiro' && pendingPayments > 0 ? pendingPayments : 0;
            return (
              <Link key={item.href} href={item.href} className={`zw-nav${active ? ' on' : ''}`} aria-current={active ? 'page' : undefined}>
                <Icon size={18} strokeWidth={1.9} aria-hidden />
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge > 0 && (
                  <span aria-label={`${badge} pagamentos pendentes`} style={{ fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '1px 8px', background: 'rgba(251,191,36,0.15)', color: '#FBBF24' }}>{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Link público (Pro) */}
          {isPro && profile?.username && (
            <a href={`https://walker.zupet.io/w/${profile.username}`} target="_blank" rel="noopener noreferrer" className="zw-nav" style={{ border: '1px solid rgba(34,197,94,0.25)', color: '#86EFAC' }}>
              <Link2 size={16} aria-hidden /> Meu link público
            </a>
          )}
          {isPro && !profile?.username && (
            <Link href="/dashboard/perfil" className="zw-nav" style={{ border: '1px dashed rgba(34,197,94,0.25)', color: '#86EFAC' }}>
              <Link2 size={16} aria-hidden /> Definir meu link público
            </Link>
          )}

          {/* Convite ao Pro (Free) */}
          {!isPro && (
            <div style={{ borderRadius: 12, padding: 14, background: 'linear-gradient(160deg, rgba(34,197,94,0.16), rgba(34,197,94,0.04))', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#EEF6F1' }}>Histórico completo no Pro</span>
              <span style={{ fontSize: 12, color: '#A3BCB0', lineHeight: 1.5 }}>No plano grátis você vê os últimos 7 dias.</span>
              <Link href="/dashboard/pro" className="zw-btn zw-btn-primary zw-btn-s">Conhecer o Pro</Link>
            </div>
          )}

          <button onClick={handleLogout} className="zw-nav" style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit', textAlign: 'left' }}>
            <LogOut size={18} aria-hidden /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}
