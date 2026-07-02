'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Package,
  Store,
  Kanban,
  Megaphone,
  Music2,
  Globe,
  Plug,
  BarChart2,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Estrutura de navegação ────────────────────────────────────────────────────

interface NavItem {
  href?:      string;
  label:      string;
  sublabel?:  string;
  icon:       LucideIcon;
  disabled?:  boolean;
}

interface NavGroup {
  id:     string;
  label:  string;
  items:  NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'marketplaces',
    label: 'Marketplaces',
    items: [
      { href: '/shopee-ads?shop=1',                   label: 'Shopee Renan',        sublabel: 'Conta ativa',      icon: ShoppingBag },
      { href: '/crm-anuncios',                        label: 'CRM Anúncios',        sublabel: 'Ciclo de vida',    icon: Kanban      },
      { href: '/dashboard/shopee-intelligence',       label: 'Inteligência Shopee', sublabel: 'ROAS · n8n',       icon: BarChart2   },
      { label: 'Shopee Amariti',    icon: ShoppingBag,  disabled: true },
      { href: '/dashboard/vendas-ml', label: 'Mercado Livre', sublabel: 'Performance · ROAS', icon: ShoppingCart },
      { label: 'Amazon',            icon: Package,      disabled: true },
      { label: 'Magalu',            icon: Store,        disabled: true },
    ],
  },
  {
    id: 'ads',
    label: 'Ads Gerenciados',
    items: [
      { label: 'Shopee Ads',   icon: Megaphone, disabled: true },
      { label: 'Mercado Ads',  icon: Megaphone, disabled: true },
      { label: 'TikTok Ads',  icon: Music2,    disabled: true },
    ],
  },
  {
    id: 'externo',
    label: 'Tráfego Externo',
    items: [
      { label: 'Google Ads',   icon: Globe, disabled: true },
      { label: 'Facebook Ads', icon: Globe, disabled: true },
    ],
  },
];

// ── Layout ────────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(['marketplaces', 'ads', 'externo']),
  );

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function isActive(href?: string) {
    if (!href) return false;
    return pathname === href.split('?')[0];
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 text-gray-100 flex flex-col overflow-hidden">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-800">
          <span className="text-base font-bold tracking-tight text-white">Amariti ROAS</span>
          <p className="text-[10px] text-gray-500 mt-0.5">Hub de Performance</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">

          {/* Visão Geral */}
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-2',
              pathname === '/'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white',
            )}
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            Visão Geral
          </Link>

          <div className="border-t border-gray-800 mb-2" />

          {/* Grupos com accordion */}
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroups.has(group.id);
            return (
              <div key={group.id} className="mb-1">

                {/* Cabeçalho do grupo */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <span>{group.label}</span>
                  {isOpen
                    ? <ChevronDown className="h-3 w-3" />
                    : <ChevronRight className="h-3 w-3" />}
                </button>

                {/* Itens do grupo */}
                {isOpen && (
                  <div className="mt-0.5 mb-2 space-y-0.5">
                    {group.items.map((item) => {

                      /* Item desabilitado */
                      if (item.disabled) {
                        return (
                          <div
                            key={item.label}
                            className="flex items-center gap-2 rounded-md px-3 py-1.5 cursor-not-allowed"
                          >
                            <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-gray-700" />
                            <span className="text-xs text-gray-700 flex-1 truncate">{item.label}</span>
                            <span className="text-[9px] bg-gray-800 text-gray-600 rounded px-1.5 py-0.5 flex-shrink-0">
                              Em breve
                            </span>
                          </div>
                        );
                      }

                      /* Item ativo ou navegável */
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href!}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors group',
                            active
                              ? 'bg-orange-600/20 text-orange-400'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                          )}
                        >
                          <item.icon className={cn('h-3.5 w-3.5 flex-shrink-0', active && 'text-orange-400')} />
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-xs font-semibold leading-tight truncate', active && 'text-orange-400')}>
                              {item.label}
                            </p>
                            {item.sublabel && (
                              <p className={cn(
                                'text-[10px] leading-tight truncate',
                                active ? 'text-orange-400/60' : 'text-gray-600 group-hover:text-gray-400',
                              )}>
                                {item.sublabel}
                              </p>
                            )}
                          </div>
                          {active && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-gray-800 mt-1 mb-2" />

          {/* Integrações */}
          <Link
            href="/integracoes"
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/integracoes'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white',
            )}
          >
            <Plug className="h-4 w-4 flex-shrink-0" />
            Integrações
          </Link>
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800">
          <p className="text-[10px] text-gray-600">v0.2.0 · Hub Multi-Marketplace</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
