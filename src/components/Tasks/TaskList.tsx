'use client'

import { useState, useRef, type CSSProperties, type HTMLAttributes } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Check, Trash2, Target, Flag, GripVertical } from 'lucide-react'
import { useTaskStore, Task } from '@/stores'
import { cn } from '@/lib/utils'

const priorityColors = {
  low: 'text-green-400/60',
  medium: 'text-yellow-400/60',
  high: 'text-red-400/60',
}

const priorityBg = {
  low: 'bg-green-500/10',
  medium: 'bg-yellow-500/10',
  high: 'bg-red-500/10',
}

function TaskItem({
  task,
  onSetActive,
  dragHandleProps,
  style,
  isDragging,
}: {
  task: Task
  onSetActive: () => void
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>
  style?: CSSProperties
  isDragging?: boolean
}) {
  const { removeTask, toggleTask, updateTaskSessions } = useTaskStore()
  const [isHovered, setIsHovered] = useState(false)

  const sessionProgress = task.estimatedSessions > 0
    ? Math.round((task.completedSessions / task.estimatedSessions) * 100)
    : 0

  return (
    <div
      className={cn(
        'group flex items-start gap-2 px-2 py-2 rounded-lg transition-all duration-200',
        task.completed ? 'opacity-50' : 'hover:bg-white/3',
        isDragging && 'bg-white/8'
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {dragHandleProps && !task.completed && (
        <button
          type="button"
          {...dragHandleProps}
          className="mt-0.5 p-1 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing"
          aria-label={`Reorder task ${task.text}`}
        >
          <GripVertical className="w-3 h-3" />
        </button>
      )}

      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className={cn(
          'flex-shrink-0 w-4 h-4 mt-0.5 rounded-full border transition-all duration-200',
          'flex items-center justify-center',
          task.completed
            ? 'bg-white/10 border-white/20 text-white/60'
            : 'border-white/20 hover:border-white/30'
        )}
      >
        {task.completed && <Check className="w-2.5 h-2.5" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm transition-all truncate',
            task.completed ? 'line-through text-white/30' : 'text-white/70'
          )}>
            {task.text}
          </span>

          {/* Priority flag */}
          <Flag className={cn('w-3 h-3 flex-shrink-0', priorityColors[task.priority])} />
        </div>

        {/* Session progress */}
        {!task.completed && task.estimatedSessions > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/30 rounded-full transition-all duration-300"
                style={{ width: `${sessionProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-white/30">
              {task.completedSessions}/{task.estimatedSessions}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={cn(
        'flex items-center gap-0.5 transition-opacity duration-200 flex-shrink-0',
        isHovered ? 'opacity-100' : 'opacity-0'
      )}>
        {!task.completed && (
          <>
            <button
              onClick={onSetActive}
              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-purple-400"
              title="Set as active"
            >
              <Target className="w-3 h-3" />
            </button>
            <button
              onClick={() => updateTaskSessions(task.id, task.completedSessions + 1)}
              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-green-400"
              title="Add session"
            >
              <Plus className="w-3 h-3" />
            </button>
          </>
        )}
        <button
          onClick={() => removeTask(task.id)}
          className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function SortableTaskItem({ task, onSetActive }: { task: Task; onSetActive: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef}>
      <TaskItem
        task={task}
        onSetActive={onSetActive}
        dragHandleProps={{ ...attributes, ...listeners }}
        style={style}
        isDragging={isDragging}
      />
    </div>
  )
}

export function TaskList() {
  const { tasks, addTask, activeTaskId, setActiveTask, reorderTasks } = useTaskStore()
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [estimatedSessions, setEstimatedSessions] = useState(1)
  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask.trim(), priority, estimatedSessions)
      setNewTask('')
      setPriority('medium')
      setEstimatedSessions(1)
      setShowOptions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  const pendingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => a.order - b.order)
  const completedTasks = tasks
    .filter((t) => t.completed)
    .sort((a, b) => a.order - b.order)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = pendingTasks.findIndex((task) => task.id === active.id)
    const newIndex = pendingTasks.findIndex((task) => task.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const reorderedPending = arrayMove(pendingTasks, oldIndex, newIndex)
    const updatedPending = reorderedPending.map((task, index) => ({
      ...task,
      order: index,
    }))
    const updatedCompleted = completedTasks.map((task, index) => ({
      ...task,
      order: updatedPending.length + index,
    }))

    reorderTasks([...updatedPending, ...updatedCompleted])
  }

  return (
    <div className="space-y-3">
      {/* Add task input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white/90 placeholder:text-white/30 focus:border-white/20"
          />
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={cn(
              'px-2 rounded-xl text-sm transition-all',
              showOptions ? 'bg-white/10 text-white/70' : 'bg-white/5 text-white/40 hover:text-white/60'
            )}
          >
            <Flag className={cn('w-4 h-4', priorityColors[priority])} />
          </button>
          <button
            onClick={handleAddTask}
            disabled={!newTask.trim()}
            className={cn(
              'px-4 py-2 rounded-xl text-sm transition-all duration-300',
              newTask.trim()
                ? 'bg-white/10 text-white/70 hover:bg-white/15'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Options panel */}
        {showOptions && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/40">Priority:</span>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs transition-all',
                    priority === p
                      ? cn(priorityBg[p], 'text-white/70')
                      : 'text-white/40 hover:text-white/60'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/40">Sessions:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={estimatedSessions}
                onChange={(e) => setEstimatedSessions(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-white/70"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-white/40 px-1">
        <span>{pendingTasks.length} pending</span>
        <span>{completedTasks.length} done</span>
      </div>

      {/* Task list */}
      <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-white/30 text-sm">
            No tasks yet
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pendingTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {pendingTasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onSetActive={() => setActiveTask(task.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {completedTasks.length > 0 && (
              <>
                <div className="text-xs text-white/30 pt-2 pb-1">Completed</div>
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onSetActive={() => {}}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
