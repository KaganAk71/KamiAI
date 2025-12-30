"use client"

import * as React from "react"
import { Cpu, MemoryStick as Memory } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"

export function ResourceMonitor() {
    const [metrics, setMetrics] = React.useState({ cpu: 0, memory: 0 })
    const t = useTranslation()

    React.useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/system')
                const data = await res.json()
                if (data.cpu !== undefined) {
                    setMetrics({ cpu: data.cpu, memory: data.memory })
                }
            } catch (e) {
                // Silently fail to not disturb UI
            }
        }

        const interval = setInterval(fetchMetrics, 2000)
        fetchMetrics()
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-3 px-2">
            <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">CPU</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${metrics.cpu}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-mono font-bold w-7 text-right">{metrics.cpu}%</span>
                </div>
            </div>

            <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                    <Memory className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">RAM</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${metrics.memory}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-mono font-bold w-7 text-right">{metrics.memory}%</span>
                </div>
            </div>
        </div>
    )
}
