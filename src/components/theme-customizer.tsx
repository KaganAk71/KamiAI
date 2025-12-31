"use client"

import { useAppStore } from "@/lib/stores/app-store"
import { hexToHsl } from "@/lib/utils"
import { useEffect } from "react"

export function ThemeCustomizer() {
    const primaryColor = useAppStore((state) => state.primaryColor)

    useEffect(() => {
        if (!primaryColor) return

        const hsl = hexToHsl(primaryColor)
        const root = document.documentElement

        // Light mode overrides
        // --primary: 43 96% 45%;
        // --accent: 43 96% 86%;
        root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`)
        root.style.setProperty('--accent', `${hsl.h} ${hsl.s}% 90%`)
        root.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`)

        // For dark mode, we usually want a slightly more vibrant/lighter version for primary
        // and a much darker version for accent.
        // We'll use CSS classes to handle the dark mode override of the override
        // but it's easier to just inject a style tag that targets .dark
        const styleId = 'custom-theme-overrides'
        let styleTag = document.getElementById(styleId) as HTMLStyleElement
        if (!styleTag) {
            styleTag = document.createElement('style')
            styleTag.id = styleId
            document.head.appendChild(styleTag)
        }

        // Dark mode primary: if it's too dark, bump it up. 
        const darkL = Math.max(hsl.l, 55)
        const darkAccentL = 15

        styleTag.innerHTML = `
            .dark {
                --primary: ${hsl.h} ${hsl.s}% ${darkL}%;
                --accent: ${hsl.h} ${hsl.s}% ${darkAccentL}%;
                --ring: ${hsl.h} ${hsl.s}% ${darkL}%;
            }
        `
    }, [primaryColor])

    return null
}
