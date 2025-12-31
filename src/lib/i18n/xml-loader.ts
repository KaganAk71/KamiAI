import { XMLParser } from 'fast-xml-parser'

export async function parseLocaleXml(url: string) {
    try {
        const response = await fetch(url)
        const xmlData = await response.text()

        const parser = new XMLParser()
        const jsonObj = parser.parse(xmlData)

        // Expected format: <locale name="Turkish"><key>value</key></locale>
        if (!jsonObj.locale) return null

        return {
            name: jsonObj.locale.name || 'Unknown',
            translations: jsonObj.locale.strings || {}
        }
    } catch (error) {
        console.error('XML Parse Error:', error)
        return null
    }
}
