"use client"

import { useState, useRef, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { motion, AnimatePresence } from "framer-motion"

import { useAppStore } from "@/lib/stores/app-store"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { ModuleSelector } from "@/components/hub/module-selector"
import {
  ChevronLeft,
  AlertCircle,
  RotateCcw,
  Cpu,
  HardDrive,
  ShieldCheck,
  Activity,
  Cloud,
  Trophy,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  GripVertical,
  Settings2,
  Plus,
  X,
  Edit,
  Palette,
  Trash2,
  LayoutGrid
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from "@/lib/i18n/use-translation"

import { useDashboardStore, WidgetConfig } from "@/lib/stores/dashboard-store"
import { CameraView } from "@/components/vision/camera-view"
import { TrainingPanel } from "@/components/vision/training-panel"
import { ModelManager } from "@/components/vision/model-manager"
import { InferenceResult } from "@/components/vision/inference-result"
import { TestHub } from "@/components/vision/test-hub"
import Webcam from "react-webcam"
import { useVisionStore } from "@/lib/stores/vision-store"
import { aiController } from "@/lib/ai/unified-controller"
import { SettingsView } from "@/components/settings/settings-view"
import { AchievementOverlay } from "@/components/achievements/achievement-overlay"
import { NotificationOverlay } from "@/components/notifications/notification-overlay"
import { useAchievementStore } from "@/lib/stores/achievement-store"
import { useBackupStore } from "@/lib/stores/backup-store"
import { cn } from "@/lib/utils"

export default function Home() {
  // ... existing Home component code ...
  const [activeTab, setActiveTab] = useState("dashboard")
  const { onboardingComplete, activeModule, setModule, userProfile } = useAppStore()
  const t = useTranslation()

  // Hydration fix for persisted store
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  if (!hasHydrated) return <div className="h-screen w-full bg-background" />

  if (!onboardingComplete) {
    return <OnboardingWizard />
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground dark:bg-dot-white/[0.1] bg-dot-black/[0.1] relative">
      <AchievementOverlay />
      <NotificationOverlay />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {activeTab === "training" && activeModule && (
              <button
                onClick={() => setModule(null)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground mr-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold capitalize font-sans">
              {activeTab === "training" && activeModule ? `${t.visionStudio}` :
                activeTab === "dashboard" ? t.overview :
                  activeTab === "test" ? t.testModel :
                    activeTab === "logic" ? t.logicFlows :
                      activeTab === "whiteboard" ? t.whiteboard :
                        activeTab === "settings" ? t.settings : activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeModule}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "dashboard" && <DashboardView />}
              {activeTab === "training" && (
                !activeModule ? <ModuleSelector /> :
                  activeModule === "vision" ? <TrainingView /> :
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      {activeModule} Module Coming Soon
                    </div>
              )}
              {activeTab === "test" && <TestHub />}
              {activeTab === "logic" && <LogicView />}
              {activeTab === "whiteboard" && <WhiteboardView />}
              {activeTab === "settings" && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function DashboardView() {
  const { userProfile } = useAppStore()
  const { achievements } = useAchievementStore()
  const { connectedAccounts } = useBackupStore()
  const { widgets, isEditMode, setEditMode, reorderWidgets, addWidget, removeWidget, resetLayout } = useDashboardStore()
  const t = useTranslation()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // Handle dropping new widget from drawer
    if (active.data.current?.isNew) {
      const type = active.data.current.type
      const newId = `${type}-${Date.now()}`

      const newWidget: WidgetConfig = {
        id: newId,
        type: type,
        title: type === 'custom' ? t.customNote :
          type === 'hardware' ? t.hardwareStats :
            type === 'clock' ? 'Clock' :
              type === 'weather' ? 'Weather' : 'Widget',
        content: type === 'custom' ? t.localInference : '',
        shape: type === 'hardware' ? 'rectangle' : 'square',
        color: '#0ea5e9'
      }

      // Check if dropped on a placeholder or just append
      // For simplicity in grid, we just append or try to insert at index
      // But finding index in generic Sortable is tricky if dropping on specific item
      const overIndex = widgets.findIndex((w) => w.id === over.id)
      let newWidgets = [...widgets]

      if (overIndex !== -1) {
        newWidgets.splice(overIndex, 0, newWidget)
      } else {
        newWidgets.push(newWidget)
      }

      reorderWidgets(newWidgets)
      return
    }

    // Handle reordering existing widgets
    if (active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id)
      const newIndex = widgets.findIndex((w) => w.id === over.id)
      reorderWidgets(arrayMove(widgets, oldIndex, newIndex))
    }
  }

  const handleAddWidget = (type: string) => {
    const newId = `${type}-${Date.now()}`
    const newWidget: WidgetConfig = {
      id: newId,
      type: type as any,
      title: type === 'custom' ? t.customNote :
        type === 'hardware' ? t.hardwareStats :
          type === 'clock' ? 'Clock' :
            type === 'weather' ? 'Weather' : 'Widget',
      content: type === 'custom' ? t.localInference : '',
      shape: type === 'hardware' ? 'rectangle' : 'square',
      color: '#0ea5e9'
    }
    addWidget(newWidget)
  }

  const unlockedCount = achievements.filter(a => a.isUnlocked).length
  const progress = Math.round((unlockedCount / achievements.length) * 100)

  // Find the widget being dragged (either existing or a mock for new ones)
  const activeWidget = activeId ? (
    widgets.find(w => w.id === activeId) ||
    (activeId.startsWith('new-') ? {
      id: activeId,
      type: activeId.replace('new-', ''),
      title: 'New Widget',
      content: 'Drag to add',
      shape: 'square',
      color: '#888'
    } as WidgetConfig : null)
  ) : null

  return (
    <div className="space-y-6 pb-20 relative min-h-full">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/50 font-sans">{t.overview}</h3>
        <div className="flex gap-2">
          {isEditMode && (
            <button
              onClick={() => setDrawerOpen(!isDrawerOpen)}
              className={cn(
                "px-4 py-2 rounded-xl border text-[10px] font-bold uppercase flex items-center gap-2 transition-all font-sans",
                isDrawerOpen
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              )}
            >
              <Plus className="w-3 h-3" />
              {t.addWidget}
            </button>
          )}
          <button
            onClick={() => setEditMode(!isEditMode)}
            className={cn(
              "px-4 py-2 rounded-xl border text-[10px] font-bold uppercase flex items-center gap-2 transition-all font-sans",
              isEditMode
                ? "bg-green-500/10 border-green-500/20 text-green-500"
                : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50"
            )}
          >
            {isEditMode ? <CheckCircle2 className="w-3 h-3" /> : <Settings2 className="w-3 h-3" />}
            {isEditMode ? t.saveLayout : t.editDashboard}
          </button>
          {isEditMode && (
            <button
              onClick={() => resetLayout()}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-destructive transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Drawer */}
      <AnimatePresence>
        {isDrawerOpen && isEditMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-3xl bg-card/50 border border-white/10 mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <DraggableSourceType type="custom" label={t.customNote} icon={Edit} color="#0ea5e9" onAdd={() => handleAddWidget('custom')} />
              <DraggableSourceType type="clock" label="World Clock" icon={Clock} color="#8b5cf6" onAdd={() => handleAddWidget('clock')} />
              <DraggableSourceType type="weather" label="Weather" icon={Cloud} color="#10b981" onAdd={() => handleAddWidget('weather')} />
              <DraggableSourceType type="hardware" label="Hardware" icon={Cpu} color="#f43f5e" onAdd={() => handleAddWidget('hardware')} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-12 gap-6 items-start pb-20">
            {widgets.map((widget) => (
              <SortableWidget key={widget.id} widget={widget}>
                <WidgetRenderer
                  widget={widget}
                  t={t}
                  userProfile={userProfile}
                  achievements={achievements}
                  connectedAccounts={connectedAccounts}
                  unlockedCount={unlockedCount}
                  progress={progress}
                  isEditMode={isEditMode}
                  onRemove={() => removeWidget(widget.id)}
                />
              </SortableWidget>
            ))}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={false} dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeWidget ? (
            <div className="w-full h-full opacity-90 scale-105 cursor-grabbing">
              <div style={{ transform: 'scale(1.05)' }}>
                <WidgetRenderer
                  widget={activeWidget}
                  t={t}
                  userProfile={userProfile}
                  achievements={achievements}
                  connectedAccounts={connectedAccounts}
                  unlockedCount={unlockedCount}
                  progress={progress}
                  isEditMode={false} // Hide edit controls during drag
                  onRemove={() => { }}
                />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function DraggableSourceType({ type, label, icon: Icon, color, onAdd }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: { type, isNew: true }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all group touch-none select-none",
        isDragging && "opacity-50"
      )}
      onClick={onAdd}
    >
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:bg-primary hover:text-white cursor-grab active:cursor-grabbing transition-colors"
        onClick={(e) => e.stopPropagation()} // Prevent triggering Click-to-Add when dragging
      >
        <GripVertical className="w-3 h-3" />
      </div>

      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform mt-2" style={{ color }}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      <div className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">Click to Add</div>
    </div>
  )
}

function SortableWidget({ widget, children }: { widget: WidgetConfig, children: React.ReactNode }) {
  const { isEditMode } = useDashboardStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id, disabled: !isEditMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0 : 1,
    gridColumn: widget.colSpan ? `span ${widget.colSpan * 3}` : undefined,
    gridRow: widget.rowSpan ? `span ${widget.rowSpan}` : undefined
  }

  // Fallback class logic if no colSpan logic is present (legacy widgets)
  const colClass = !widget.colSpan ? (
    widget.shape === 'wide' ? 'col-span-12' :
      widget.shape === 'square' ? 'col-span-6 lg:col-span-3' :
        'col-span-12 lg:col-span-4'
  ) : ''

  const handleResize = (e: React.MouseEvent, auto: boolean = false) => {
    e.stopPropagation()
    // Cycle Width: 1 -> 2 -> 4 -> 1 (corresponding to 3, 6, 12 cols)
    const currentSpan = widget.colSpan || (widget.shape === 'wide' ? 4 : widget.shape === 'square' ? 1 : 2)
    const nextSpan = currentSpan === 1 ? 2 : currentSpan === 2 ? 4 : 1

    // Cycle Height for now just toggles 1 or 2
    // const currentRows = widget.rowSpan || 1
    // const nextRows = currentRows === 1 ? 2 : 1

    useDashboardStore.getState().reorderWidgets(
      useDashboardStore.getState().widgets.map(w => w.id === widget.id ? { ...w, colSpan: nextSpan } : w)
    )
  }

  const handleResizeHeight = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentRows = widget.rowSpan || 1
    const nextRows = currentRows >= 3 ? 1 : currentRows + 1

    useDashboardStore.getState().reorderWidgets(
      useDashboardStore.getState().widgets.map(w => w.id === widget.id ? { ...w, rowSpan: nextRows } : w)
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        colClass,
        isEditMode && "relative group/sortable",
        "h-full"
      )}
    >
      {isEditMode && (
        <>
          <div
            {...attributes}
            {...listeners}
            className="absolute -top-3 -left-3 z-[60] p-2 bg-primary rounded-xl shadow-xl cursor-grab active:cursor-grabbing hover:bg-primary/80 transition-transform text-white"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Resize Controls */}
          <div className="absolute -bottom-3 -right-3 z-[60] flex gap-1 bg-card border border-white/10 rounded-xl p-1 shadow-xl opacity-0 group-hover/sortable:opacity-100 transition-opacity">
            <button
              onClick={handleResize}
              className="p-1.5 hover:bg-primary/20 rounded-lg text-xs font-bold"
              title="Resize Width"
            >
              ↔
            </button>
            <div className="w-px bg-white/10" />
            <button
              onClick={handleResizeHeight}
              className="p-1.5 hover:bg-primary/20 rounded-lg text-xs font-bold"
              title="Resize Height"
            >
              ↕
            </button>
          </div>
        </>
      )}
      {children}
    </div>
  )
}

function HardwareBar({ label, value, percent, color, icon }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider font-sans">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span className={cn("tracking-tighter", color.includes('primary') ? "text-primary" : color.includes('accent') ? "text-accent" : "text-muted-foreground")}>{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={cn("h-full", color)} />
      </div>
    </div>
  )
}

import { useHolidayMode } from "@/lib/hooks/use-holiday"

function WidgetRenderer({ widget, t, userProfile, achievements, connectedAccounts, unlockedCount, progress, isEditMode, onRemove }: any) {
  const isHoliday = useHolidayMode()

  if (widget.type === 'welcome') {
    return (
      <div className="h-56 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 border border-white/10 flex flex-col justify-center px-10 relative overflow-hidden group shadow-2xl shadow-primary/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {isHoliday && (
          <>
            <div className="absolute top-4 right-10 text-6xl opacity-10 rotate-12 pointer-events-none select-none">🎄</div>
            <div className="absolute bottom-4 right-20 text-4xl opacity-10 -rotate-12 pointer-events-none select-none">🎁</div>
            <div className="absolute inset-0 pointer-events-none bg-[url('https://raw.githubusercontent.com/hyperscript-org/hyperscript/master/docs/images/snow.gif')] opacity-5 mix-blend-screen bg-cover" />
          </>
        )}

        <div className="z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest font-sans">
              {userProfile?.role === 'senior' ? t.seniorArch : t.juniorDev}
            </div>
            {connectedAccounts.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest font-sans">
                <Cloud className="w-3 h-3" />
                {t.systemSync}
              </div>
            )}
          </div>
          <h3 className="text-3xl font-black tracking-tightest">
            {isHoliday ? (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-green-500">Mutlu Yıllar</span>
            ) : t.welcome}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{userProfile?.name || 'Explorer'}</span>.
          </h3>
          <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
            {t.premiumFeel}
          </p>
        </div>
        {isEditMode && (
          <button onClick={onRemove} className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-full hover:bg-destructive transition-colors z-[100]"><X className="w-4 h-4" /></button>
        )}
      </div>
    )
  }

  if (widget.type === 'hardware') {
    return (
      <div className="p-8 h-full min-h-[220px] rounded-[2rem] bg-card/30 backdrop-blur-xl border border-white/10 group hover:border-primary/30 transition-all shadow-xl relative">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground font-sans">{t.hardwareStats}</h4>
          <Activity className="w-4 h-4 text-primary animate-pulse" />
        </div>
        <div className="space-y-6">
          <HardwareBar label={t.cpuUsage} value="12%" percent={12} color="bg-primary" icon={<Cpu className="w-3 h-3" />} />
          <HardwareBar label={t.ramUsage} value="642 MB" percent={45} color="bg-accent" icon={<Zap className="w-3 h-3" />} />
          <HardwareBar label={t.storageUsage} value="1.2 GB" percent={6} color="bg-white/20" icon={<HardDrive className="w-3 h-3" />} />
        </div>
        {isEditMode && (
          <button onClick={onRemove} className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-full hover:bg-destructive transition-colors z-[100]"><X className="w-4 h-4" /></button>
        )}
      </div>
    )
  }

  if (widget.type === 'achievements') {
    return (
      <div className="p-8 h-full min-h-[220px] rounded-[2rem] bg-card/30 backdrop-blur-xl border border-white/10 relative overflow-hidden group hover:border-accent/30 transition-all shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground font-sans">{t.achievements}</h4>
          <Trophy className="w-5 h-5 text-accent" />
        </div>
        <div className="flex items-end gap-6 mb-8">
          <div className="text-6xl font-black tracking-tighter text-accent">{progress}%</div>
          <div className="flex-1 space-y-2 mb-2 font-sans">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {unlockedCount} / {achievements.length} {t.unlockedCount}
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-accent" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {achievements.slice(0, 10).map((a: any, i: any) => (
            <div key={i} className={cn(
              "aspect-square rounded-xl border flex items-center justify-center text-xl transition-all",
              a.isUnlocked ? "bg-accent/10 border-accent/30 grayscale-0" : "bg-white/5 border-white/5 grayscale opacity-20"
            )}>
              {a.icon}
            </div>
          ))}
        </div>
        {isEditMode && (
          <button onClick={onRemove} className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-full hover:bg-destructive transition-colors z-[100]"><X className="w-4 h-4" /></button>
        )}
      </div>
    )
  }

  if (widget.type === 'health') {
    return (
      <div className="p-8 h-full min-h-[220px] rounded-[2.5rem] bg-primary text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 p-6 opacity-20">
          <ShieldCheck className="w-20 h-20" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 font-sans">{t.aiCoreHealth}</h4>
            <div className="text-2xl font-black italic tracking-tighter">{t.optimized}</div>
          </div>
          <div className="space-y-4 font-sans">
            <div className="flex items-center gap-3 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {t.localInference}
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              {t.systemSafe}
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{t.rank}</div>
              <div className="text-lg font-black tracking-tighter uppercase">{unlockedCount > 10 ? t.master : t.rookie}</div>
            </div>
          </div>
        </div>
        {isEditMode && (
          <button onClick={onRemove} className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-destructive transition-colors z-[100]"><X className="w-4 h-4" /></button>
        )}
      </div>
    )
  }

  if (widget.type === 'activity') {
    return (
      <div className="p-8 h-full min-h-[220px] rounded-[2rem] bg-card/30 backdrop-blur-xl border border-white/10 shadow-xl relative flex flex-col">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground font-sans">{t.recentActivity}</h4>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
          {[
            { id: 1, type: 'model', name: 'Face Detector v2.0', time: '2m ago', icon: <Activity className="w-3 h-3 text-primary" /> },
            { id: 2, type: 'sync', name: 'Cloud Backup (Gist)', time: '1h ago', icon: <Cloud className="w-3 h-3 text-green-500" /> },
            { id: 3, type: 'achievement', name: 'Polyglot Agent', time: '3h ago', icon: <Trophy className="w-3 h-3 text-accent" /> },
            { id: 4, type: 'training', name: 'Cup Class (50 samples)', time: '4h ago', icon: <Zap className="w-3 h-3 text-yellow-500" /> },
            { id: 5, type: 'system', name: 'Update Installed', time: '1d ago', icon: <Settings2 className="w-3 h-3 text-white" /> },
          ].map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-background/50 border border-white/5">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-bold tracking-tight">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-sans">{item.type}</div>
                </div>
              </div>
              <div className="text-[10px] font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors">
                {item.time}
              </div>
            </div>
          ))}
        </div>
        {isEditMode && (
          <button onClick={onRemove} className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-full hover:bg-destructive transition-colors z-[100]"><X className="w-4 h-4" /></button>
        )}
      </div>
    )
  }

  if (widget.type === 'clock') {
    return (
      <div className="p-8 h-full min-h-[220px] rounded-[2rem] bg-indigo-500 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-6 opacity-20">
          <Clock className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 font-sans">Local Time</h4>
          <div className="text-4xl font-black tracking-tighter">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-sm opacity-80 mt-1 font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
        {isEditMode && (
          <button onClick={onRemove} className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-destructive transition-colors z-[100]"><X className="w-4 h-4" /></button>
        )}
      </div>
    )
  }

  if (widget.type === 'weather') {
    return (
      <div className="p-8 h-full min-h-[220px] rounded-[2rem] bg-emerald-500 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-6 opacity-20">
          <Cloud className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2 font-sans">Istanbul, TR</h4>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-black tracking-tighter">24°</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Clear Sky</span>
              <span className="text-xs opacity-70">Hum: 45%</span>
            </div>
          </div>
        </div>
        {isEditMode && (
          <button onClick={onRemove} className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-destructive transition-colors z-[100]"><X className="w-4 h-4" /></button>
        )}
      </div>
    )
  }

  if (widget.type === 'nodes') {
    return (
      <div className="p-8 h-full min-h-[280px] rounded-[2rem] bg-card/30 backdrop-blur-xl border border-white/10 shadow-xl relative flex flex-col justify-between font-sans">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{t.deviceStatus}</h4>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">KamiAI Core Node</div>
                <div className="text-[10px] text-green-500 font-black uppercase tracking-widest">{t.online}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-50">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Activity className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">ESP32-Cam-01</div>
                <div className="text-[10px] text-red-500 font-black uppercase tracking-widest">{t.offline}</div>
              </div>
            </div>
          </div>
        </div>
        {isEditMode && (
          <button onClick={onRemove} className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-full hover:bg-destructive transition-colors z-[100]"><X className="w-4 h-4" /></button>
        )}
        <button className="w-full py-4 mt-8 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all active:scale-95">
          Refresh Network
        </button>
      </div>
    )
  }

  if (widget.type === 'custom') {
    return (
      <div
        className="p-8 h-full min-h-[200px] rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group/custom"
        style={{
          backgroundColor: `${widget.color}15`,
          borderColor: `${widget.color}30`
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20" style={{ backgroundColor: widget.color }} />
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: widget.color }} />
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 font-sans">{widget.title}</h4>
              </div>
              {isEditMode && (
                <div className="flex gap-2 z-[100]">
                  <button onClick={onRemove} className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-white transition-all"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
            <div className="text-xl font-bold tracking-tight leading-snug outline-none" contentEditable={isEditMode} suppressContentEditableWarning onBlur={(e) => {
              const newContent = e.currentTarget.textContent || ""
              useDashboardStore.getState().reorderWidgets(
                useDashboardStore.getState().widgets.map(w => w.id === widget.id ? { ...w, content: newContent } : w)
              )
            }}>
              {widget.content}
            </div>
          </div>
          {isEditMode && (
            <div className="pt-4 flex gap-1">
              {['#0ea5e9', '#8b5cf6', '#f43f5e', '#10b981'].map(c => (
                <button
                  key={c}
                  onClick={() => useDashboardStore.getState().reorderWidgets(
                    useDashboardStore.getState().widgets.map(w => w.id === widget.id ? { ...w, color: c } : w)
                  )}
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

function TrainingView() {
  const webcamRef = useRef<Webcam>(null)
  const { setModelLoading, addSample, setPrediction, isLive } = useVisionStore()
  const isRunning = useRef(true)

  // Initialize AI Controller
  useEffect(() => {
    const initAI = async () => {
      setModelLoading(true)
      await aiController.init('vision')
      setModelLoading(false)
    }
    initAI()

    return () => {
      isRunning.current = false
    }
  }, [setModelLoading])

  // Inference Loop
  useEffect(() => {
    let timerId: number

    const loop = async () => {
      if (!isLive) {
        timerId = window.setTimeout(loop, 100)
        return
      }

      if (isRunning.current && webcamRef.current?.video && webcamRef.current.video.readyState === 4) {
        const result = await aiController.predict(webcamRef.current.video)
        if (result && result.confidences) {
          // Update Winner
          setPrediction({
            classId: result.label,
            confidence: result.confidences[result.label]
          })
          // Update All for the cards
          useVisionStore.getState().setAllConfidences(result.confidences)
        }
      }
      timerId = window.requestAnimationFrame(loop)
    }

    loop()
    return () => {
      cancelAnimationFrame(timerId)
      clearTimeout(timerId)
    }
  }, [isLive, setPrediction])

  // handle Add Example Loop (when holding button)
  const trainingInterval = useRef<NodeJS.Timeout | null>(null)

  const handleTrainClass = (classId: string) => {
    if (trainingInterval.current) {
      clearInterval(trainingInterval.current)
      trainingInterval.current = null
    }

    if (classId) {
      const train = async () => {
        if (webcamRef.current?.video) {
          await aiController.addExample(webcamRef.current.video, classId)
          addSample(classId, webcamRef.current.video)
        }
      }

      train()
      trainingInterval.current = setInterval(train, 100)
    }
  }

  const t = useTranslation()
  const aiError = aiController.getError()

  if (aiError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-card/40 backdrop-blur rounded-3xl border-2 border-dashed border-destructive/20 font-sans">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h3 className="text-xl font-bold mb-2">{t.failedToFetch}</h3>
        <p className="text-muted-foreground mb-8 max-w-md">{aiError}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          {t.retry}
        </button>
      </div>
    )
  }

  return (
    <div className="h-full grid grid-cols-12 gap-6 p-1">
      {/* Left Col: Camera & Inference */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <CameraView webcamRef={webcamRef} />
        <div className="flex-1">
          <InferenceResult />
        </div>
      </div>

      {/* Right Col: Controls */}
      <div className="col-span-12 lg:col-span-4 h-full min-h-[400px] flex flex-col gap-4">
        <ModelManager />
        <div className="flex-1 overflow-hidden">
          <TrainingPanel
            onTrainClass={handleTrainClass}
          />
        </div>
      </div>
    </div>
  )
}

function LogicView() {
  return <div className="flex items-center justify-center h-full text-muted-foreground font-sans">React Flow Canvas Placeholder</div>
}

function WhiteboardView() {
  return <div className="flex items-center justify-center h-full text-muted-foreground font-sans">Tldraw Whiteboard Placeholder</div>
}
