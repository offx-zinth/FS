'use client'

import { Flame, Clock, Target, TrendingUp } from 'lucide-react'
import { useStatsStore } from '@/stores'
import { cn } from '@/lib/utils'

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function SimpleBarChart({ data, maxValue }: { data: number[]; maxValue: number }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date().getDay()
  
  return (
    <div className="flex items-end justify-between h-20 gap-1">
      {data.map((value, i) => {
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0
        const isToday = i === today
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className={cn(
                "w-full rounded-t transition-all duration-300",
                isToday ? "bg-white/30" : "bg-white/10"
              )}
              style={{ height: `${Math.max(height, 4)}%` }}
            />
            <span className={cn(
              "text-[10px]",
              isToday ? "text-white/60" : "text-white/30"
            )}>
              {days[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function StatsPanel() {
  const { sessions, streak, totalFocusTime } = useStatsStore()
  
  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0]
  const todayStats = sessions.find(s => s.date === today)
  
  // Calculate week data
  const todayDate = new Date()
  const weekData = new Array(7).fill(0)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(todayDate)
    date.setDate(todayDate.getDate() - (todayDate.getDay() - i))
    const dateStr = date.toISOString().split('T')[0]
    const session = sessions.find(s => s.date === dateStr)
    if (session) {
      weekData[i] = session.focusTime
    }
  }
  
  const maxWeekValue = Math.max(...weekData, 1)
  const weekTotal = weekData.reduce((acc, val) => acc + val, 0)

  const stats = [
    {
      icon: Flame,
      label: 'Streak',
      value: `${streak} days`,
      color: 'text-orange-400'
    },
    {
      icon: Clock,
      label: 'Today',
      value: formatTime(todayStats?.focusTime || 0),
      color: 'text-blue-400'
    },
    {
      icon: Target,
      label: 'Sessions',
      value: String(todayStats?.sessionsCompleted || 0),
      color: 'text-green-400'
    },
    {
      icon: TrendingUp,
      label: 'This Week',
      value: formatTime(weekTotal),
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="p-3 rounded-xl bg-white/5 space-y-1"
          >
            <div className="flex items-center gap-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-xs text-white/40">{stat.label}</span>
            </div>
            <p className="text-lg font-medium text-white/90">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="p-3 rounded-xl bg-white/5 space-y-3">
        <h4 className="text-xs text-white/40 uppercase tracking-wider">This Week</h4>
        <SimpleBarChart data={weekData} maxValue={maxWeekValue} />
      </div>

      {/* Total Focus Time */}
      <div className="text-center pt-2 border-t border-white/10">
        <p className="text-xs text-white/30">Total Focus Time</p>
        <p className="text-xl font-handwritten text-white/70 mt-1">
          {formatTime(totalFocusTime)}
        </p>
      </div>
    </div>
  )
}
