import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WidgetConfig {
    id: string
    type: 'welcome' | 'hardware' | 'achievements' | 'health' | 'activity' | 'nodes' | 'custom'
    title?: string
    content?: string
    shape?: 'rectangle' | 'square' | 'wide'
    colSpan?: number // 1-4 (Grid has 12 cols, so 1=3 cols, 2=6 cols, etc. simplified for UI)
    rowSpan?: number // 1-4
    color?: string
}

interface DashboardState {
    widgets: WidgetConfig[]
    isEditMode: boolean
    setEditMode: (val: boolean) => void
    reorderWidgets: (newOrder: WidgetConfig[]) => void
    addWidget: (widget: WidgetConfig) => void
    removeWidget: (id: string) => void
    resetLayout: () => void
}

const DEFAULT_LAYOUT: WidgetConfig[] = [
    { id: 'welcome', type: 'welcome', shape: 'wide' },
    { id: 'hardware', type: 'hardware', shape: 'rectangle' },
    { id: 'achievements', type: 'achievements', shape: 'rectangle' },
    { id: 'health', type: 'health', shape: 'rectangle' },
    { id: 'activity', type: 'activity', shape: 'wide' },
    { id: 'nodes', type: 'nodes', shape: 'rectangle' },
]

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set) => ({
            widgets: DEFAULT_LAYOUT,
            isEditMode: false,
            setEditMode: (val) => set({ isEditMode: val }),
            reorderWidgets: (newOrder) => set({ widgets: newOrder }),
            addWidget: (widget) => set((state) => ({ widgets: [...state.widgets, widget] })),
            removeWidget: (id) => set((state) => ({ widgets: state.widgets.filter(w => w.id !== id) })),
            resetLayout: () => set({ widgets: DEFAULT_LAYOUT })
        }),
        {
            name: 'kamiai-dashboard-storage'
        }
    )
)
