import { NextResponse } from 'next/server'
import si from 'systeminformation'

export async function GET() {
    try {
        const cpu = await si.currentLoad()
        const mem = await si.mem()
        const fs = await si.fsSize()

        // Find the most relevant partition (usually root or home)
        const mainFs = fs.find(f => f.mount === '/' || f.mount === '/home') || fs[0]

        return NextResponse.json({
            cpu: Math.round(cpu.currentLoad),
            memory: Math.round((mem.active / mem.total) * 100),
            disk: Math.round(mainFs.use),
            details: {
                totalMem: Math.round(mem.total / (1024 * 1024 * 1024)),
                usedMem: Math.round(mem.active / (1024 * 1024 * 1024)),
                totalDisk: Math.round(mainFs.size / (1024 * 1024 * 1024)),
                usedDisk: Math.round(mainFs.used / (1024 * 1024 * 1024)),
                mount: mainFs.mount
            }
        })
    } catch (error) {
        console.error('System Info Fetch Error:', error)
        return NextResponse.json({ error: 'Failed to fetch system metrics' }, { status: 500 })
    }
}
