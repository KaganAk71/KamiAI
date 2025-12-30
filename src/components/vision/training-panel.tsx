"use client"

import * as React from "react"
import { useVisionStore } from "@/lib/stores/vision-store"
import {
    Plus,
    Trash2,
    Edit3,
    Maximize2,
    Brain,
    LayoutGrid,
    Eye,
    EyeOff,
    Github,
    Share2
} from "lucide-react"
import { useAppStore } from "@/lib/stores/app-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { COLORS } from "@/lib/stores/vision-store"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface TrainingPanelProps {
    onTrainClass: (classId: string) => void
}

export function TrainingPanel({ onTrainClass }: TrainingPanelProps) {
    const {
        classes,
        addClass,
        removeClass,
        currentPrediction,
        currentAllConfidences,
        updateClassName,
        updateClassColor,
        isLive,
        setLive,
        saveModel
    } = useVisionStore()
    const { userProfile } = useAppStore()

    const t = useTranslation()
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [openColorPicker, setOpenColorPicker] = React.useState<string | null>(null)

    return (
        <div className="flex flex-col h-full bg-card/30 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold tracking-tight">{t.trainingHub}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <button
                            onClick={() => setLive(!isLive)}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                isLive ? "bg-green-500/20 text-green-500" : "bg-white/5 text-muted-foreground"
                            )}
                        >
                            {isLive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {isLive ? "Live" : "Idle"}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => addClass()}
                        className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        title={t.addClass}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {classes.map((cls) => (
                    <div
                        key={cls.id}
                        className={cn(
                            "group relative p-4 rounded-2xl border transition-all duration-300",
                            currentPrediction?.classId === cls.id
                                ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-xl shadow-primary/5"
                                : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setOpenColorPicker(openColorPicker === cls.id ? null : cls.id)}
                                    className="w-10 h-10 rounded-xl shadow-inner transition-transform hover:scale-110 active:scale-90 border border-white/10"
                                    style={{ backgroundColor: cls.color }}
                                />
                                <AnimatePresence>
                                    {openColorPicker === cls.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="absolute left-0 top-12 z-50 w-44 p-2 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl grid grid-cols-4 gap-1.5"
                                        >
                                            {COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => {
                                                        updateClassColor(cls.id, color)
                                                        setOpenColorPicker(null)
                                                    }}
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg transition-all hover:scale-110 active:scale-90 border-2",
                                                        cls.color === color ? "border-white" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex-1 min-w-0">
                                {editingId === cls.id ? (
                                    <input
                                        autoFocus
                                        className="bg-transparent border-b border-primary text-sm font-bold w-full focus:outline-none py-1"
                                        value={cls.name}
                                        onChange={(e) => updateClassName(cls.id, e.target.value)}
                                        onBlur={() => setEditingId(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 group/title">
                                        <span className="text-sm font-bold truncate">{cls.name}</span>
                                        <button
                                            onClick={() => setEditingId(cls.id)}
                                            className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                                        >
                                            <Edit3 className="w-3 h-3 text-muted-foreground" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                        <LayoutGrid className="w-3 h-3" />
                                        {cls.sampleCount} {t.samples}
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-white/20" />
                                    <div className="text-[10px] font-mono font-bold text-primary">
                                        {Math.round((currentAllConfidences[cls.id] || 0) * 100)}%
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onMouseDown={() => onTrainClass(cls.id)}
                                    className="p-3 bg-white/5 hover:bg-primary hover:text-primary-foreground rounded-xl transition-all active:scale-90"
                                >
                                    <Brain className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => removeClass(cls.id)}
                                    className="p-3 bg-white/5 hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all active:scale-90"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full"
                                style={{ backgroundColor: cls.color }}
                                animate={{ width: `${(currentAllConfidences[cls.id] || 0) * 100}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            />
                        </div>
                    </div>
                ))}

                {classes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8 border-2 border-dashed border-white/5 rounded-3xl opacity-50">
                        <Plus className="w-8 h-8 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t.addClass}
                        </p>
                    </div>
                )}
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5 space-y-3">
                <button
                    onClick={() => saveModel()}
                    className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                    <Brain className="w-6 h-6" />
                    {t.buildModel}
                </button>

                {userProfile?.role === 'senior' && (
                    <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-black text-white hover:bg-black/80 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95">
                            <Github className="w-4 h-4" />
                            {t.shareOnGithub}
                        </button>
                        <button className="flex-1 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95">
                            <Share2 className="w-4 h-4" />
                            {t.commitToGithub}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
