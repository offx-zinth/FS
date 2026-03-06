'use client'

import { useEffect, useCallback } from 'react'
import { useTimerStore, useSettingsStore } from '@/stores'

interface KeyboardShortcutsConfig {
  onToggleSounds?: () => void
  onNewTask?: () => void
  onToggleFullscreen?: () => void
  onResetTimer?: () => void
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const { enableKeyboardShortcuts } = useSettingsStore()
  const { isRunning, start, pause, reset } = useTimerStore()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enableKeyboardShortcuts) return
    
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault()
        if (isRunning) {
          pause()
        } else {
          start()
        }
        break
      
      case 'n':
        config.onNewTask?.()
        break
      
      case 's':
        config.onToggleSounds?.()
        break
      
      case 'f':
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.documentElement.requestFullscreen()
        }
        break
      
      case 'r':
        reset()
        config.onResetTimer?.()
        break
    }
  }, [enableKeyboardShortcuts, isRunning, start, pause, reset, config])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const shortcutHints = [
  { key: 'Space', action: 'Start/Pause' },
  { key: 'N', action: 'New task' },
  { key: 'S', action: 'Sounds' },
  { key: 'F', action: 'Fullscreen' },
  { key: 'R', action: 'Reset' },
]
