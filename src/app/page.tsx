'use client'

import { useState, useSyncExternalStore, useCallback, useEffect } from 'react'
import { Music, ListTodo, Settings, X, Layout, BarChart3, Focus, BookOpen, Coffee, Menu } from 'lucide-react'
import { BackgroundManager } from '@/components/Background/BackgroundManager'
import { HandwrittenClock } from '@/components/Clock/HandwrittenClock'
import { PomodoroTimer } from '@/components/Timer/PomodoroTimer'
import { TaskList } from '@/components/Tasks/TaskList'
import { SoundMixer } from '@/components/Sounds/SoundMixer'
import { SettingsPanel } from '@/components/Settings/SettingsPanel'
import { SceneSelector } from '@/components/Scenes/SceneSelector'
import { StatsPanel } from '@/components/Stats/StatsPanel'
import { Quote } from '@/components/Quote'
import { useSoundStore, useTaskStore, useSettingsStore, FocusMode, useTimerStore } from '@/stores'
import { useKeyboardShortcuts, shortcutHints } from '@/hooks/useKeyboardShortcuts'
import { cn } from '@/lib/utils'

type PanelType = 'scenes' | 'sounds' | 'tasks' | 'stats' | 'settings' | null

// Helper for client-side only rendering
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

// Greeting component
function Greeting() {
  const showDate = useSettingsStore((state) => state.showDate)
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    if (hour >= 17 && hour < 21) return 'Good evening'
    return 'Keep grinding'
  }

  return (
    <div className="text-right">
      <p className="text-white/50 text-sm font-light tracking-wide">
        {getGreeting()}
      </p>
      {showDate && (
        <p className="text-white/30 text-xs mt-0.5">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      )}
    </div>
  )
}

// Focus Mode Selector
function FocusModeSelector() {
  const focusMode = useSettingsStore((state) => state.focusMode)
  const setFocusMode = useSettingsStore((state) => state.setFocusMode)
  
  const modes: { id: FocusMode; label: string; icon: typeof Focus }[] = [
    { id: 'deepWork', label: 'Deep Work', icon: Focus },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'chill', label: 'Chill', icon: Coffee },
  ]

  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
      {modes.map((mode) => {
        const isActive = focusMode === mode.id
        const Icon = mode.icon
        
        return (
          <button
            key={mode.id}
            onClick={() => setFocusMode(mode.id)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all duration-300",
              isActive 
                ? "bg-white/10 text-white/90" 
                : "text-white/40 hover:text-white/60"
            )}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Main content component
function MainContent() {
  const [activePanel, setActivePanel] = useState<PanelType>(null)
  const [showTimer, setShowTimer] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Get store values with selectors
  const channels = useSoundStore((state) => state.channels)
  const stopAll = useSoundStore((state) => state.stopAll)
  const tasks = useTaskStore((state) => state.tasks)
  const activeTaskId = useTaskStore((state) => state.activeTaskId)
  const focusMode = useSettingsStore((state) => state.focusMode)
  
  // Check if any sound is playing
  const hasActiveSound = Object.values(channels).some(c => c.isPlaying)
  const activeTask = tasks.find(t => t.id === activeTaskId)

  // Keyboard shortcuts
  const handleToggleSounds = useCallback(() => {
    setActivePanel(prev => prev === 'sounds' ? null : 'sounds')
  }, [])

  const handleNewTask = useCallback(() => {
    setActivePanel('tasks')
  }, [])

  useKeyboardShortcuts({
    onToggleSounds: handleToggleSounds,
    onNewTask: handleNewTask,
  })

  const handleToggleView = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setShowTimer(prev => !prev)
      setIsTransitioning(false)
    }, 300)
  }, [])

  const panelConfig = {
    scenes: { label: 'Scenes', icon: Layout },
    sounds: { label: 'Sounds', icon: Music },
    tasks: { label: 'Tasks', icon: ListTodo },
    stats: { label: 'Stats', icon: BarChart3 },
    settings: { label: 'Settings', icon: Settings },
  }

  // Determine which panels to show based on focus mode
  const visiblePanels: PanelType[] = focusMode === 'deepWork' 
    ? ['tasks', 'stats', 'settings']
    : focusMode === 'chill'
    ? ['scenes', 'sounds', 'settings']
    : ['scenes', 'sounds', 'tasks', 'stats', 'settings']

  useEffect(() => {
    if (activePanel && !visiblePanels.includes(activePanel)) {
      setActivePanel(null)
    }
  }, [focusMode, activePanel])

  return (
    <>
      {/* Top Section */}
      <div className="flex justify-between items-start">
        <FocusModeSelector />
        <Greeting />
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        <div className={cn(
          "flex flex-col items-center gap-4 transition-all duration-500",
          isTransitioning && "opacity-0 scale-95"
        )}>
          {!showTimer ? (
            <>
              <button 
                onClick={handleToggleView}
                className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              >
                <HandwrittenClock />
                <p className="text-center text-white/30 text-xs mt-4 uppercase tracking-[3px] group-hover:text-white/50 transition-colors">
                  {focusMode === 'chill' ? 'Click for chill timer' : 'Click for timer'}
                </p>
              </button>

              {(focusMode === 'study' || focusMode === 'chill') && (
                <div className="mt-4">
                  <Quote />
                </div>
              )}

              {(focusMode === 'study' || focusMode === 'deepWork') && activeTask && (
                <div className="glass px-4 py-2 mt-2">
                  <p className="text-white/60 text-sm">→ {activeTask.text}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <PomodoroTimer />
              <button
                onClick={handleToggleView}
                className="text-white/30 text-xs uppercase tracking-[3px] hover:text-white/50 transition-colors mt-4"
              >
                Back to clock
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-end mt-auto gap-3">
        {focusMode === 'study' && (
          <div className="hidden lg:flex items-center gap-2 text-white/20 text-xs">
            {shortcutHints.slice(0, 3).map((hint, i) => (
              <span key={hint.key}>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/30">{hint.key}</kbd>
                <span className="ml-1">{hint.action}</span>
                {i < 2 && <span className="mx-2">·</span>}
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="glass px-4 py-2 rounded-xl text-white/70 hover:text-white/90 text-sm flex items-center gap-2"
          >
            <Menu className="w-4 h-4" />
            Menu
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-12 glass p-2 flex flex-col gap-1 min-w-[180px]">
              {visiblePanels.map((panel) => {
                if (!panel) return null
                const config = panelConfig[panel]
                const Icon = config.icon
                const isActive = activePanel === panel

                return (
                  <button
                    key={panel}
                    onClick={() => {
                      setActivePanel(isActive ? null : panel)
                      setIsMenuOpen(false)
                    }}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 text-sm',
                      isActive
                        ? 'bg-white/10 text-white/90'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{config.label}</span>
                    </span>
                    {panel === 'sounds' && hasActiveSound && (
                      <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Panel Modal */}
      {activePanel && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 md:p-8">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setActivePanel(null)}
          />
          
          <div className="relative glass w-full max-w-sm max-h-[70vh] overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-white/80 text-sm font-medium">
                {panelConfig[activePanel].label}
              </h2>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)] custom-scrollbar">
              {activePanel === 'scenes' && <SceneSelector />}
              {activePanel === 'sounds' && (
                <div className="space-y-3">
                  <SoundMixer />
                  {hasActiveSound && (
                    <button
                      onClick={stopAll}
                      className="w-full py-2 text-xs text-white/40 hover:text-white/60 uppercase tracking-wider transition-colors"
                    >
                      Stop all sounds
                    </button>
                  )}
                </div>
              )}
              {activePanel === 'tasks' && <TaskList />}
              {activePanel === 'stats' && <StatsPanel />}
              {activePanel === 'settings' && <SettingsPanel />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Home() {
  const isClient = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundManager />
      <div className="relative z-10 min-h-screen flex flex-col p-4 sm:p-6 md:p-8">
        {isClient ? (
          <MainContent />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white/20 text-sm animate-pulse">Loading...</div>
          </div>
        )}
      </div>
    </main>
  )
}
