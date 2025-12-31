import { create } from 'zustand'

export type NotificationType = 'success' | 'info' | 'error' | 'warning' | 'achievement'

export interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    duration?: number
    icon?: string
}

interface NotificationState {
    notifications: Notification[]
    pushNotification: (notification: Omit<Notification, 'id'>) => void
    dismissNotification: (id: string) => void
    requestPermission: () => Promise<boolean>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],

    pushNotification: (n) => {
        const id = Math.random().toString(36).substring(7)
        const duration = n.duration || 5000

        const newNotification = { ...n, id }
        set((state) => ({
            notifications: [newNotification, ...state.notifications]
        }))

        // System Notification if permitted
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(n.title, { body: n.message })
        }

        if (duration > 0) {
            setTimeout(() => {
                get().dismissNotification(id)
            }, duration)
        }
    },

    dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),

    requestPermission: async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) return false
        const permission = await Notification.requestPermission()
        return permission === 'granted'
    }
}))
