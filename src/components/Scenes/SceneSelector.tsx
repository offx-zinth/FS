'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { useSceneStore, useSettingsStore, Scene } from '@/stores'
import { cn } from '@/lib/utils'

const defaultScenes = [
  {
    id: 'lofi-garden',
    name: 'LoFi Garden',
    icon: '🌸',
    gradient: 'from-pink-500/20 to-purple-600/20'
  },
  {
    id: 'rainy-cafe',
    name: 'Rainy Cafe',
    icon: '☕',
    gradient: 'from-amber-500/20 to-orange-600/20'
  },
  {
    id: 'forest-cabin',
    name: 'Forest Cabin',
    icon: '🌲',
    gradient: 'from-green-500/20 to-emerald-600/20'
  },
  {
    id: 'night-city',
    name: 'Night City',
    icon: '🌃',
    gradient: 'from-blue-500/20 to-indigo-600/20'
  },
  {
    id: 'anime-study',
    name: 'Anime Study',
    icon: '📚',
    gradient: 'from-pink-400/20 to-rose-500/20'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: '✨',
    gradient: 'from-purple-500/20 to-violet-600/20'
  },
]

export function SceneSelector() {
  const { scenes, activeSceneId, setActiveScene } = useSceneStore()
  const { setBackground } = useSettingsStore()
  const [showCustomModal, setShowCustomModal] = useState(false)

  const handleSceneSelect = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (scene) {
      setActiveScene(sceneId)
      setBackground(
        scene.background || null,
        scene.backgroundType
      )
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-white/40 uppercase tracking-wider px-1">Scenes</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {defaultScenes.map((scene) => {
          const isActive = activeSceneId === scene.id
          
          return (
            <button
              key={scene.id}
              onClick={() => handleSceneSelect(scene.id)}
              className={cn(
                "relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300",
                "bg-gradient-to-br",
                scene.gradient,
                isActive 
                  ? "ring-2 ring-white/30 bg-white/10" 
                  : "hover:bg-white/5"
              )}
            >
              <span className="text-lg">{scene.icon}</span>
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-white/90" : "text-white/60"
              )}>
                {scene.name}
              </span>
              {isActive && (
                <Check className="w-3 h-3 text-white/60 ml-auto" />
              )}
            </button>
          )
        })}
      </div>

      {/* Custom scenes */}
      {scenes.filter(s => s.isCustom).length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <h4 className="text-xs text-white/30 uppercase tracking-wider px-1">Custom</h4>
          <div className="grid grid-cols-2 gap-2">
            {scenes.filter(s => s.isCustom).map((scene) => {
              const isActive = activeSceneId === scene.id
              
              return (
                <button
                  key={scene.id}
                  onClick={() => handleSceneSelect(scene.id)}
                  className={cn(
                    "relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300",
                    "bg-white/5",
                    isActive 
                      ? "ring-2 ring-white/30 bg-white/10" 
                      : "hover:bg-white/8"
                  )}
                >
                  <span className="text-lg">{scene.icon}</span>
                  <span className={cn(
                    "text-xs font-medium truncate",
                    isActive ? "text-white/90" : "text-white/60"
                  )}>
                    {scene.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
