"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotificationStore, Notification } from "@/lib/stores/notification-store"
import { X, CheckCircle2, AlertCircle, Info, Trophy, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

export function NotificationOverlay() {
    const { notifications, dismissNotification } = useNotificationStore()

    return (
        <div className="fixed top-20 right-6 z-[110] flex flex-col gap-3 pointer-events-none w-80">
            <AnimatePresence>
                {notifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} onDismiss={() => dismissNotification(n.id)} />
                ))}
            </AnimatePresence>
        </div>
    )
}

function NotificationItem({ notification: n, onDismiss }: { notification: Notification, onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        achievement: <Trophy className="w-5 h-5 text-primary" />
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="pointer-events-auto bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-4"
        >
            <div className="mt-1">
                {icons[n.type] || <Bell className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm tracking-tight">{n.title}</h4>
                <p className="text-xs text-muted-foreground leading-snug mt-1">{n.message}</p>
            </div>
            <button
                onClick={onDismiss}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 text-muted-foreground" />
            </button>
        </motion.div>
    )
}
