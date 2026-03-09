import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// TYPES
// ============================================

export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak'
export type FocusMode = 'deepWork' | 'study' | 'chill'

export interface TimerState {
  timeLeft: number
  isRunning: boolean
  phase: TimerPhase
  sessionCount: number
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  nextPhase: () => void
  setDurations: (focus: number, shortBreak: number, longBreak: number) => void
}

export interface Task {
  id: string
  text: string
  completed: boolean
  order: number
  priority: 'low' | 'medium' | 'high'
  estimatedSessions: number
  completedSessions: number
  createdAt: number
}

export interface TaskState {
  tasks: Task[]
  activeTaskId: string | null
  addTask: (text: string, priority?: Task['priority'], estimatedSessions?: number) => void
  removeTask: (id: string) => void
  toggleTask: (id: string) => void
  setActiveTask: (id: string | null) => void
  updateTaskSessions: (id: string, completed: number) => void
  reorderTasks: (tasks: Task[]) => void
}

export type SoundType = 'rain' | 'wind' | 'forest' | 'fireplace' | 'cafe' | 'keyboard' | 'lofi'

export interface SoundChannel {
  type: SoundType
  volume: number
  isPlaying: boolean
}

export interface SoundState {
  channels: Record<SoundType, SoundChannel>
  setVolume: (type: SoundType, volume: number) => void
  toggleSound: (type: SoundType) => void
  stopAll: () => void
  setPreset: (preset: Partial<Record<SoundType, { volume: number; isPlaying: boolean }>>) => void
}

export interface Scene {
  id: string
  name: string
  icon: string
  background: string
  backgroundType: 'image' | 'video' | 'gradient'
  sounds: Partial<Record<SoundType, { volume: number; isPlaying: boolean }>>
  theme: {
    primary: string
    accent: string
  }
  display?: {
    cardGradient: string
  }
  isCustom?: boolean
}

export interface SceneState {
  scenes: Scene[]
  activeSceneId: string | null
  setActiveScene: (id: string) => void
  addCustomScene: (scene: Omit<Scene, 'id' | 'isCustom'>) => void
  removeCustomScene: (id: string) => void
}

export interface SessionStats {
  date: string
  focusTime: number // in seconds
  sessionsCompleted: number
  longestSession: number
}

export interface StatsState {
  sessions: SessionStats[]
  streak: number
  totalFocusTime: number
  addSession: (focusTime: number, sessionLength: number) => void
  getTodayStats: () => SessionStats | undefined
  getWeekStats: () => SessionStats[]
  updateStreak: () => void
}

export interface SettingsState {
  clockFormat: '12h' | '24h'
  showDate: boolean
  showSeconds: boolean
  enableNotifications: boolean
  enableKeyboardShortcuts: boolean
  focusMode: FocusMode
  defaultSceneId: string | null
  backgroundUrl: string | null
  backgroundType: 'image' | 'video' | 'gradient'
  setClockFormat: (format: '12h' | '24h') => void
  setShowDate: (show: boolean) => void
  setShowSeconds: (show: boolean) => void
  setEnableNotifications: (enable: boolean) => void
  setEnableKeyboardShortcuts: (enable: boolean) => void
  setFocusMode: (mode: FocusMode) => void
  setDefaultScene: (id: string | null) => void
  setBackground: (url: string | null, type: 'image' | 'video' | 'gradient') => void
}

// ============================================
// DEFAULT SCENES
// ============================================

const defaultScenes: Scene[] = [
  {
    id: 'lofi-garden',
    name: 'LoFi Garden',
    icon: '🌸',
    background: '/backgrounds/garden.png',
    backgroundType: 'image',
    sounds: {
      rain: { volume: 30, isPlaying: false },
      forest: { volume: 50, isPlaying: true },
      wind: { volume: 20, isPlaying: true },
    },
    theme: { primary: '#a78bfa', accent: '#c4b5fd' },
    display: { cardGradient: 'from-pink-500/20 to-purple-600/20' }
  },
  {
    id: 'rainy-cafe',
    name: 'Rainy Cafe',
    icon: '☕',
    background: '/backgrounds/cafe.png',
    backgroundType: 'image',
    sounds: {
      rain: { volume: 60, isPlaying: true },
      cafe: { volume: 40, isPlaying: true },
      keyboard: { volume: 20, isPlaying: true },
    },
    theme: { primary: '#f59e0b', accent: '#fbbf24' },
    display: { cardGradient: 'from-amber-500/20 to-orange-600/20' }
  },
  {
    id: 'forest-cabin',
    name: 'Forest Cabin',
    icon: '🌲',
    background: '/backgrounds/study-room.png',
    backgroundType: 'image',
    sounds: {
      forest: { volume: 70, isPlaying: true },
      fireplace: { volume: 50, isPlaying: true },
      wind: { volume: 30, isPlaying: false },
    },
    theme: { primary: '#22c55e', accent: '#4ade80' },
    display: { cardGradient: 'from-green-500/20 to-emerald-600/20' }
  },
  {
    id: 'night-city',
    name: 'Night City',
    icon: '🌃',
    background: '/backgrounds/clouds.png',
    backgroundType: 'image',
    sounds: {
      rain: { volume: 20, isPlaying: true },
      lofi: { volume: 40, isPlaying: true },
      keyboard: { volume: 30, isPlaying: false },
    },
    theme: { primary: '#3b82f6', accent: '#60a5fa' },
    display: { cardGradient: 'from-blue-500/20 to-indigo-600/20' }
  },
  {
    id: 'anime-study',
    name: 'Anime Study Room',
    icon: '📚',
    background: '/backgrounds/study-room.png',
    backgroundType: 'image',
    sounds: {
      lofi: { volume: 50, isPlaying: true },
      keyboard: { volume: 25, isPlaying: true },
      cafe: { volume: 15, isPlaying: false },
    },
    theme: { primary: '#ec4899', accent: '#f472b6' },
    display: { cardGradient: 'from-pink-400/20 to-rose-500/20' }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: '✨',
    background: '',
    backgroundType: 'gradient',
    sounds: {},
    theme: { primary: '#a78bfa', accent: '#c4b5fd' },
    display: { cardGradient: 'from-purple-500/20 to-violet-600/20' }
  },
]

export const getSceneCardGradient = (scene: Scene) =>
  scene.display?.cardGradient ?? 'from-slate-600/20 to-slate-800/20'

// ============================================
// TIMER STORE
// ============================================

const DEFAULT_FOCUS = 25 * 60
const DEFAULT_SHORT_BREAK = 5 * 60
const DEFAULT_LONG_BREAK = 15 * 60

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timeLeft: DEFAULT_FOCUS,
      isRunning: false,
      phase: 'focus',
      sessionCount: 0,
      focusDuration: DEFAULT_FOCUS,
      shortBreakDuration: DEFAULT_SHORT_BREAK,
      longBreakDuration: DEFAULT_LONG_BREAK,
      sessionsBeforeLongBreak: 4,

      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),
      
      reset: () => {
        const { phase, focusDuration, shortBreakDuration, longBreakDuration } = get()
        const newTimeLeft = phase === 'focus' 
          ? focusDuration 
          : phase === 'shortBreak' 
            ? shortBreakDuration 
            : longBreakDuration
        set({ timeLeft: newTimeLeft, isRunning: false })
      },

      tick: () => {
        const { timeLeft, isRunning, phase, focusDuration } = get()
        if (!isRunning) return
        if (timeLeft <= 1) {
          // Record completed session
          if (phase === 'focus') {
            useStatsStore.getState().addSession(focusDuration - timeLeft, focusDuration)
          }
          get().nextPhase()
        } else {
          set({ timeLeft: timeLeft - 1 })
        }
      },

      nextPhase: () => {
        const { phase, sessionCount, sessionsBeforeLongBreak, focusDuration, shortBreakDuration, longBreakDuration } = get()
        
        let newPhase: TimerPhase
        let newTimeLeft: number
        let newSessionCount = sessionCount

        if (phase === 'focus') {
          newSessionCount = sessionCount + 1
          if (newSessionCount % sessionsBeforeLongBreak === 0) {
            newPhase = 'longBreak'
            newTimeLeft = longBreakDuration
          } else {
            newPhase = 'shortBreak'
            newTimeLeft = shortBreakDuration
          }
        } else {
          newPhase = 'focus'
          newTimeLeft = focusDuration
        }

        set({ 
          phase: newPhase, 
          timeLeft: newTimeLeft, 
          isRunning: false,
          sessionCount: newSessionCount 
        })
      },

      setDurations: (focus, shortBreak, longBreak) => {
        const { phase } = get()
        const currentTimeLeft = phase === 'focus' 
          ? focus 
          : phase === 'shortBreak' 
            ? shortBreak 
            : longBreak
        set({ 
          focusDuration: focus, 
          shortBreakDuration: shortBreak, 
          longBreakDuration: longBreak,
          timeLeft: currentTimeLeft 
        })
      }
    }),
    {
      name: 'flocus-timer',
      partialize: (state) => ({
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionCount: state.sessionCount,
      })
    }
  )
)

// ============================================
// TASK STORE
// ============================================

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,

      addTask: (text, priority = 'medium', estimatedSessions = 1) => {
        const { tasks } = get()
        const nextOrder = tasks.length > 0 ? Math.max(...tasks.map((task) => task.order)) + 1 : 0
        const newTask: Task = {
          id: crypto.randomUUID(),
          text,
          completed: false,
          order: nextOrder,
          priority,
          estimatedSessions,
          completedSessions: 0,
          createdAt: Date.now()
        }
        set({ tasks: [...tasks, newTask] })
      },

      removeTask: (id: string) => {
        const { tasks, activeTaskId } = get()
        set({ 
          tasks: tasks.filter(t => t.id !== id),
          activeTaskId: activeTaskId === id ? null : activeTaskId
        })
      },

      toggleTask: (id: string) => {
        const { tasks } = get()
        set({ 
          tasks: tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) 
        })
      },

      setActiveTask: (id: string | null) => set({ activeTaskId: id }),

      updateTaskSessions: (id: string, completed: number) => {
        const { tasks } = get()
        set({
          tasks: tasks.map(t => t.id === id ? { ...t, completedSessions: completed } : t)
        })
      },

      reorderTasks: (tasks: Task[]) => {
        const pendingTasks = tasks
          .filter((task) => !task.completed)
          .sort((a, b) => a.order - b.order)
          .map((task, index) => ({ ...task, order: index }))

        const completedTasks = tasks
          .filter((task) => task.completed)
          .sort((a, b) => a.order - b.order)
          .map((task, index) => ({ ...task, order: pendingTasks.length + index }))

        set({ tasks: [...pendingTasks, ...completedTasks] })
      },
    }),
    {
      name: 'flocus-tasks',
    }
  )
)

// ============================================
// SOUND STORE
// ============================================

const defaultChannels: Record<SoundType, SoundChannel> = {
  rain: { type: 'rain', volume: 50, isPlaying: false },
  wind: { type: 'wind', volume: 50, isPlaying: false },
  forest: { type: 'forest', volume: 50, isPlaying: false },
  fireplace: { type: 'fireplace', volume: 50, isPlaying: false },
  cafe: { type: 'cafe', volume: 50, isPlaying: false },
  keyboard: { type: 'keyboard', volume: 50, isPlaying: false },
  lofi: { type: 'lofi', volume: 50, isPlaying: false },
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      channels: defaultChannels,

      setVolume: (type, volume) => {
        const { channels } = get()
        set({
          channels: {
            ...channels,
            [type]: { ...channels[type], volume }
          }
        })
      },

      toggleSound: (type) => {
        const { channels } = get()
        set({
          channels: {
            ...channels,
            [type]: { ...channels[type], isPlaying: !channels[type].isPlaying }
          }
        })
      },

      stopAll: () => {
        const { channels } = get()
        const stoppedChannels = Object.fromEntries(
          Object.entries(channels).map(([key, value]) => [
            key,
            { ...value, isPlaying: false }
          ])
        ) as Record<SoundType, SoundChannel>
        set({ channels: stoppedChannels })
      },

      setPreset: (preset) => {
        const { channels } = get()
        const newChannels = { ...channels }
        Object.entries(preset).forEach(([type, config]) => {
          if (config && type in newChannels) {
            newChannels[type as SoundType] = {
              ...newChannels[type as SoundType],
              ...config
            }
          }
        })
        set({ channels: newChannels })
      }
    }),
    {
      name: 'flocus-sounds',
      partialize: (state) => ({
        channels: Object.fromEntries(
          Object.entries(state.channels).map(([key, value]) => [
            key,
            { ...value, isPlaying: false }
          ])
        )
      })
    }
  )
)

// ============================================
// SCENE STORE
// ============================================

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      scenes: defaultScenes,
      activeSceneId: null,

      setActiveScene: (id) => {
        const { scenes } = get()
        const scene = scenes.find(s => s.id === id)
        if (scene) {
          // Apply scene settings
          useSettingsStore.getState().setBackground(
            scene.background || null,
            scene.backgroundType
          )
          useSoundStore.getState().stopAll()
          useSoundStore.getState().setPreset(scene.sounds)
          set({ activeSceneId: id })
        }
      },

      addCustomScene: (sceneData) => {
        const { scenes } = get()
        const newScene: Scene = {
          ...sceneData,
          id: `custom-${Date.now()}`,
          isCustom: true
        }
        set({ scenes: [...scenes, newScene] })
      },

      removeCustomScene: (id) => {
        const { scenes, activeSceneId } = get()
        set({ 
          scenes: scenes.filter(s => s.id !== id),
          activeSceneId: activeSceneId === id ? null : activeSceneId
        })
      }
    }),
    {
      name: 'flocus-scenes',
      partialize: (state) => ({
        activeSceneId: state.activeSceneId,
        scenes: state.scenes.filter(s => s.isCustom)
      })
    }
  )
)

// ============================================
// STATS STORE
// ============================================

const getToday = () => new Date().toISOString().split('T')[0]

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      streak: 0,
      totalFocusTime: 0,

      addSession: (focusTime, sessionLength) => {
        const { sessions, totalFocusTime } = get()
        const today = getToday()
        const todaySession = sessions.find(s => s.date === today)
        
        if (todaySession) {
          set({
            sessions: sessions.map(s => 
              s.date === today 
                ? {
                    ...s,
                    focusTime: s.focusTime + focusTime,
                    sessionsCompleted: s.sessionsCompleted + 1,
                    longestSession: Math.max(s.longestSession, sessionLength)
                  }
                : s
            ),
            totalFocusTime: totalFocusTime + focusTime
          })
        } else {
          set({
            sessions: [...sessions, {
              date: today,
              focusTime,
              sessionsCompleted: 1,
              longestSession: sessionLength
            }],
            totalFocusTime: totalFocusTime + focusTime
          })
        }
        
        get().updateStreak()
      },

      getTodayStats: () => {
        const { sessions } = get()
        const today = getToday()
        return sessions.find(s => s.date === today)
      },

      getWeekStats: () => {
        const { sessions } = get()
        const today = new Date()
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return sessions.filter(s => new Date(s.date) >= weekAgo)
      },

      updateStreak: () => {
        const { sessions } = get()
        if (sessions.length === 0) return
        
        const sortedSessions = [...sessions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        let streak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        for (let i = 0; i < sortedSessions.length; i++) {
          const sessionDate = new Date(sortedSessions[i].date)
          sessionDate.setHours(0, 0, 0, 0)
          
          const expectedDate = new Date(today)
          expectedDate.setDate(today.getDate() - i)
          
          if (sessionDate.getTime() === expectedDate.getTime()) {
            streak++
          } else if (i === 0 && sessionDate.getTime() === expectedDate.getTime() - 86400000) {
            // Allow yesterday for streak calculation
            streak++
          } else {
            break
          }
        }
        
        set({ streak })
      }
    }),
    {
      name: 'flocus-stats',
    }
  )
)

// ============================================
// SETTINGS STORE
// ============================================

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      clockFormat: '12h',
      showDate: true,
      showSeconds: true,
      enableNotifications: true,
      enableKeyboardShortcuts: true,
      focusMode: 'study',
      defaultSceneId: null,
      backgroundUrl: null,
      backgroundType: 'gradient',

      setClockFormat: (format) => set({ clockFormat: format }),
      setShowDate: (show) => set({ showDate: show }),
      setShowSeconds: (show) => set({ showSeconds: show }),
      setEnableNotifications: (enable) => set({ enableNotifications: enable }),
      setEnableKeyboardShortcuts: (enable) => set({ enableKeyboardShortcuts: enable }),
      setFocusMode: (mode) => set({ focusMode: mode }),
      setDefaultScene: (id) => set({ defaultSceneId: id }),
      setBackground: (url, type) => set({ backgroundUrl: url, backgroundType: type }),
    }),
    {
      name: 'flocus-settings',
      partialize: (state) => ({
        clockFormat: state.clockFormat,
        showDate: state.showDate,
        showSeconds: state.showSeconds,
        enableNotifications: state.enableNotifications,
        enableKeyboardShortcuts: state.enableKeyboardShortcuts,
        focusMode: state.focusMode,
        defaultSceneId: state.defaultSceneId,
        backgroundType: state.backgroundType,
      })
    }
  )
)
