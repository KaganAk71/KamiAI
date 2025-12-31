"use client"

import { useTheme } from "next-themes"
import { Languages, Moon, Sun } from "lucide-react"
import { useAppStore } from "@/lib/stores/app-store"
import { useAchievementStore } from "@/lib/stores/achievement-store"
import * as React from "react"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const { language, setLanguage, availableLanguages, loadExternalLocales } = useAppStore()

    React.useEffect(() => {
        loadExternalLocales()
    }, [loadExternalLocales])

    const handleNextLanguage = () => {
        const currentIndex = availableLanguages.findIndex(l => l.id === language)
        const nextIndex = (currentIndex + 1) % availableLanguages.length
        const nextLang = availableLanguages[nextIndex]
        setLanguage(nextLang.id)

        // Trigger Achievement
        useAchievementStore.getState().unlock('language_learner')
    }

    const currentLabel = availableLanguages.find(l => l.id === language)?.label || language

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleNextLanguage}
                className="relative inline-flex h-10 px-3 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground gap-2 font-bold text-xs uppercase min-w-[80px]"
                title={currentLabel}
            >
                <Languages className="h-4 w-4" />
                {language.toUpperCase()}
            </button>

            <button
                onClick={() => {
                    const newTheme = theme === "light" ? "dark" : "light"
                    setTheme(newTheme)
                    if (newTheme === 'dark') useAchievementStore.getState().unlock('dark_mode_lover')
                }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </button>
        </div>
    )
}
