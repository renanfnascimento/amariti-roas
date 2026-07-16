"use client"

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Calendar as CalendarIcon, LayoutGrid, List, Plus, Edit2, Clock, MapPin, Search, ChevronLeft, ChevronRight, Video, Image as ImageIcon, MessageSquare } from 'lucide-react'
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

// Generate dates dynamically based on current month so calendar always has events
const today = new Date()
const currentMonthStr = format(today, 'yyyy-MM')

const mockSchedules: Schedule[] = [
  { id: '1', title: 'Review Produto X', platform: 'TikTok Shop', date: `${currentMonthStr}-05`, time: '14:30', source: 'CapCut Pro', status: 'Agendado' },
  { id: '2', title: 'Dicas de Inverno', platform: 'Instagram', date: `${currentMonthStr}-12`, time: '10:00', source: 'Canva Pro', status: 'Em Produção' },
  { id: '3', title: 'Vendas Fim de Ano', platform: 'Facebook', date: `${currentMonthStr}-12`, time: '18:00', source: 'Gemini V03', status: 'Erro na API' },
  { id: '4', title: 'Bastidores Loja', platform: 'Instagram', date: `${currentMonthStr}-18`, time: '09:00', source: 'CapCut Pro', status: 'Publicado' },
  { id: '5', title: 'Promo Relâmpago', platform: 'TikTok Shop', date: `${currentMonthStr}-25`, time: '12:00', source: 'Canva Pro', status: 'Atrasado' },
  { id: '6', title: 'Trend Vestido', platform: 'TikTok Shop', date: `${currentMonthStr}-28`, time: '19:00', source: 'CapCut Pro', status: 'Rascunho' },
]

export default function AgendamentosPage() {
  const [filter, setFilter] = useState<Platform | 'Todos'>('Todos')
  const [schedules] = useState<Schedule[]>(mockSchedules)
  const [currentDate, setCurrentDate] = useState(new Date())

  const filteredSchedules = filter === 'Todos' 
    ? schedules 
    : schedules.filter(s => s.platform === filter)

  const getStatusColor = (status: Status) => {
    switch(status) {
      case 'Publicado':
      case 'Agendado': return 'bg-green-500'
      case 'Em Produção':
      case 'Rascunho': return 'bg-yellow-500'
      case 'Atrasado':
      case 'Erro na API': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: Status) => {
    switch(status) {
      case 'Publicado':
      case 'Agendado': return 'success'
      case 'Em Produção':
      case 'Rascunho': return 'warning'
      case 'Atrasado':
      case 'Erro na API': return 'error'
      default: return 'default'
    }
  }

  const getPlatformIcon = (platform: Platform) => {
    switch(platform) {
      case 'TikTok Shop': return <Video size={10} className="mr-1" />
      case 'Instagram': return <ImageIcon size={10} className="mr-1" />
      case 'Facebook': return <MessageSquare size={10} className="mr-1" />
    }
  }

  // --- CALENDAR LOGIC ---
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = []
  let day = startDate
  while (day <= endDate) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  // --- REUSABLE EDIT DIALOG ---
  const EditScheduleDialog = ({ schedule, children }: { schedule: Schedule, children: React.ReactNode }) => (
    <Dialog>
      <DialogTrigger asChild>
        {children}
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
  )

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 h-full">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
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
        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
        <Tabs defaultValue="calendar" className="w-full flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <TabsList className="bg-white/5 border border-white/5">
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarIcon size={16} /> Visão Calendário
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List size={16} /> Visão Lista
              </TabsTrigger>
            </TabsList>
            
            {/* Calendar Controls (Only visible typically on calendar view via CSS if we wanted, but putting it globally for simplicity or within the tab content) */}
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-lg font-bold text-white capitalize min-w-[140px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <button onClick={nextMonth} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <TabsContent value="calendar" className="flex-1 min-h-0 m-0 border border-white/5 bg-black/20 rounded-xl overflow-hidden flex flex-col">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 bg-white/5 border-b border-white/5 shrink-0">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dayName => (
                <div key={dayName} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider border-r border-white/5 last:border-0">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
              {calendarDays.map((day, idx) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const isCurrentMonth = isSameMonth(day, monthStart)
                const isToday = isSameDay(day, today)
                
                // Get events for this day
                const dayEvents = filteredSchedules.filter(s => s.date === dayStr)
                // Limit to max 3 events to show, others behind +N
                const visibleEvents = dayEvents.slice(0, 3)
                const hiddenEventsCount = dayEvents.length - 3

                return (
                  <div 
                    key={day.toString()} 
                    className={`min-h-[120px] p-2 border-r border-b border-white/5 relative flex flex-col gap-1 transition-colors hover:bg-white/5 ${
                      !isCurrentMonth ? 'bg-black/40 opacity-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-gray-400'
                      }`}>
                        {format(day, 'd')}
                      </span>
                    </div>

                    {/* MICRO UI EVENTS */}
                    <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
                      {visibleEvents.map(event => (
                        <EditScheduleDialog key={event.id} schedule={event}>
                          <div className={`text-left w-full group cursor-pointer flex items-center bg-[#151521] border border-white/10 rounded pl-1.5 pr-2 py-1 hover:border-indigo-500/50 transition-all relative overflow-hidden`}>
                            {/* Color Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(event.status)}`} />
                            
                            <div className="flex items-center truncate pl-1">
                              {getPlatformIcon(event.platform)}
                              <span className="text-[10px] font-medium text-gray-300 truncate group-hover:text-white transition-colors">
                                {event.time} - {event.title}
                              </span>
                            </div>
                          </div>
                        </EditScheduleDialog>
                      ))}

                      {hiddenEventsCount > 0 && (
                        <div className="text-[10px] text-gray-500 font-medium px-1 text-center mt-1">
                          + {hiddenEventsCount} a mais
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSchedules.map(schedule => (
                <div key={schedule.id} className="glass-card rounded-xl p-5 group flex flex-col gap-4 relative overflow-hidden transition-all hover:border-white/10">
                  <div className="flex justify-between items-start">
                    <Badge variant={getStatusBadgeVariant(schedule.status)}>{schedule.status}</Badge>
                    
                    <EditScheduleDialog schedule={schedule}>
                      <button className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-md hover:bg-white/10">
                        <Edit2 size={14} />
                      </button>
                    </EditScheduleDialog>
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

        </Tabs>
      </div>
    </AppLayout>
  )
}
