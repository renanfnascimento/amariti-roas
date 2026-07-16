import Link from 'next/link';
import { Home, FolderOpen, CalendarDays, CloudUpload, Settings, PlusCircle, Video } from 'lucide-react';

export function AppSidebar() {
  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: FolderOpen, label: 'Meus Projetos', href: '/dashboard/projetos' },
    { icon: Video, label: 'Templates de Vídeo', href: '/dashboard/templates' },
    { icon: CloudUpload, label: 'Drive & Assets', href: '/dashboard/assets' },
    { icon: CalendarDays, label: 'Agendamentos', href: '/dashboard/agendamentos' },
    { icon: Settings, label: 'Configurações', href: '/dashboard/configuracoes' },
  ];

  return (
    <aside className="w-64 h-screen border-r border-white/5 glass flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ContentHub Pro
        </h1>
      </div>

      <div className="px-4 mb-6">
        <button className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-2.5 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]">
          <PlusCircle size={20} />
          <span>Criar Design</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
          >
            <item.icon size={20} className="text-gray-400 group-hover:text-indigo-400 transition-colors" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            US
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">Meu Workspace</p>
            <p className="text-xs text-gray-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
