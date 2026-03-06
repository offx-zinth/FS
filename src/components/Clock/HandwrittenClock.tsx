'use client'

import { useState, useEffect } from 'react'
import { useSettingsStore } from '@/stores'
import { cn } from '@/lib/utils'

export function HandwrittenClock() {
  const clockFormat = useSettingsStore((state) => state.clockFormat)
  const showSeconds = useSettingsStore((state) => state.showSeconds)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = () => {
    let hours = time.getHours()
    const minutes = time.getMinutes()
    const seconds = time.getSeconds()

    if (clockFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      if (showSeconds) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`
      }
      return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`
    }

    if (showSeconds) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative">
      <div 
        className={cn(
          "font-handwritten text-7xl sm:text-8xl md:text-9xl lg:text-[140px]",
          "text-white/90 select-none",
          "tracking-[3px] leading-none",
          "animate-slow-glow"
        )}
      >
        {formatTime()}
      </div>
    </div>
  )
}
