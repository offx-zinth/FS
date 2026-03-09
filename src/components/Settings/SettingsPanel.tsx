'use client'

import { useState, useRef, useEffect } from 'react'
import { Clock, Image, Timer, Bell, Keyboard, Upload, Trash2 } from 'lucide-react'
import { useSettingsStore, useTimerStore, useStatsStore } from '@/stores'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { shortcutHints } from '@/hooks/useKeyboardShortcuts'

export function SettingsPanel() {
  const { 
    clockFormat, 
    showDate,
    showSeconds, 
    enableNotifications,
    enableKeyboardShortcuts,
    focusMode,
    backgroundUrl,
    backgroundType,
    setClockFormat, 
    setShowDate,
    setShowSeconds, 
    setEnableNotifications,
    setEnableKeyboardShortcuts,
    setFocusMode,
    setBackground
  } = useSettingsStore()
  
  const { 
    focusDuration, 
    shortBreakDuration, 
    longBreakDuration, 
    setDurations 
  } = useTimerStore()

  const { sessions, streak, totalFocusTime } = useStatsStore()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const appBlobUrlRef = useRef<string | null>(null)
  const [activeTab, setActiveTab] = useState<'clock' | 'background' | 'timer' | 'notifications' | 'shortcuts'>('clock')
  const isBlobBackground = Boolean(backgroundUrl?.startsWith('blob:'))
  
  const focusMinutes = focusDuration / 60
  const shortBreakMinutes = shortBreakDuration / 60
  const longBreakMinutes = longBreakDuration / 60

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (appBlobUrlRef.current) {
        URL.revokeObjectURL(appBlobUrlRef.current)
      }

      const url = URL.createObjectURL(file)
      appBlobUrlRef.current = url
      const isVideo = file.type.startsWith('video/')

      // Object URLs are local to this browser session.
      // If uploads should survive reloads, persist the File/Blob (e.g. IndexedDB)
      // and recreate the object URL when loading settings.
      setBackground(url, isVideo ? 'video' : 'image')
    }
  }

  const handleResetBackground = () => {
    if (appBlobUrlRef.current) {
      URL.revokeObjectURL(appBlobUrlRef.current)
      appBlobUrlRef.current = null
    }

    setBackground(null, 'gradient')
  }

  useEffect(() => {
    return () => {
      if (appBlobUrlRef.current) {
        URL.revokeObjectURL(appBlobUrlRef.current)
      }
    }
  }, [])

  const handleTimerChange = (type: 'focus' | 'shortBreak' | 'longBreak', minutes: number) => {
    const seconds = minutes * 60
    switch (type) {
      case 'focus':
        setDurations(seconds, shortBreakDuration, longBreakDuration)
        break
      case 'shortBreak':
        setDurations(focusDuration, seconds, longBreakDuration)
        break
      case 'longBreak':
        setDurations(focusDuration, shortBreakDuration, seconds)
        break
    }
  }

  const handleClearData = () => {
    if (confirm('Clear all data? This cannot be undone.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const tabs = [
    { id: 'clock', icon: Clock },
    { id: 'background', icon: Image },
    { id: 'timer', icon: Timer },
    { id: 'notifications', icon: Bell },
    { id: 'shortcuts', icon: Keyboard },
  ] as const

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 p-2 rounded-lg transition-all duration-300",
              activeTab === tab.id
                ? "bg-white/10 text-white/80"
                : "text-white/40 hover:text-white/60"
            )}
          >
            <tab.icon className="w-4 h-4 mx-auto" />
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'clock' && (
          <>
            {/* Focus Mode */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase tracking-wider">Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'deepWork', label: 'Deep Work' },
                  { id: 'study', label: 'Study' },
                  { id: 'chill', label: 'Chill' },
                ] as const).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFocusMode(mode.id)}
                    className={cn(
                      'px-2 py-2 rounded-lg text-xs transition-all duration-300',
                      focusMode === mode.id
                        ? 'bg-white/10 text-white/80'
                        : 'bg-white/5 text-white/40 hover:text-white/60'
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clock Format */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase tracking-wider">Format</label>
              <div className="flex gap-2">
                {(['12h', '24h'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setClockFormat(format)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm transition-all duration-300",
                      clockFormat === format
                        ? "bg-white/10 text-white/80"
                        : "bg-white/5 text-white/40 hover:text-white/60"
                    )}
                  >
                    {format === '12h' ? '12 Hour' : '24 Hour'}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Date */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Show date</span>
              <Switch checked={showDate} onCheckedChange={setShowDate} />
            </div>

            {/* Show Seconds */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Show seconds</span>
              <Switch checked={showSeconds} onCheckedChange={setShowSeconds} />
            </div>
          </>
        )}

        {activeTab === 'background' && (
          <>
            {/* Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all duration-300"
            >
              <Upload className="w-4 h-4 mx-auto mb-2" />
              <span className="text-xs">Upload image or video</span>
            </button>

            {backgroundUrl && (
              <button
                onClick={handleResetBackground}
                className="w-full text-xs text-white/30 hover:text-white/50 py-2 transition-colors"
              >
                Reset to default{isBlobBackground ? ' (uploaded)' : ''}
              </button>
            )}
          </>
        )}

        {activeTab === 'timer' && (
          <>
            {/* Focus Duration */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Focus</span>
                <span className="text-xs text-white/60">{focusMinutes} min</span>
              </div>
              <Slider
                value={[focusMinutes]}
                min={5}
                max={90}
                step={5}
                onValueChange={([value]) => handleTimerChange('focus', value)}
              />
            </div>

            {/* Short Break */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Short break</span>
                <span className="text-xs text-white/60">{shortBreakMinutes} min</span>
              </div>
              <Slider
                value={[shortBreakMinutes]}
                min={1}
                max={15}
                step={1}
                onValueChange={([value]) => handleTimerChange('shortBreak', value)}
              />
            </div>

            {/* Long Break */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Long break</span>
                <span className="text-xs text-white/60">{longBreakMinutes} min</span>
              </div>
              <Slider
                value={[longBreakMinutes]}
                min={5}
                max={30}
                step={5}
                onValueChange={([value]) => handleTimerChange('longBreak', value)}
              />
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDurations(25 * 60, 5 * 60, 15 * 60)}
                className="px-3 py-2 rounded-lg bg-white/5 text-xs text-white/50 hover:bg-white/10"
              >
                Classic (25/5)
              </button>
              <button
                onClick={() => setDurations(50 * 60, 10 * 60, 30 * 60)}
                className="px-3 py-2 rounded-lg bg-white/5 text-xs text-white/50 hover:bg-white/10"
              >
                Extended (50/10)
              </button>
            </div>
          </>
        )}

        {activeTab === 'notifications' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-white/60">Desktop notifications</span>
                <p className="text-xs text-white/30 mt-0.5">Get notified when sessions end</p>
              </div>
              <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
            </div>

            {'Notification' in window && (
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs text-white/40">
                  Permission: <span className={cn(
                    Notification.permission === 'granted' ? 'text-green-400' : 
                    Notification.permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
                  )}>
                    {Notification.permission}
                  </span>
                </p>
                {Notification.permission === 'default' && (
                  <button
                    onClick={() => Notification.requestPermission()}
                    className="mt-2 text-xs text-white/50 hover:text-white/70"
                  >
                    Request permission
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'shortcuts' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Enable shortcuts</span>
              <Switch checked={enableKeyboardShortcuts} onCheckedChange={setEnableKeyboardShortcuts} />
            </div>

            <div className="space-y-2">
              {shortcutHints.map((hint) => (
                <div key={hint.key} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-xs text-white/50">{hint.action}</span>
                  <kbd className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-mono">
                    {hint.key}
                  </kbd>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Clear Data */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={handleClearData}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <Trash2 className="w-3 h-3" />
          Clear all data
        </button>
      </div>
    </div>
  )
}
