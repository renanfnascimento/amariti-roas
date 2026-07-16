import { AppLayout } from '@/components/layout/AppLayout';
import { Play, MoreHorizontal, Instagram, Facebook, Youtube, Share2 } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Campanha de Inverno - Reel',
    source: 'Canva Pro',
    status: 'Pronto para Postar',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop',
    platforms: [Instagram, Facebook],
    date: 'Hoje, 14:30',
  },
  {
    id: 2,
    title: 'Tutorial de Uso - Produto X',
    source: 'CapCut',
    status: 'Em Edição',
    thumbnail: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=400&auto=format&fit=crop',
    platforms: [Youtube, Instagram],
    date: 'Ontem',
  },
  {
    id: 3,
    title: 'Teaser Lançamento Veo3',
    source: 'Veo3',
    status: 'Agendado',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop',
    platforms: [Instagram],
    date: '18 Jul, 09:00',
  }
];

export default function HomePage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta! 🚀</h2>
        <p className="text-gray-400">Gerencie seus vídeos, edições e agendamentos em um só lugar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Play size={24} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-green-500/20 text-green-400 rounded-md">+12%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Vídeos Gerados (Mês)</h3>
          <p className="text-3xl font-bold text-white mt-1">148</p>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Share2 size={24} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-green-500/20 text-green-400 rounded-md">+5%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Postados nas Redes</h3>
          <p className="text-3xl font-bold text-white mt-1">92</p>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex flex-col h-full justify-center items-center text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
              <PlusCircle size={24} className="text-white" />
            </div>
            <h3 className="text-white font-semibold">Novo Projeto</h3>
            <p className="text-white/70 text-sm mt-1">Importar do Canva, CapCut ou Drive</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Projetos Recentes</h3>
        <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Ver todos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="glass-card rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="aspect-video relative overflow-hidden bg-gray-800">
              <img 
                src={project.thumbnail} 
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <Play size={18} fill="currentColor" />
                </button>
              </div>
              <div className="absolute top-3 left-3 flex gap-1">
                {project.platforms.map((Icon, i) => (
                  <div key={i} className="w-6 h-6 rounded-md bg-black/50 backdrop-blur-md flex items-center justify-center text-white/90">
                    <Icon size={14} />
                  </div>
                ))}
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-white/90 uppercase tracking-wider">
                  {project.source}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium truncate pr-2">{project.title}</h4>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                  project.status === 'Pronto para Postar' ? 'bg-green-500/10 text-green-400' :
                  project.status === 'Em Edição' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {project.status}
                </span>
                <span className="text-xs text-gray-500">{project.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
