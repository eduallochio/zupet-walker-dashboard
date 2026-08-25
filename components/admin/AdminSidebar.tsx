'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin',             label: 'Visão Geral',  icon: '📊' },
  { href: '/admin/walkers',     label: 'Walkers',      icon: '🦮' },
  { href: '/admin/pagamentos',  label: 'Pagamentos',   icon: '💰' },
  { href: '/admin/cupons',      label: 'Cupons',       icon: '🎟️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col py-8 px-4 gap-2 shrink-0">
      <div className="px-2 mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Admin</p>
        <p className="font-bold text-white">Zupet Walker</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
              pathname === item.href
                ? 'bg-emerald-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-gray-800 transition mt-4">
        <span>🚪</span>Sair
      </button>
    </aside>
  );
}
