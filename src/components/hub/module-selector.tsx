"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useAppStore, AIModule } from "@/lib/stores/app-store"
import { cn } from "@/lib/utils"
import { Camera, Mic2, Move, ChevronRight } from "lucide-react"

const modules = [
    {
        id: 'vision' as AIModule,
        title: 'Vision Studio',
        description: 'Teach your agent to recognize objects, people, or gestures through the camera.',
        icon: Camera,
        color: 'from-amber-400 to-orange-600',
        available: true
    },
    {
        id: 'audio' as AIModule,
        title: 'Audio Studio',
        description: 'Implement sound and speech recognition patterns for your automations.',
        icon: Mic2,
        color: 'from-blue-400 to-indigo-600',
        available: false // Coming soon
    },
    {
        id: 'pose' as AIModule,
        title: 'Pose Studio',
        description: 'Track human movement and posture to trigger complex physical actions.',
        icon: Move,
        color: 'from-emerald-400 to-teal-600',
        available: false // Coming soon
    }
]

export function ModuleSelector() {
    const { setModule, userProfile } = useAppStore()

    return (
        <div className="flex flex-col gap-12 max-w-6xl mx-auto py-12 px-6">
            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight">
                    Welcome back, <span className="text-primary">{userProfile?.name || 'Explorer'}</span>.
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    What would you like to build today? Select a module to start training your local AI model.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {modules.map((mod, idx) => (
                    <motion.button
                        key={mod.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        disabled={!mod.available}
                        onClick={() => setModule(mod.id)}
                        className={cn(
                            "group relative flex flex-col items-start p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-left overflow-hidden",
                            mod.available
                                ? "bg-card border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                                : "bg-muted/30 border-dashed border-border/30 opacity-60 grayscale cursor-not-allowed"
                        )}
                    >
                        {/* Background Glow */}
                        <div className={cn(
                            "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity",
                            `bg-gradient-to-br ${mod.color}`
                        )} />

                        <div className={cn(
                            "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                            `bg-gradient-to-br ${mod.color}`
                        )}>
                            <mod.icon className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="text-2xl font-bold mb-3">{mod.title}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                            {mod.description}
                        </p>

                        <div className="flex items-center gap-2 font-bold text-sm">
                            <span className={cn(
                                "transition-colors",
                                mod.available ? "text-primary" : "text-muted-foreground"
                            )}>
                                {mod.available ? 'Launch Studio' : 'Under Development'}
                            </span>
                            {mod.available && (
                                <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
