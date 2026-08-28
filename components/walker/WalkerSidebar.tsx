'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '/dashboard',            label: 'Início',      icon: HomeIcon },
  { href: '/dashboard/agenda',     label: 'Agenda',      icon: CalendarIcon },
  { href: '/dashboard/relatorios', label: 'Relatórios',  icon: ReportIcon },
  { href: '/dashboard/servicos',   label: 'Serviços',    icon: ServiceIcon },
  { href: '/dashboard/financeiro', label: 'Financeiro',  icon: FinanceIcon },
  { href: '/dashboard/perfil',     label: 'Perfil',      icon: ProfileIcon },
  { href: '/dashboard/pro',        label: 'Plano Pro',   icon: SparklesIcon },
];

type Props = { profile: { name: string; plan: string; avatar_url: string | null; username?: string | null } | null };

export default function WalkerSidebar({ profile }: Props) {
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

  return (
    <>
      {/* Hambúrguer — só aparece em mobile via CSS */}
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </button>

      {/* Overlay escuro ao abrir no mobile */}
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

    <aside className={`dashboard-sidebar${open ? ' open' : ''}`} style={{
      width: 240,
      minHeight: '100vh',
      background: '#0D2926',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      flexShrink: 0,
      position: 'fixed',
      top: 0, left: 0,
      height: '100%',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px 22px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-simbolo-branco.png" alt="Zupet Walker" width={28} height={28} style={{ objectFit: 'contain', display: 'block' }} />
        <span style={{ fontSize: 14.5, fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em' }}>
          Zupet Walker
        </span>
      </div>

      {/* Profile card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.07)', borderRadius: 10,
        padding: '10px 12px', marginBottom: 20,
      }}>
        <div style={{
          width: 34, height: 34,
          background: 'rgba(0,198,167,0.25)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#00C6A7',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.name ?? '—'}
          </p>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
            {profile?.plan === 'pro' ? '✦ Pro' : 'Plano gratuito'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 12px',
              borderRadius: 9,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? '#ffffff' : 'rgba(255,255,255,0.52)',
              background: active ? 'rgba(0,198,167,0.18)' : 'transparent',
              transition: 'background 0.12s, color 0.12s',
            }}>
              <div style={{
                width: 30, height: 30,
                borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'rgba(0,198,167,0.2)' : 'transparent',
                flexShrink: 0,
              }}>
                <Icon active={active} />
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Link Público Pro */}
      {profile?.plan === 'pro' && profile.username && (
        <a
          href={`https://zupet-walker-dashboard-b9al.vercel.app/w/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            margin: '0 0 8px', padding: '9px 12px',
            borderRadius: 9, textDecoration: 'none',
            background: 'rgba(0,198,167,0.12)',
            border: '1px solid rgba(0,198,167,0.25)',
            fontSize: 12, fontWeight: 600, color: '#00C6A7',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C6A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Meu link público ↗
        </a>
      )}
      {profile?.plan === 'pro' && !profile.username && (
        <a
          href="/dashboard/perfil"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            margin: '0 0 8px', padding: '9px 12px',
            borderRadius: 9, textDecoration: 'none',
            background: 'rgba(0,198,167,0.06)',
            border: '1px dashed rgba(0,198,167,0.2)',
            fontSize: 12, fontWeight: 500, color: 'rgba(0,198,167,0.6)',
          }}
        >
          + Definir username Pro
        </a>
      )}

      {/* Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 12 }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 11,
          padding: '10px 12px', borderRadius: 9,
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 500,
          color: 'rgba(255,255,255,0.35)',
          width: '100%', fontFamily: 'inherit',
          transition: 'color 0.12s',
        }}>
          <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LogoutIcon />
          </div>
          Sair
        </button>
      </div>
    </aside>
    </>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  const c = active ? '#ffffff' : 'rgba(255,255,255,0.6)';
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={c}>
      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.69-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"/>
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.43Z"/>
    </svg>
  );
}
function ReportIcon({ active }: { active?: boolean }) {
  const c = active ? '#ffffff' : 'rgba(255,255,255,0.6)';
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={c}>
      <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clipRule="evenodd"/>
      <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Zm-2.25 3a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Zm-2.25 3a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/>
    </svg>
  );
}
function FinanceIcon({ active }: { active?: boolean }) {
  const c = active ? '#ffffff' : 'rgba(255,255,255,0.6)';
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={c}>
      <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"/>
      <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd"/>
      <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z"/>
    </svg>
  );
}
function ProfileIcon({ active }: { active?: boolean }) {
  const c = active ? '#ffffff' : 'rgba(255,255,255,0.6)';
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={c}>
      <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd"/>
    </svg>
  );
}
function SparklesIcon({ active }: { active?: boolean }) {
  const c = active ? '#ffffff' : 'rgba(255,255,255,0.6)';
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={c}>
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd"/>
    </svg>
  );
}
function CalendarIcon({ active }: { active?: boolean }) {
  const c = active ? '#ffffff' : 'rgba(255,255,255,0.6)';
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={c}>
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd"/>
    </svg>
  );
}
function ServiceIcon({ active }: { active?: boolean }) {
  const c = active ? '#ffffff' : 'rgba(255,255,255,0.6)';
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={c}>
      <path fillRule="evenodd" d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.772.334 1.454.218 2.478 1.483 2.478 2.9v3.542a4.508 4.508 0 0 1-2.25 3.899l-1.96 1.125a4.5 4.5 0 0 1-2.25.607H9.25a4.5 4.5 0 0 1-2.25-.607l-1.96-1.125A4.508 4.508 0 0 1 2.79 12v-3.54c0-1.417 1.024-2.682 2.478-2.9.915-.137 1.839-.249 2.772-.334V5.25Zm4.5-1.5a1.5 1.5 0 0 0-1.5 1.5v.141l3 .002V5.25a1.5 1.5 0 0 0-1.5-1.5Zm-6.43 6.964A3.01 3.01 0 0 0 4.322 12a3.01 3.01 0 0 0 1.498 2.607l1.96 1.125a3 3 0 0 0 1.5.405h5.44a3 3 0 0 0 1.5-.405l1.96-1.125A3.01 3.01 0 0 0 19.678 12a3.01 3.01 0 0 0-1.25-1.286A51.964 51.964 0 0 0 12 9.75c-2.115 0-4.19.14-6.18.414A3.01 3.01 0 0 0 5.57 10.714ZM12 12.75a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0V13.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)">
      <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
    </svg>
  );
}
