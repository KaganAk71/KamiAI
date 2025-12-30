"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, X, Sparkles } from "lucide-react"
import { useAppStore } from "@/lib/stores/app-store"
import { Achievement } from "@/lib/stores/achievement-store"

export function AchievementOverlay() {
    const [currentUnlock, setCurrentUnlock] = React.useState<Achievement | null>(null)
    const { language } = useAppStore()

    React.useEffect(() => {
        const handleUnlock = (e: any) => {
            setCurrentUnlock(e.detail)
            // Auto-hide after 5 seconds
            setTimeout(() => {
                setCurrentUnlock(null)
            }, 5000)
        }

        window.addEventListener('achievement_unlocked', handleUnlock)
        return () => window.removeEventListener('achievement_unlocked', handleUnlock)
    }, [])

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <AnimatePresence>
                {currentUnlock && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto bg-card/80 backdrop-blur-2xl border-2 border-primary/50 rounded-2xl p-6 shadow-2xl flex items-center gap-6 min-w-[360px] max-w-md relative overflow-hidden group"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl shadow-inner border border-primary/30 animate-bounce">
                                {currentUnlock.icon}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground p-1 rounded-full shadow-lg">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Achievement Unlocked</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tighter text-foreground">
                                {language === 'tr' ? currentUnlock.title.tr : currentUnlock.title.en}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium leading-tight">
                                {language === 'tr' ? currentUnlock.description.tr : currentUnlock.description.en}
                            </p>
                        </div>

                        <button
                            onClick={() => setCurrentUnlock(null)}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors self-start"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
