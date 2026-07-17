"use client"

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Video, Plus, CheckCircle2 } from 'lucide-react'
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TikTokCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Mock de postagens finais
  const mockPosts = [
    { date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', title: 'Trend Saia', status: 'posted' },
    { date: format(new Date(), 'yyyy-MM-dd'), time: '15:00', title: 'Review Calça', status: 'scheduled' },
    { date: format(new Date(), 'yyyy-MM-dd'), time: '19:00', title: 'Oferta Blusa', status: 'scheduled' },
    { date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '10:00', title: 'Dica de Look', status: 'scheduled' }
  ]

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
      <div className="flex flex-col h-full">
        
        {/* HEADER TIKTOK VIBE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 mb-6 border-b border-[#fe2c55]/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25f4ee] to-[#fe2c55]">
                Calendário TikTok
              </span>
            </h1>
            <p className="text-gray-400 mt-1">Agendamento final e horários de publicação (10h, 15h, 19h).</p>
          </div>
          <button className="bg-gradient-to-r from-[#25f4ee] to-[#fe2c55] hover:opacity-90 text-white px-5 py-2.5 rounded-md flex items-center gap-2 font-bold transition-opacity shadow-[0_0_15px_rgba(254,44,85,0.3)]">
            <Plus size={18} />
            Agendar Novo Post
          </button>
        </div>

        {/* CALENDAR CONTAINER */}
        <div className="flex-1 min-h-0 bg-[#121212] border border-white/5 rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
          
          {/* Subtle TikTok Glow Background */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#25f4ee]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#fe2c55]/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40 relative z-10 shrink-0">
            <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
              <CalendarIcon size={20} className="text-[#25f4ee]" />
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 bg-black/60 border-b border-white/5 shrink-0 relative z-10">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dayName => (
              <div key={dayName} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider border-r border-white/5 last:border-0">
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr relative z-10">
            {calendarDays.map((day, idx) => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const isCurrentMonth = isSameMonth(day, monthStart)
              const isToday = isSameDay(day, new Date())
              
              const dayPosts = mockPosts.filter(p => p.date === dayStr)

              return (
                <div 
                  key={day.toString()}
                  className={`min-h-[140px] p-2 border-r border-b border-white/5 relative flex flex-col transition-colors group cursor-pointer hover:bg-white/5
                    ${!isCurrentMonth ? 'bg-black/40 opacity-40' : 'bg-transparent'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday 
                        ? 'bg-gradient-to-r from-[#25f4ee] to-[#fe2c55] text-white shadow-lg' 
                        : 'text-gray-400 group-hover:text-white'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] font-bold text-[#25f4ee] bg-[#25f4ee]/10 px-1.5 py-0.5 rounded">
                        {dayPosts.length} posts
                      </span>
                    )}
                  </div>

                  {/* Posts do dia */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                    {dayPosts.map((post, pIdx) => (
                      <div 
                        key={pIdx} 
                        className={`text-xs p-1.5 rounded flex items-center gap-1.5 border transition-all hover:scale-[1.02] ${
                          post.status === 'posted'
                            ? 'bg-green-500/10 border-green-500/20 text-green-300'
                            : 'bg-black/50 border-white/10 text-gray-200'
                        }`}
                      >
                        {post.status === 'posted' ? (
                          <CheckCircle2 size={12} className="shrink-0" />
                        ) : (
                          <Clock size={12} className="shrink-0 text-gray-400" />
                        )}
                        <span className="font-mono text-[10px] opacity-70">{post.time}</span>
                        <span className="truncate font-medium">{post.title}</span>
                      </div>
                    ))}
                    
                    {dayPosts.length === 0 && isCurrentMonth && day >= new Date() && (
                      <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={14} />
                        </div>
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
