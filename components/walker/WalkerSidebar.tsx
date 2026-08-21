'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard',            label: 'Início',      icon: '🏠' },
  { href: '/dashboard/relatorios', label: 'Relatórios',  icon: '📋' },
  { href: '/dashboard/financeiro', label: 'Financeiro',  icon: '💰' },
  { href: '/dashboard/perfil',     label: 'Perfil',      icon: '👤' },
  { href: '/dashboard/pro',        label: 'Plano Pro',   icon: '⭐' },
];

type Props = { profile: { name: string; plan: string; avatar_url: string | null } | null };

export default function WalkerSidebar({ profile }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col py-8 px-4 gap-2 shrink-0">
      <div className="px-2 mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Walker</p>
        <p className="font-bold text-gray-800 truncate">{profile?.name ?? '—'}</p>
        <span className={cn(
          'text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block',
          profile?.plan === 'pro' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
        )}>
          {profile?.plan === 'pro' ? 'Pro' : 'Gratuito'}
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
              pathname === item.href
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            )}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition mt-4">
        <span>🚪</span>Sair
      </button>
    </aside>
  );
}
