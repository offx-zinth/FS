'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { CloudRain, Wind, Trees, Flame, Coffee, Keyboard, Music, Volume2, VolumeX } from 'lucide-react'
import { useSoundStore, SoundType } from '@/stores'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const soundConfig: Record<SoundType, { icon: typeof CloudRain; label: string; src: string }> = {
  rain: { 
    icon: CloudRain, 
    label: 'Rain',
    src: '/sounds/rain.mp3'
  },
  wind: { 
    icon: Wind, 
    label: 'Wind',
    src: '/sounds/wind.mp3'
  },
  forest: { 
    icon: Trees, 
    label: 'Forest',
    src: '/sounds/forest.mp3'
  },
  fireplace: { 
    icon: Flame, 
    label: 'Fireplace',
    src: '/sounds/fireplace.mp3'
  },
  cafe: { 
    icon: Coffee, 
    label: 'Café',
    src: '/sounds/cafe.mp3'
  },
  keyboard: { 
    icon: Keyboard, 
    label: 'Keyboard',
    src: '/sounds/keyboard.mp3'
  },
  lofi: { 
    icon: Music, 
    label: 'LoFi',
    src: '/sounds/lofi.mp3'
  },
}

// Audio manager for handling multiple audio sources
class AudioManager {
  private audioElements: Map<SoundType, HTMLAudioElement> = new Map()
  private audioContext: AudioContext | null = null
  private gainNodes: Map<SoundType, GainNode> = new Map()
  
  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return this.audioContext
  }

  async play(type: SoundType, src: string, volume: number): Promise<void> {
    // Stop existing audio for this type
    this.stop(type)
    
    try {
      const audio = new Audio(src)
      audio.loop = true
      audio.crossOrigin = 'anonymous'
      
      // Connect to Web Audio API for volume control
      const ctx = this.getContext()
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }
      
      const source = ctx.createMediaElementSource(audio)
      const gainNode = ctx.createGain()
      gainNode.gain.value = volume / 100
      
      source.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      this.audioElements.set(type, audio)
      this.gainNodes.set(type, gainNode)
      
      await audio.play()
    } catch (error) {
      console.warn(`Failed to play ${type}:`, error)
      // Fallback to generated sounds
      this.playGenerated(type, volume)
    }
  }

  private playGenerated(type: SoundType, volume: number): void {
    // Fallback generated sounds using Web Audio API
    const ctx = this.getContext()
    
    // Create noise-based ambient sounds
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
        break
      case 'wind':
        filter.type = 'bandpass'
        filter.frequency.value = 400
        break
      case 'forest':
        filter.type = 'bandpass'
        filter.frequency.value = 800
        break
      case 'fireplace':
        filter.type = 'lowpass'
        filter.frequency.value = 200
        break
      case 'cafe':
        filter.type = 'bandpass'
        filter.frequency.value = 500
        break
      default:
        filter.type = 'lowpass'
        filter.frequency.value = 1000
    }
    
    gainNode.gain.value = volume / 100
    
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)
    source.start()
    
    this.gainNodes.set(type, gainNode)
  }

  stop(type: SoundType): void {
    const audio = this.audioElements.get(type)
    if (audio) {
      audio.pause()
      audio.src = ''
      this.audioElements.delete(type)
    }
    this.gainNodes.delete(type)
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
    this.audioElements.forEach((_, type) => this.stop(type))
    this.gainNodes.clear()
  }
}

const audioManager = new AudioManager()

export function SoundMixer() {
  const { channels, setVolume, toggleSound } = useSoundStore()
  const [loadingSound, setLoadingSound] = useState<SoundType | null>(null)

  // Handle sound toggle
  const handleToggle = useCallback(async (type: SoundType) => {
    const channel = channels[type]
    
    if (!channel.isPlaying) {
      setLoadingSound(type)
      try {
        await audioManager.play(type, soundConfig[type].src, channel.volume)
        toggleSound(type)
      } catch (error) {
        console.error(`Failed to play ${type}:`, error)
      }
      setLoadingSound(null)
    } else {
      audioManager.stop(type)
      toggleSound(type)
    }
  }, [channels, toggleSound])

  // Handle volume change
  const handleVolumeChange = useCallback((type: SoundType, volume: number) => {
    setVolume(type, volume)
    if (channels[type].isPlaying) {
      audioManager.setVolume(type, volume)
    }
  }, [channels, setVolume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioManager.stopAll()
    }
  }, [])

  return (
    <div className="space-y-2">
      {(Object.entries(soundConfig) as [SoundType, typeof soundConfig[SoundType]][]).map(([type, config]) => {
        const Icon = config.icon
        const channel = channels[type]
        const isActive = channel.isPlaying
        const isLoading = loadingSound === type

        return (
          <div
            key={type}
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl transition-all duration-300",
              isActive ? "bg-white/5" : "hover:bg-white/3"
            )}
          >
            <button
              onClick={() => handleToggle(type)}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-lg transition-all duration-300",
                isActive
                  ? "bg-white/10 text-white/90"
                  : "text-white/40 hover:text-white/60 hover:bg-white/5",
                isLoading && "opacity-50"
              )}
            >
              <Icon className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center gap-2">
              <span className={cn(
                "text-xs transition-colors min-w-[60px]",
                isActive ? "text-white/70" : "text-white/40"
              )}>
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
                />
              </div>
              <span className="text-xs text-white/30 w-6">
                {channel.volume}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
