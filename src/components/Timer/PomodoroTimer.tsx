'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { useTimerStore, useSettingsStore, TimerPhase } from '@/stores'
import { CircularProgress } from './CircularProgress'
import { cn } from '@/lib/utils'

interface PomodoroTimerProps {
  minimal?: boolean
}

const phaseLabels: Record<TimerPhase, string> = {
  focus: 'Focus',
  shortBreak: 'Break',
  longBreak: 'Long Break',
}

export function PomodoroTimer({ minimal = false }: PomodoroTimerProps) {
  const { 
    timeLeft, 
    isRunning, 
    phase, 
    sessionCount,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    start, 
    pause, 
    reset, 
    tick,
  } = useTimerStore()
  
  const { enableNotifications } = useSettingsStore()
  const notificationSentRef = useRef(false)

  // Calculate progress
  const getTotalTime = useCallback(() => {
    switch (phase) {
      case 'focus': return focusDuration
      case 'shortBreak': return shortBreakDuration
      case 'longBreak': return longBreakDuration
    }
  }, [phase, focusDuration, shortBreakDuration, longBreakDuration])

  const totalTime = getTotalTime()
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  // Timer tick
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, tick])

  // Notification on completion
  useEffect(() => {
    if (timeLeft <= 0 && !notificationSentRef.current && enableNotifications) {
      notificationSentRef.current = true
      
      if ('Notification' in window && Notification.permission === 'granted') {
        const label = phase === 'focus' ? 'Focus session' : 'Break'
        new Notification(`${label} complete!`, {
          body: phase === 'focus' 
            ? 'Time for a break!' 
            : 'Ready to focus again?',
          icon: '/logo.svg'
        })
      }
      
      // Play a subtle sound
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 523.25
        oscillator.type = 'sine'
        gainNode.gain.value = 0.08
        
        oscillator.start()
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch {
        // Audio not supported
      }
    }
    
    if (timeLeft > 0) {
      notificationSentRef.current = false
    }
  }, [timeLeft, phase, enableNotifications])

  // Request notification permission
  useEffect(() => {
    if (enableNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [enableNotifications])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Minimal version for main view
  if (minimal) {
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Timer display */}
        <CircularProgress
          progress={progress}
          size={180}
          strokeWidth={2}
          progressColor="rgba(255, 255, 255, 0.4)"
          trackColor="rgba(255, 255, 255, 0.06)"
        >
          <div className="flex flex-col items-center">
            <div className="font-handwritten text-4xl sm:text-5xl text-white/80 tracking-wider">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">
              {phaseLabels[phase]}
            </div>
          </div>
        </CircularProgress>

        {/* Minimal controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300",
              "bg-white/5 hover:bg-white/10",
              "text-white/40 hover:text-white/70"
            )}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={isRunning ? pause : start}
            className={cn(
              "p-3 rounded-full transition-all duration-300",
              "bg-white/10 hover:bg-white/15",
              "text-white/70 hover:text-white"
            )}
          >
            {isRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    )
  }

  // Full version for timer page
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Phase indicator */}
      <div className="text-sm text-white/40 uppercase tracking-[4px]">
        {phaseLabels[phase]} · Session {sessionCount + 1}
      </div>

      {/* Timer circle */}
      <CircularProgress
        progress={progress}
        size={280}
        strokeWidth={3}
        progressColor="rgba(255, 255, 255, 0.5)"
        trackColor="rgba(255, 255, 255, 0.06)"
      >
        <div className="flex flex-col items-center">
          <div className="font-handwritten text-6xl sm:text-7xl text-white/90 tracking-wider">
            {formatTime(timeLeft)}
          </div>
        </div>
      </CircularProgress>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className={cn(
            "p-3 rounded-full transition-all duration-300",
            "bg-white/5 hover:bg-white/10",
            "text-white/50 hover:text-white/80"
          )}
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={isRunning ? pause : start}
          className={cn(
            "p-4 rounded-full transition-all duration-300",
            "bg-white/10 hover:bg-white/15",
            "text-white/80 hover:text-white"
          )}
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  )
}
