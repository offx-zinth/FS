'use client'

import { useState } from 'react'
import { Check, Trash2, Target } from 'lucide-react'
import { Task, useTaskStore } from '@/stores'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { removeTask, toggleTask, setActiveTask, activeTaskId } = useTaskStore()
  const [isHovered, setIsHovered] = useState(false)
  const isActive = activeTaskId === task.id

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200",
        task.completed 
          ? "opacity-50" 
          : isActive 
            ? "bg-white/5" 
            : "hover:bg-white/3"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className={cn(
          "flex-shrink-0 w-4 h-4 rounded-full border transition-all duration-200",
          "flex items-center justify-center",
          task.completed
            ? "bg-white/10 border-white/20 text-white/60"
            : "border-white/20 hover:border-white/30"
        )}
      >
        {task.completed && <Check className="w-2.5 h-2.5" />}
      </button>

      {/* Task text */}
      <span 
        className={cn(
          "flex-1 text-sm transition-all",
          task.completed ? "line-through text-white/30" : "text-white/70"
        )}
      >
        {task.text}
      </span>

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-0.5 transition-opacity duration-200",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        {!task.completed && !isActive && (
          <button
            onClick={() => setActiveTask(task.id)}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/50"
          >
            <Target className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => removeTask(task.id)}
          className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/50"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
