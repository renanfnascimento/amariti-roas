"use client"

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Calendar, LayoutGrid, List, Plus, Edit2, Clock, MapPin, Search } from 'lucide-react'

// TYPES
type Platform = 'TikTok Shop' | 'Instagram' | 'Facebook'
type Source = 'Gemini V03' | 'CapCut Pro' | 'Canva Pro'
type Status = 'Publicado' | 'Agendado' | 'Em Produção' | 'Rascunho' | 'Atrasado' | 'Erro na API'

interface Schedule {
  id: string
  title: string
  platform: Platform
  date: string
  time: string
  source: Source
  status: Status
}

// MOCK DATA
const mockSchedules: Schedule[] = [
  {
    id: '1',
    title: 'Review Produto X - Unboxing',
    platform: 'TikTok Shop',
    date: '2024-10-25',
    time: '14:30',
    source: 'CapCut Pro',
    status: 'Agendado'
  },
  {
    id: '2',
    title: 'Carrossel Dicas de Inverno',
    platform: 'Instagram',
    date: '2024-10-26',
    time: '10:00',
    source: 'Canva Pro',
    status: 'Em Produção'
  },
  {
    id: '3',
    title: 'Vídeo Vendas Final de Ano',
    platform: 'Facebook',
    date: '2024-10-24',
    time: '18:00',
    source: 'Gemini V03',
    status: 'Erro na API'
  },
  {
    id: '4',
    title: 'Bastidores da Loja',
    platform: 'Instagram',
    date: '2024-10-22',
    time: '09:00',
    source: 'CapCut Pro',
    status: 'Publicado'
  },
  {
    id: '5',
    title: 'Promoção Relâmpago',
    platform: 'TikTok Shop',
    date: '2024-10-24',
    time: '12:00',
    source: 'Canva Pro',
    status: 'Atrasado'
  },
]

export default function AgendamentosPage() {
  const [filter, setFilter] = useState<Platform | 'Todos'>('Todos')
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules)

  const filteredSchedules = filter === 'Todos' 
    ? schedules 
    : schedules.filter(s => s.platform === filter)

  const getStatusBadgeVariant = (status: Status) => {
    switch(status) {
      case 'Publicado':
      case 'Agendado':
        return 'success'
      case 'Em Produção':
      case 'Rascunho':
        return 'warning'
      case 'Atrasado':
      case 'Erro na API':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Calendário de Conteúdo</h1>
            <p className="text-gray-400 mt-1">Gerencie, agende e edite suas postagens em todas as redes.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-md flex items-center gap-2 font-medium transition-colors shadow-lg shadow-indigo-500/20">
            <Plus size={18} />
            Agendar Novo Vídeo
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-2">
          {['Todos', 'TikTok Shop', 'Instagram', 'Facebook'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item as Platform | 'Todos')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === item 
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* MAIN VIEW (TABS) */}
        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white/5 border border-white/5">
              <TabsTrigger value="list" className="gap-2">
                <List size={16} /> Visão Lista
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar size={16} /> Visão Calendário
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSchedules.map(schedule => (
                <div key={schedule.id} className="glass-card rounded-xl p-5 group flex flex-col gap-4 relative overflow-hidden transition-all hover:border-white/10">
                  <div className="flex justify-between items-start">
                    <Badge variant={getStatusBadgeVariant(schedule.status)}>{schedule.status}</Badge>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-md hover:bg-white/10">
                          <Edit2 size={14} />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Agendamento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Título do Vídeo</label>
                            <input type="text" defaultValue={schedule.title} className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Data</label>
                              <input type="date" defaultValue={schedule.date} className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Hora</label>
                              <input type="time" defaultValue={schedule.time} className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Status</label>
                            <select defaultValue={schedule.status} className="w-full bg-[#1a1a24] border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500">
                              <option value="Agendado">Agendado</option>
                              <option value="Em Produção">Em Produção</option>
                              <option value="Rascunho">Rascunho</option>
                              <option value="Publicado">Publicado</option>
                              <option value="Atrasado">Atrasado</option>
                              <option value="Erro na API">Erro na API</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Plataforma</label>
                            <select defaultValue={schedule.platform} className="w-full bg-[#1a1a24] border border-white/10 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500">
                              <option value="Instagram">Instagram</option>
                              <option value="TikTok Shop">TikTok Shop</option>
                              <option value="Facebook">Facebook</option>
                            </select>
                          </div>
                          <div className="pt-4 flex justify-end gap-2">
                            <DialogClose asChild>
                              <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancelar</button>
                            </DialogClose>
                            <DialogClose asChild>
                              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors">Salvar Alterações</button>
                            </DialogClose>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">{schedule.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                      <MapPin size={14} /> {schedule.platform} • {schedule.source}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-300 mt-2 bg-white/5 w-fit px-3 py-1.5 rounded-md border border-white/5">
                    <Clock size={14} className="text-indigo-400" />
                    <span>{schedule.date} às {schedule.time}</span>
                  </div>
                </div>
              ))}
              
              {filteredSchedules.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border border-dashed border-white/10 rounded-xl">
                  <Search size={40} className="mb-4 opacity-50" />
                  <p>Nenhum agendamento encontrado para esta visão.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="glass-card rounded-xl border border-white/5 p-8 text-center">
            <Calendar size={48} className="mx-auto text-indigo-400/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Visão Calendário (Mês)</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              A visualização em grade mensal está em construção. Por enquanto, utilize a visão em lista para gerenciar e editar seus agendamentos.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
