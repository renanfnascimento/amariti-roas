'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Globe,
  Music2,
  Plug,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/shopee-ads', label: 'Shopee Ads', icon: ShoppingBag },
  { href: '/meta-ads', label: 'Meta Ads', icon: Globe },
  { href: '/tiktok-ads', label: 'TikTok Ads', icon: Music2 },
  { href: '/integracoes', label: 'Integrações', icon: Plug },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar — somente desktop */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-gray-900 text-gray-100 flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="text-lg font-bold tracking-tight text-white">
            Amariti ROAS
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">v0.1.0 — Setup Inicial</p>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — somente mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-700 flex items-center justify-around z-50">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors',
              pathname === href ? 'text-orange-400' : 'text-gray-400'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate max-w-[50px] text-center leading-tight">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
