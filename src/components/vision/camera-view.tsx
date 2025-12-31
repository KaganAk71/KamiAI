"use client"

import * as React from "react"
import Webcam from "react-webcam"
import { useVisionStore } from "@/lib/stores/vision-store"
import { motion } from "framer-motion"
import { Loader2, CameraOff } from "lucide-react"

const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
};

interface CameraViewProps {
    webcamRef: React.RefObject<Webcam | null>
}

export function CameraView({ webcamRef }: CameraViewProps) {
    const { isWebcamReady, setWebcamReady, isModelLoading } = useVisionStore()
    const [hasError, setHasError] = React.useState(false)

    return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/90 border-2 border-primary/20 shadow-[0_0_30px_rgba(246,201,68,0.1)] group">
            {/* Glow Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none z-10" />

            {/* Loading State */}
            {!isWebcamReady && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center z-20 text-primary">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-destructive gap-2">
                    <CameraOff className="w-8 h-8" />
                    <span className="text-sm font-medium">Camera Unavailable</span>
                </div>
            )}

            <Webcam
                ref={webcamRef as React.LegacyRef<Webcam>}
                audio={false}
                width={640}
                height={480}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                onUserMedia={() => setWebcamReady(true)}
                onUserMediaError={() => setHasError(true)}
            />

            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none z-10" />

            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/50 z-20" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/50 z-20" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/50 z-20" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/50 z-20" />

            {/* Status Badge */}
            {isWebcamReady && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10 text-xs font-mono text-green-400 flex items-center gap-2 z-20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {isModelLoading ? "LOADING MODEL..." : "LIVE FEED"}
                </div>
            )}
        </div>
    )
}
