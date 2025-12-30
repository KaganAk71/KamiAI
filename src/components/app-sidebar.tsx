"use client"

import * as React from "react"
import { Brain, FileDigit, Settings, PenTool, LayoutDashboard, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

import { useAppStore } from "@/lib/stores/app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { useHolidayMode } from "@/lib/hooks/use-holiday"
import { ResourceMonitor } from "./system/resource-monitor"

interface SidebarProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function AppSidebar({ activeTab, onTabChange }: SidebarProps) {
    const { activeModule, setModule, userProfile } = useAppStore()
    const t = useTranslation()
    const isHoliday = useHolidayMode()

    const tabs = [
        { id: "dashboard", icon: LayoutDashboard, label: t.overview },
        { id: "training", icon: Brain, label: t.trainingHub },
        { id: "test", icon: Play, label: t.testModel },
        { id: "logic", icon: FileDigit, label: t.logicFlows },
        { id: "whiteboard", icon: PenTool, label: t.whiteboard },
        { id: "settings", icon: Settings, label: t.settings },
    ]

    return (
        <div className="w-64 border-r bg-card/50 backdrop-blur-md h-screen flex flex-col p-4 border-white/10 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-0 w-full h-32 bg-primary/10 blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-2 mb-8 z-10 relative">
                {isHoliday && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, rotate: -20 }}
                        animate={{ opacity: 1, y: 0, rotate: -12 }}
                        className="absolute -top-5 -left-3 text-3xl filter drop-shadow-lg z-50 pointer-events-none select-none"
                    >
                        🎅
                    </motion.div>
                )}
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-none">
                        KamiAI
                    </h1>
                    <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                        Alpha v2.0
                    </p>
                </div>
            </div>

            <nav className="space-y-2 z-10 flex-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === tab.id
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(246,201,68,0.1)]"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "text-primary")} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 z-10 mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    {t.systemStatus}
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-green-500 mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {t.online}
                </div>

                <div className="border-t border-white/5 pt-4">
                    <ResourceMonitor />
                </div>
            </div>

            <div className="mt-4 text-center space-y-2">
                <p className="text-[10px] text-muted-foreground/60 font-medium">
                    Built with <span className="text-primary font-bold">Vibe Coding</span> by <a href="https://github.com/KaganAk71/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline decoration-dotted">KağanAk</a>
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    Türk Yazılımcılar
                </div>
            </div>
        </div>
    )
}
