import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
    try {
        const localesDir = path.join(process.cwd(), 'public', 'locales')

        if (!fs.existsSync(localesDir)) {
            return NextResponse.json({ locales: [] })
        }

        const files = fs.readdirSync(localesDir)
        const xmlFiles = files.filter(f => {
            const isXml = f.toLowerCase().endsWith('.xml')
            const isExample = f.toLowerCase().includes('.example')
            const isReadme = f.toLowerCase().includes('readme')
            return isXml && !isExample && !isReadme
        })

        const locales = xmlFiles.map(file => ({
            id: file.replace('.xml', '').toLowerCase(),
            filename: file,
            label: file.replace('.xml', '')
        }))

        return NextResponse.json({ locales })
    } catch (error) {
        console.error('List Locales Error:', error)
        return NextResponse.json({ error: 'Failed to list locales' }, { status: 500 })
    }
}
