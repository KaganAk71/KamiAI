"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useVisionStore } from "@/lib/stores/vision-store"
import { aiController } from "@/lib/ai/unified-controller"
import { CameraView } from "./camera-view"
import { Play, Pause, Database, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Webcam from "react-webcam"
import { useTranslation } from "@/lib/i18n/use-translation"

export function TestHub() {
    const { models, refreshModels, loadModel, classes, currentAllConfidences, setAllConfidences } = useVisionStore()
    const t = useTranslation()
    const [selectedModelId, setSelectedModelId] = React.useState<string>("")
    const [isTesting, setIsTesting] = React.useState(false)
    const webcamRef = React.useRef<Webcam>(null)

    // Find the current winner for HUD
    const winnerId = Object.entries(currentAllConfidences).reduce((a, b) => b[1] > a[1] ? b : a, ["", 0])[0]
    const winner = classes.find(c => c.id === winnerId)

    React.useEffect(() => {
        refreshModels()
    }, [refreshModels])

    const handleModelSelect = async (id: string) => {
        setSelectedModelId(id)
        await loadModel(id)
    }

    // Testing Loop
    React.useEffect(() => {
        let timerId: number
        const loop = async () => {
            if (isTesting && webcamRef.current?.video && webcamRef.current.video.readyState === 4) {
                const result = await aiController.predict(webcamRef.current.video)
                if (result && result.confidences) {
                    setAllConfidences(result.confidences)
                }
            }
            timerId = requestAnimationFrame(loop)
        }
        loop()
        return () => cancelAnimationFrame(timerId)
    }, [isTesting, setAllConfidences])

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between bg-card/50 backdrop-blur border border-border p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{t.inferenceSandbox}</h2>
                        <p className="text-xs text-muted-foreground">Select a trained model to start real-time testing.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedModelId}
                        onChange={(e) => handleModelSelect(e.target.value)}
                        className="bg-secondary/50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-primary focus:ring-2 transition-all w-48"
                    >
                        <option value="" disabled>Select Model...</option>
                        {models.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setIsTesting(!isTesting)}
                        disabled={!selectedModelId}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50",
                            isTesting ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        )}
                    >
                        {isTesting ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isTesting ? t.stopTest : t.runModel}
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                {/* Feed with HUD */}
                <div className="col-span-12 lg:col-span-7 h-full flex flex-col gap-4">
                    <div className="relative flex-1 rounded-2xl overflow-hidden border-2 border-border bg-black shadow-2xl">
                        <CameraView webcamRef={webcamRef} />

                        {/* HUD Overlay */}
                        <AnimatePresence>
                            {isTesting && winner && currentAllConfidences[winner.id] > 0.01 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-between z-30"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: winner.color }} />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest">{t.topPrediction}</p>
                                            <h3 className="text-2xl font-black text-white">{winner.name}</h3>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest">{t.confidence}</p>
                                        <h3 className="text-3xl font-mono font-black text-primary">
                                            {(currentAllConfidences[winner.id] * 100).toFixed(1)}%
                                        </h3>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isTesting && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/50">
                                        <Play className="w-8 h-8 text-primary animate-pulse" />
                                    </div>
                                    <p className="text-white font-bold text-lg">Click "Run Model" to Start</p>
                                    <p className="text-white/40 text-sm">Testing requires a live camera feed</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Results Sidebar */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.activeModels}</h3>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{t.online} Update</span>
                    </div>

                    <div className="space-y-3 pb-20">
                        {classes.map((cls) => {
                            const confidenceValue = currentAllConfidences[cls.id] || 0
                            const confidence = confidenceValue * 100
                            const isWinner = winner?.id === cls.id && confidence > 1

                            return (
                                <div key={cls.id} className={cn(
                                    "bg-card border-2 p-5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                    isWinner ? "border-primary shadow-xl scale-[1.02] bg-primary/5" : "border-border/40 opacity-70"
                                )}>
                                    <div className="flex justify-between items-end mb-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: cls.color }} />
                                            <span className="font-black text-lg tracking-tight">{cls.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn("text-3xl font-mono font-black", isWinner ? "text-primary" : "text-muted-foreground")}>
                                                {confidence.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-4 bg-secondary/50 rounded-full overflow-hidden relative z-10 border border-white/5 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${confidence}%` }}
                                            className="h-full relative transition-all duration-100 ease-out"
                                            style={{ backgroundColor: cls.color }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                        </motion.div>
                                    </div>
                                </div>
                            )
                        })}

                        {classes.length === 0 && (
                            <div className="text-center py-20 bg-secondary/20 rounded-3xl border-4 border-dashed border-border text-muted-foreground">
                                <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-bold">No Trained Groups Found</p>
                                <p className="text-xs opacity-60">Go back to Training Hub to add some data.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
