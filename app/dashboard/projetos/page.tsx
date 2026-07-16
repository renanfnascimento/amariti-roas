"use client"

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Wand2, Download, PlayCircle, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react'

// TYPES
type PipelineStatus = 
  | 'Ideação & Roteiro'
  | 'Captação / Gravação'
  | 'Edição em Andamento'
  | 'Revisão & Aprovação'
  | 'Pronto para Agendar'

type Platform = 'TikTok Shop' | 'Reels' | 'Shorts'
type Tool = 'Gemini V03' | 'Canva' | 'CapCut' | 'Câmera'

interface Project {
  id: string
  titulo: string
  plataforma_foco: Platform
  responsavel: string
  ferramenta_atual: Tool
  status: PipelineStatus
}

// MOCK DATA
const mockProjects: Project[] = [
  { id: 'p1', titulo: 'Trend Vestido Alfaiataria', plataforma_foco: 'TikTok Shop', responsavel: 'Ana', ferramenta_atual: 'Gemini V03', status: 'Ideação & Roteiro' },
  { id: 'p2', titulo: 'Dicas de Maquiagem Dia', plataforma_foco: 'Reels', responsavel: 'Carlos', ferramenta_atual: 'Câmera', status: 'Captação / Gravação' },
  { id: 'p3', titulo: 'Unboxing Novo Celular', plataforma_foco: 'Shorts', responsavel: 'João', ferramenta_atual: 'CapCut', status: 'Edição em Andamento' },
  { id: 'p4', titulo: 'Review Tênis Corrida', plataforma_foco: 'TikTok Shop', responsavel: 'Ana', ferramenta_atual: 'Canva', status: 'Revisão & Aprovação' },
  { id: 'p5', titulo: 'Promoção Relâmpago', plataforma_foco: 'Reels', responsavel: 'Carlos', ferramenta_atual: 'CapCut', status: 'Pronto para Agendar' },
  { id: 'p6', titulo: 'Tour pela Loja', plataforma_foco: 'Reels', responsavel: 'João', ferramenta_atual: 'Gemini V03', status: 'Ideação & Roteiro' },
]

const COLUMNS: PipelineStatus[] = [
  'Ideação & Roteiro',
  'Captação / Gravação',
  'Edição em Andamento',
  'Revisão & Aprovação',
  'Pronto para Agendar'
]

export default function ProjetosPage() {
  const [projects] = useState<Project[]>(mockProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const getPlatformBadgeVariant = (platform: Platform) => {
    switch (platform) {
      case 'TikTok Shop': return 'success'
      case 'Reels': return 'warning'
      case 'Shorts': return 'error'
      default: return 'default'
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Fábrica de Conteúdo</h1>
            <p className="text-gray-400 mt-1">Kanban de produção, desde a ideia até o agendamento.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors border border-white/5">
              <Download size={16} />
              Importar (CapCut/Canva)
            </button>
            <button className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors">
              <Wand2 size={16} />
              Gerar Script (V03)
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
              <Plus size={18} />
              Novo Projeto
            </button>
          </div>
        </div>

        {/* KANBAN BOARD */}
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map(column => {
              const columnProjects = projects.filter(p => p.status === column)
              return (
                <div key={column} className="w-80 flex flex-col gap-4">
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-semibold text-gray-200">{column}</h3>
                    <span className="bg-white/10 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                      {columnProjects.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col gap-3 overflow-y-auto border border-white/5">
                    {columnProjects.map(project => (
                      <Sheet key={project.id}>
                        <SheetTrigger asChild>
                          <div 
                            onClick={() => setSelectedProject(project)}
                            className="glass-card p-4 rounded-lg cursor-pointer hover:-translate-y-1 hover:border-indigo-500/50 transition-all group flex flex-col gap-3"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-semibold text-white leading-tight group-hover:text-indigo-300 transition-colors">
                                {project.titulo}
                              </h4>
                              <button className="text-gray-500 hover:text-white transition-colors shrink-0">
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge variant={getPlatformBadgeVariant(project.plataforma_foco)} className="text-[10px] px-1.5 py-0">
                                {project.plataforma_foco}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-white/10 text-gray-300">
                                {project.ferramenta_atual}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                  {project.responsavel.slice(0, 2)}
                                </div>
                                <span className="text-xs text-gray-400">{project.responsavel}</span>
                              </div>
                            </div>
                          </div>
                        </SheetTrigger>

                        {/* PROJECT DETAILS SHEET */}
                        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col border-l border-white/10 bg-[#151521]/95 backdrop-blur-xl p-0">
                          <div className="p-6 border-b border-white/10 flex-shrink-0">
                            <SheetHeader>
                              <SheetTitle className="text-2xl text-white pr-8">{selectedProject?.titulo}</SheetTitle>
                              <SheetDescription className="flex items-center gap-2 mt-2">
                                <Badge variant={getPlatformBadgeVariant(selectedProject?.plataforma_foco as Platform)}>{selectedProject?.plataforma_foco}</Badge>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-400">Responsável: {selectedProject?.responsavel}</span>
                              </SheetDescription>
                            </SheetHeader>
                          </div>

                          <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Video Placeholder */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-gray-300">Preview do Vídeo</h4>
                              <div className="w-full aspect-[9/16] max-h-[400px] bg-black/50 border border-white/10 rounded-xl flex items-center justify-center group cursor-pointer hover:bg-black/70 transition-colors">
                                <PlayCircle size={64} className="text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
                              </div>
                            </div>

                            {/* Script / Caption */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-300">Roteiro / Legenda (IA)</h4>
                                <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                                  <Wand2 size={12} /> Refazer com Gemini
                                </button>
                              </div>
                              <textarea 
                                className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 resize-none"
                                defaultValue={`Confira essa trend incrível! 🔥\n\nNeste vídeo mostramos os bastidores da nova coleção.\n\n👉 Link na bio para comprar!\n\n#trend #moda #novidade`}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 flex-shrink-0 bg-black/20">
                            <button className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                              <XCircle size={16} />
                              Reprovar
                            </button>
                            <button className="px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                              <CheckCircle2 size={16} />
                              Aprovar & Avançar
                            </button>
                          </div>
                        </SheetContent>
                      </Sheet>
                    ))}
                    
                    {columnProjects.length === 0 && (
                      <div className="h-full flex items-center justify-center text-gray-500 text-sm border border-dashed border-white/5 rounded-lg">
                        Vazio
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
