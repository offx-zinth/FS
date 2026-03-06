'use client'

import { Check } from 'lucide-react'
import { useSceneStore, getSceneCardGradient } from '@/stores'
import { cn } from '@/lib/utils'

export function SceneSelector() {
  const { scenes, activeSceneId, setActiveScene } = useSceneStore()

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-white/40 uppercase tracking-wider px-1">Scenes</h3>

      <div className="grid grid-cols-2 gap-2">
        {scenes.map((scene) => {
          const isActive = activeSceneId === scene.id

          return (
            <button
              key={scene.id}
              onClick={() => setActiveScene(scene.id)}
              className={cn(
                'relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300',
                'bg-gradient-to-br',
                getSceneCardGradient(scene),
                isActive
                  ? 'ring-2 ring-white/30 bg-white/10'
                  : 'hover:bg-white/5'
              )}
            >
              <span className="text-lg">{scene.icon}</span>
              <span
                className={cn(
                  'text-xs font-medium truncate',
                  isActive ? 'text-white/90' : 'text-white/60'
                )}
              >
                {scene.name}
              </span>
              {isActive && <Check className="w-3 h-3 text-white/60 ml-auto" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
