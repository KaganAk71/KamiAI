import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
    try {
        const { name, content } = await req.json()

        if (!name || !content) {
            return NextResponse.json({ error: 'Missing name or content' }, { status: 400 })
        }

        // Clean name to be safe filename
        const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.xml'
        const localesDir = path.join(process.cwd(), 'public', 'locales')

        if (!fs.existsSync(localesDir)) {
            fs.mkdirSync(localesDir, { recursive: true })
        }

        const filePath = path.join(localesDir, safeName)
        fs.writeFileSync(filePath, content)

        return NextResponse.json({ success: true, filename: safeName })
    } catch (error) {
        console.error('Save Locale Error:', error)
        return NextResponse.json({ error: 'Failed to save locale' }, { status: 500 })
    }
}
