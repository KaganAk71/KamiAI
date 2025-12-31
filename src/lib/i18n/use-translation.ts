"use client"

import { useAppStore } from "@/lib/stores/app-store"
import { translations, TranslationSchema } from "./locales"

export function useTranslation() {
    const { language, dynamicLocales } = useAppStore()

    // 1. Check dynamic locales (XML)
    if (dynamicLocales[language]) {
        return dynamicLocales[language]
    }

    // 2. Check static locales (locales.ts)
    // Fix index signature error by casting
    const staticTranslations = (translations as any)[language]
    if (staticTranslations) {
        return staticTranslations as TranslationSchema
    }

    // 3. Fallback to English
    return translations.en
}
