"use client"

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Plus, Wand2, Copy, Search, Filter, MoreHorizontal, LayoutTemplate, PlaySquare, Smartphone, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// TYPES
type TemplateCategory = 'TikTok UGC' | 'Vendas Diretas' | 'Unboxing' | 'Storytelling' | 'Trends'
interface Template {
  id: string
  title: string
  description: string
  category: TemplateCategory
  duration: string
  tags: string[]
  icon: React.ElementType
  color: string
}

// MOCK DATA
const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'UGC Nativo (Hook Forte)',
    description: 'Framework perfeito para TikTok. Foca em um gancho agressivo nos primeiros 3 segundos, seguido de prova social.',
    category: 'TikTok UGC',
    duration: '15-30s',
    tags: ['Alta Conversão', 'Dinâmico'],
    icon: Smartphone,
    color: 'bg-pink-500',
  },
  {
    id: '2',
    title: 'Venda Direta (Oferta Irresistível)',
    description: 'Estrutura clássica de VSL curta para Instagram Ads. Problema > Agitação > Solução > Oferta > Escassez.',
    category: 'Vendas Diretas',
    duration: '30-45s',
    tags: ['Fundo de Funil', 'ROAS Alto'],
    icon: Zap,
    color: 'bg-blue-500',
  },
  {
    id: '3',
    title: 'Unboxing Emocional',
    description: 'Foco na experiência de receber o pacote. Mostra detalhes do produto com ASMR e música suave.',
    category: 'Unboxing',
    duration: '45-60s',
    tags: ['Awareness', 'Brand Building'],
    icon: PlaySquare,
    color: 'bg-emerald-500',
  },
  {
    id: '4',
    title: 'Storytelling do Fundador',
    description: 'Conecta a marca com o público contando a história de como o produto resolveu uma dor real.',
    category: 'Storytelling',
    duration: '60s+',
    tags: ['Conexão', 'Topo de Funil'],
    icon: LayoutTemplate,
    color: 'bg-purple-500',
  },
  {
    id: '5',
    title: 'Trend de Transição',
    description: 'Vídeo rápido focado puramente em sincronia com música em alta do TikTok/Reels.',
    category: 'Trends',
    duration: '10-15s',
    tags: ['Viral', 'Música em Alta'],
    icon: Smartphone,
    color: 'bg-orange-500',
  }
]

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'Todos'>('Todos')

  const categories: (TemplateCategory | 'Todos')[] = ['Todos', 'TikTok UGC', 'Vendas Diretas', 'Unboxing', 'Storytelling', 'Trends']

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 h-full">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <LayoutTemplate className="text-indigo-400" size={32} />
              Templates de Roteiros
            </h1>
            <p className="text-gray-400 mt-1">Sua biblioteca de frameworks validados para treinar a IA (Gemini V03).</p>
          </div>
          <button className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-full flex items-center gap-2 font-bold transition-transform hover:scale-105 shadow-xl">
            <Plus size={20} />
            Criar Template
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 items-center shrink-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a24] border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-2 md:pb-0 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-[#1a1a24] text-gray-400 border border-white/5 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATES GRID (CANVA STYLE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {/* New Template Card CTA */}
          <div className="h-[280px] border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-500/20">
              <Plus className="text-gray-400 group-hover:text-indigo-400" size={28} />
            </div>
            <h3 className="text-white font-semibold text-lg">Novo Framework</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-[200px]">Crie uma nova estrutura de roteiro do zero.</p>
          </div>

          {/* Render Templates */}
          {filteredTemplates.map(template => {
            const Icon = template.icon
            return (
              <div key={template.id} className="group relative h-[280px] rounded-2xl overflow-hidden bg-[#151521] border border-white/5 hover:border-white/20 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col">
                {/* Visual Header / Cover */}
                <div className={`h-24 ${template.color} bg-opacity-20 flex items-center justify-center relative`}>
                  <div className={`w-12 h-12 rounded-xl ${template.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <button className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform" title="Usar com IA">
                      <Wand2 size={18} />
                    </button>
                    <button className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors" title="Duplicar">
                      <Copy size={18} />
                    </button>
                    <button className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors" title="Mais">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-gray-300">
                      {template.category}
                    </Badge>
                    <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                      <PlaySquare size={10} /> {template.duration}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {template.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                    {template.description}
                  </p>

                  <div className="flex gap-1.5 flex-wrap mt-auto">
                    {template.tags.map(tag => (
                      <span key={tag} className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-white/5 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <Filter size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum template encontrado</h3>
            <p className="text-gray-400">Tente ajustar seus filtros ou termos de busca.</p>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
