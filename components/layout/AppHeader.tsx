import { Search, Bell, HelpCircle } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="h-16 border-b border-white/5 glass flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar projetos, templates ou arquivos no Drive..." 
            className="w-full bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="text-gray-400 hover:text-white transition-colors">
          <HelpCircle size={20} />
        </button>
        <button className="text-gray-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></span>
        </button>
        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
          Exportar
        </button>
      </div>
    </header>
  );
}
