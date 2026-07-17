"use client"

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { Calendar as CalendarIcon, LayoutGrid, List, Plus, Edit2, Clock, MapPin, Search, ChevronLeft, ChevronRight, Video, Image as ImageIcon, MessageSquare, Wand2, CheckCircle2, AlertCircle } from 'lucide-react'
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, subMonths, addMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// TYPES
type Platform = 'TikTok Shop' | 'Instagram' | 'Facebook'
type Status = 'Pendente' | 'Gerando no Veo3' | 'Revisão' | 'Agendado'

interface ContentSlot {
  id: string
  title: string
  platform: Platform
  status: Status
}

interface DailyQuota {
  date: string // YYYY-MM-DD
  completed: number
  total: number // Always 12
  slots: ContentSlot[]
}

// MOCK DATA GENERATOR
const today = new Date()
const currentMonthStr = format(today, 'yyyy-MM')

const generateDailySlots = (completedCount: number): ContentSlot[] => {
  const slots: ContentSlot[] = []
  const platforms: Platform[] = ['TikTok Shop', 'Instagram', 'Facebook']
  let currentCompleted = 0

  platforms.forEach(platform => {
    for (let i = 1; i <= 4; i++) {
      let status: Status = 'Pendente'
      if (currentCompleted < completedCount) {
        status = 'Agendado'
        currentCompleted++
      } else if (currentCompleted === completedCount && completedCount < 12) {
        status = 'Gerando no Veo3'
      }

      slots.push({
        id: `${platform}-${i}`,
        title: `Vídeo ${String(i).padStart(2, '0')} - Trend Produto`,
        platform,
        status,
      })
    }
  })
  return slots
}

const mockQuotas: DailyQuota[] = [
  { date: `${currentMonthStr}-05`, completed: 12, total: 12, slots: generateDailySlots(12) },
  { date: `${currentMonthStr}-12`, completed: 12, total: 12, slots: generateDailySlots(12) },
  { date: `${currentMonthStr}-15`, completed: 0, total: 12, slots: generateDailySlots(0) },
  { date: format(today, 'yyyy-MM-dd'), completed: 4, total: 12, slots: generateDailySlots(4) }, // Today
  { date: `${currentMonthStr}-28`, completed: 0, total: 12, slots: generateDailySlots(0) },
]

export default function AgendamentosPage() {
  const [quotas] = useState<DailyQuota[]>(mockQuotas)
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedQuota, setSelectedQuota] = useState<DailyQuota | null>(null)

  const getStatusBadgeVariant = (status: Status) => {
    switch(status) {
      case 'Agendado': return 'success'
      case 'Gerando no Veo3': return 'warning'
      case 'Revisão': return 'default'
      case 'Pendente': return 'error'
      default: return 'default'
    }
  }

  const getPlatformIcon = (platform: Platform) => {
    switch(platform) {
      case 'TikTok Shop': return <Video size={14} className="text-pink-400" />
      case 'Instagram': return <ImageIcon size={14} className="text-emerald-400" />
      case 'Facebook': return <MessageSquare size={14} className="text-blue-400" />
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

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 h-full">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Calendário de Quotas (Alta Produção)</h1>
            <p className="text-gray-400 mt-1">Gerencie a meta diária de 12 vídeos (TikTok, IG, FB) gerados por IA.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-md flex items-center gap-2 font-medium transition-colors shadow-lg shadow-indigo-500/20">
            <Plus size={18} />
            Agendar Massa
          </button>
        </div>

        {/* MAIN VIEW (TABS) */}
        <Tabs defaultValue="calendar" className="w-full flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <TabsList className="bg-white/5 border border-white/5">
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarIcon size={16} /> Visão Quotas
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2" disabled>
                <List size={16} /> Visão Lista (Desativada)
              </TabsTrigger>
            </TabsList>
            
            {/* Calendar Controls */}
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
                
                // Get quota for this day
                const quota = quotas.find(q => q.date === dayStr) || { date: dayStr, completed: 0, total: 12, slots: generateDailySlots(0) }
                
                // Determine health visual
                let healthClass = "border-white/5 hover:bg-white/5"
                let textColor = "text-gray-400"
                if (quota.completed === 12) {
                  healthClass = "bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                  textColor = "text-green-400"
                } else if (quota.completed > 0) {
                  healthClass = "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20"
                  textColor = "text-yellow-400"
                } else if (isSameMonth(day, today) && day < today) {
                  // Past day empty = red
                  healthClass = "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                  textColor = "text-red-400"
                }

                return (
                  <Sheet key={day.toString()}>
                    <SheetTrigger asChild>
                      <div 
                        onClick={() => setSelectedQuota(quota)}
                        className={`min-h-[120px] p-3 border-r border-b relative flex flex-col transition-all cursor-pointer group ${healthClass} ${!isCurrentMonth ? 'opacity-30 pointer-events-none' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                            isToday ? 'bg-indigo-600 text-white' : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {format(day, 'd')}
                          </span>
                        </div>

                        {/* QUOTA SUMMARY UI */}
                        <div className="mt-auto flex flex-col items-center justify-center py-2 bg-black/40 rounded-lg border border-white/5 group-hover:border-white/20 transition-colors">
                          <div className="text-2xl font-bold tracking-tighter flex items-baseline gap-1">
                            <span className={textColor}>{quota.completed}</span>
                            <span className="text-gray-500 text-sm font-medium">/12</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-semibold uppercase mt-1 tracking-wider">
                            Vídeos Prontos
                          </span>
                        </div>
                        
                        {/* Progress bar visual */}
                        <div className="w-full h-1 bg-black/50 rounded-full mt-3 overflow-hidden">
                          <div 
                            className={`h-full ${quota.completed === 12 ? 'bg-green-500' : quota.completed > 0 ? 'bg-yellow-500' : 'bg-red-500/50'}`}
                            style={{ width: `${(quota.completed / 12) * 100}%` }}
                          />
                        </div>
                      </div>
                    </SheetTrigger>

                    {/* DAILY PRODUCTION SHEET */}
                    {selectedQuota && (
                      <SheetContent className="w-[400px] sm:w-[600px] flex flex-col border-l border-white/10 bg-[#151521]/95 backdrop-blur-xl p-0">
                        <div className="p-6 border-b border-white/10 flex-shrink-0 bg-black/20">
                          <SheetHeader>
                            <SheetTitle className="text-2xl text-white">Produção do Dia</SheetTitle>
                            <SheetDescription className="text-base text-gray-400 mt-1 flex items-center justify-between">
                              <span>{format(parseISO(selectedQuota.date), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                              <span className="font-bold text-white px-3 py-1 bg-white/10 rounded-full">
                                {selectedQuota.completed} / 12 Prontos
                              </span>
                            </SheetDescription>
                          </SheetHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                          {['TikTok Shop', 'Instagram', 'Facebook'].map(platform => {
                            const platformSlots = selectedQuota.slots.filter(s => s.platform === platform)
                            return (
                              <div key={platform} className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                  {getPlatformIcon(platform as Platform)}
                                  <h3 className="font-semibold text-white">{platform}</h3>
                                  <span className="text-xs text-gray-500 ml-auto">4 Slots</span>
                                </div>
                                
                                <div className="space-y-2">
                                  {platformSlots.map(slot => (
                                    <div key={slot.id} className="glass-card p-3 rounded-lg flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{slot.title}</span>
                                        <Badge variant={getStatusBadgeVariant(slot.status)} className="w-fit text-[10px] px-1.5 py-0">
                                          {slot.status}
                                        </Badge>
                                      </div>
                                      
                                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold rounded transition-all border border-indigo-500/30 hover:border-indigo-500">
                                        <Wand2 size={12} />
                                        Gerar Script Veo3
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </SheetContent>
                    )}
                  </Sheet>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
