"use client"

import * as React from "react"
import { useVisionStore } from "@/lib/stores/vision-store"
import { cn } from "@/lib/utils"

export function InferenceResult() {
    const { currentPrediction, classes } = useVisionStore()

    if (!currentPrediction) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm border border-white/5 rounded-xl bg-black/20 p-4">
                Waiting for model...
            </div>
        )
    }

    const activeClass = classes.find(c => c.id === currentPrediction.classId)
    const confidence = Math.round(currentPrediction.confidence * 100)

    return (
        <div className="bg-card/50 backdrop-blur border border-white/10 rounded-xl p-6 relative overflow-hidden">
            {/* Ambient Glow */}
            <div
                className="absolute -right-10 -top-10 w-32 h-32 blur-[50px] transition-colors duration-500"
                style={{ backgroundColor: activeClass ? activeClass.color : 'transparent', opacity: 0.2 }}
            />

            <div className="relative z-10">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Real-time Inference</h4>

                <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-4xl font-bold tracking-tight">
                        {activeClass ? activeClass.name : "Unknown"}
                    </span>
                    <span className="text-xl font-mono text-muted-foreground">
                        {confidence}%
                    </span>
                </div>

                {/* Confidence Bar */}
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-100 ease-out"
                        style={{
                            width: `${confidence}%`,
                            backgroundColor: activeClass?.color || 'transparent'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
