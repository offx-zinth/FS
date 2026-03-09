'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import { CloudRain, Wind, Trees, Flame, Coffee, Keyboard, Music } from 'lucide-react'
import { useSceneStore, useSoundStore, SoundType } from '@/stores'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

type SoundMode = 'file' | 'generated' | 'unavailable'
type ChannelState = {
  status: 'idle' | 'loading' | 'ready' | 'degraded' | 'unavailable'
  message?: string
}

type SoundConfigEntry = {
  icon: typeof CloudRain
  label: string
  src: string
  mime: string
  allowedExtensions: string[]
}

const soundConfig: Record<SoundType, SoundConfigEntry> = {
  rain: {
    icon: CloudRain,
    label: 'Rain',
    src: '/sounds/rain.wav',
    mime: 'audio/wav',
    allowedExtensions: ['wav'],
  },
  wind: {
    icon: Wind,
    label: 'Wind',
    src: '/sounds/wind.wav',
    mime: 'audio/wav',
    allowedExtensions: ['wav'],
  },
  forest: {
    icon: Trees,
    label: 'Forest',
    src: '/sounds/forest.wav',
    mime: 'audio/wav',
    allowedExtensions: ['wav'],
  },
  fireplace: {
    icon: Flame,
    label: 'Fireplace',
    src: '/sounds/fireplace.wav',
    mime: 'audio/wav',
    allowedExtensions: ['wav'],
  },
  cafe: {
    icon: Coffee,
    label: 'Café',
    src: '/sounds/cafe.wav',
    mime: 'audio/wav',
    allowedExtensions: ['wav'],
  },
  keyboard: {
    icon: Keyboard,
    label: 'Keyboard',
    src: '/sounds/keyboard.wav',
    mime: 'audio/wav',
    allowedExtensions: ['wav'],
  },
  lofi: {
    icon: Music,
    label: 'LoFi',
    src: '/sounds/lofi.wav',
    mime: 'audio/wav',
    allowedExtensions: ['wav'],
  },
}

const SOUND_TYPES = Object.keys(soundConfig) as SoundType[]

const createInitialChannelState = (): Record<SoundType, ChannelState> =>
  Object.fromEntries(SOUND_TYPES.map((type) => [type, { status: 'idle' }])) as Record<SoundType, ChannelState>

class AudioManager {
  private audioElements: Map<SoundType, HTMLAudioElement> = new Map()
  private mediaSources: Map<SoundType, MediaElementAudioSourceNode> = new Map()
  private generatedSources: Map<SoundType, AudioBufferSourceNode> = new Map()
  private audioContext: AudioContext | null = null
  private gainNodes: Map<SoundType, GainNode> = new Map()
  private availabilityCache: Map<SoundType, boolean> = new Map()

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return this.audioContext
  }

  private validateSource(config: SoundConfigEntry): boolean {
    const extension = config.src.split('.').pop()?.toLowerCase()
    if (!extension || !config.allowedExtensions.includes(extension)) {
      return false
    }

    const probe = document.createElement('audio')
    return probe.canPlayType(config.mime) !== ''
  }

  async preload(type: SoundType, config: SoundConfigEntry): Promise<boolean> {
    if (this.availabilityCache.has(type)) {
      return this.availabilityCache.get(type) ?? false
    }

    if (!this.validateSource(config)) {
      this.availabilityCache.set(type, false)
      return false
    }

    try {
      const response = await fetch(config.src, { cache: 'force-cache' })
      if (!response.ok) {
        this.availabilityCache.set(type, false)
        return false
      }

      const blob = await response.blob()
      const mimeType = blob.type.toLowerCase()
      const isValidMime = mimeType === config.mime || mimeType.startsWith('audio/')
      this.availabilityCache.set(type, isValidMime)
      return isValidMime
    } catch {
      this.availabilityCache.set(type, false)
      return false
    }
  }

  private waitForCanPlay(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup()
        reject(new Error('Timed out while waiting for canplaythrough'))
      }, 6000)

      const onCanPlayThrough = () => {
        cleanup()
        resolve()
      }

      const onError = () => {
        cleanup()
        reject(new Error('Audio element emitted error during preload'))
      }

      const cleanup = () => {
        window.clearTimeout(timeout)
        audio.removeEventListener('canplaythrough', onCanPlayThrough)
        audio.removeEventListener('error', onError)
      }

      audio.addEventListener('canplaythrough', onCanPlayThrough, { once: true })
      audio.addEventListener('error', onError, { once: true })
      audio.load()
    })
  }

  async play(type: SoundType, config: SoundConfigEntry, volume: number): Promise<SoundMode> {
    this.stop(type)

    const available = await this.preload(type, config)
    if (!available) {
      return this.playGenerated(type, volume)
    }

    try {
      const audio = new Audio(config.src)
      audio.loop = true
      audio.crossOrigin = 'anonymous'

      const ctx = this.getContext()
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      const source = ctx.createMediaElementSource(audio)
      const gainNode = ctx.createGain()
      gainNode.gain.value = volume / 100

      source.connect(gainNode)
      gainNode.connect(ctx.destination)

      await this.waitForCanPlay(audio)
      await audio.play()

      this.audioElements.set(type, audio)
      this.mediaSources.set(type, source)
      this.gainNodes.set(type, gainNode)

      return 'file'
    } catch {
      return this.playGenerated(type, volume)
    }
  }

  private playGenerated(type: SoundType, volume: number): SoundMode {
    try {
      const ctx = this.getContext()
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      const gainNode = ctx.createGain()

      switch (type) {
        case 'rain':
          filter.type = 'lowpass'
          filter.frequency.value = 1500
          gainNode.gain.value = (volume / 100) * 0.45
          break
        case 'wind':
          filter.type = 'bandpass'
          filter.frequency.value = 350
          gainNode.gain.value = (volume / 100) * 0.35
          break
        case 'forest':
          filter.type = 'bandpass'
          filter.frequency.value = 900
          gainNode.gain.value = (volume / 100) * 0.3
          break
        case 'fireplace':
          filter.type = 'lowpass'
          filter.frequency.value = 260
          gainNode.gain.value = (volume / 100) * 0.4
          break
        case 'cafe':
          filter.type = 'bandpass'
          filter.frequency.value = 500
          gainNode.gain.value = (volume / 100) * 0.25
          break
        case 'keyboard':
          filter.type = 'highpass'
          filter.frequency.value = 1200
          gainNode.gain.value = (volume / 100) * 0.2
          break
        case 'lofi':
          filter.type = 'lowpass'
          filter.frequency.value = 700
          gainNode.gain.value = (volume / 100) * 0.22
          break
      }

      source.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)
      source.start()

      this.generatedSources.set(type, source)
      this.gainNodes.set(type, gainNode)
      return 'generated'
    } catch {
      return 'unavailable'
    }
  }

  stop(type: SoundType): void {
    const audio = this.audioElements.get(type)
    if (audio) {
      audio.pause()
      audio.src = ''
      this.audioElements.delete(type)
    }

    const mediaSource = this.mediaSources.get(type)
    if (mediaSource) {
      mediaSource.disconnect()
      this.mediaSources.delete(type)
    }

    const generated = this.generatedSources.get(type)
    if (generated) {
      generated.stop()
      generated.disconnect()
      this.generatedSources.delete(type)
    }

    const gainNode = this.gainNodes.get(type)
    if (gainNode) {
      gainNode.disconnect()
      this.gainNodes.delete(type)
    }
  }

  setVolume(type: SoundType, volume: number): void {
    const gainNode = this.gainNodes.get(type)
    if (gainNode) {
      gainNode.gain.value = volume / 100
    }

    const audio = this.audioElements.get(type)
    if (audio) {
      audio.volume = volume / 100
    }
  }

  stopAll(): void {
    SOUND_TYPES.forEach((type) => this.stop(type))
  }
}

const audioManager = new AudioManager()

export function SoundMixer() {
  const { channels, setVolume, toggleSound } = useSoundStore()
  const { scenes, activeSceneId } = useSceneStore()
  const [channelState, setChannelState] = useState<Record<SoundType, ChannelState>>(createInitialChannelState)

  const activeScenePresetTypes = useMemo(() => {
    const activeScene = scenes.find((scene) => scene.id === activeSceneId)
    if (!activeScene) {
      return [] as SoundType[]
    }

    return Object.keys(activeScene.sounds) as SoundType[]
  }, [activeSceneId, scenes])

  useEffect(() => {
    let isMounted = true

    const preloadSceneSounds = async () => {
      await Promise.all(
        activeScenePresetTypes.map(async (type) => {
          setChannelState((prev) => ({ ...prev, [type]: { status: 'loading', message: 'Preloading source…' } }))
          const available = await audioManager.preload(type, soundConfig[type])
          if (!isMounted) {
            return
          }

          setChannelState((prev) => ({
            ...prev,
            [type]: available
              ? { status: prev[type].status === 'ready' ? 'ready' : 'idle' }
              : { status: 'degraded', message: 'Source unavailable; generated fallback will be used.' },
          }))
        })
      )
    }

    void preloadSceneSounds()

    return () => {
      isMounted = false
    }
  }, [activeScenePresetTypes])

  const handleToggle = useCallback(async (type: SoundType) => {
    const channel = channels[type]

    if (!channel.isPlaying) {
      setChannelState((prev) => ({ ...prev, [type]: { status: 'loading', message: 'Loading channel…' } }))

      const mode = await audioManager.play(type, soundConfig[type], channel.volume)
      if (mode === 'file') {
        setChannelState((prev) => ({ ...prev, [type]: { status: 'ready' } }))
        toggleSound(type)
        return
      }

      if (mode === 'generated') {
        setChannelState((prev) => ({
          ...prev,
          [type]: { status: 'degraded', message: 'Using generated fallback audio.' },
        }))
        toggleSound(type)
        return
      }

      setChannelState((prev) => ({
        ...prev,
        [type]: { status: 'unavailable', message: 'Unavailable in this browser.' },
      }))
      return
    }

    audioManager.stop(type)
    setChannelState((prev) => ({ ...prev, [type]: { status: 'idle' } }))
    toggleSound(type)
  }, [channels, toggleSound])

  const handleVolumeChange = useCallback((type: SoundType, volume: number) => {
    setVolume(type, volume)
    if (channels[type].isPlaying) {
      audioManager.setVolume(type, volume)
    }
  }, [channels, setVolume])

  useEffect(() => {
    return () => {
      audioManager.stopAll()
    }
  }, [])

  return (
    <div className="space-y-2">
      {(Object.entries(soundConfig) as [SoundType, SoundConfigEntry][]).map(([type, config]) => {
        const Icon = config.icon
        const channel = channels[type]
        const status = channelState[type]
        const isActive = channel.isPlaying
        const isLoading = status.status === 'loading'
        const isUnavailable = status.status === 'unavailable'

        return (
          <div
            key={type}
            className={cn(
              'flex items-center gap-3 p-2 rounded-xl transition-all duration-300',
              isActive ? 'bg-white/5' : 'hover:bg-white/3',
              status.status === 'degraded' && 'ring-1 ring-amber-400/30',
              isUnavailable && 'opacity-60'
            )}
          >
            <button
              onClick={() => handleToggle(type)}
              disabled={isLoading || isUnavailable}
              className={cn(
                'p-2 rounded-lg transition-all duration-300',
                isActive
                  ? 'bg-white/10 text-white/90'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5',
                (isLoading || isUnavailable) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <span
                className={cn(
                  'text-xs transition-colors min-w-[60px]',
                  isActive ? 'text-white/70' : 'text-white/40'
                )}
              >
                {config.label}
              </span>
              <div className="flex-1">
                <Slider
                  value={[channel.volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([value]) => handleVolumeChange(type, value)}
                  className="w-full"
                  disabled={isUnavailable}
                />
                {status.message ? (
                  <p className={cn(
                    'text-[10px] mt-1',
                    status.status === 'degraded' ? 'text-amber-300/80' : 'text-white/35'
                  )}>
                    {status.message}
                  </p>
                ) : null}
              </div>
              <span className="text-xs text-white/30 w-6">{channel.volume}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
