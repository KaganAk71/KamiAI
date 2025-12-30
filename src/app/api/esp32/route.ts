import { NextResponse } from 'next/server'

// In-memory store for active devices (for the session)
// In a production local-app, we might persist this to IndexedDB 
// but the API route runs on the server side (Next.js Node runtime).
// Local apps often use a singleton for this.

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'KamiAI IoT Gateway is active.'
    })
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const { deviceId, type, ip } = data

        console.log(`[IoT] New device registered: ${deviceId} (${type}) at ${ip}`)

        return NextResponse.json({
            success: true,
            message: `Device ${deviceId} registered successfully.`
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }
}
