import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TranslationSchema } from '../i18n/locales'
import { parseLocaleXml } from '../i18n/xml-loader'

export type UserRole = 'junior' | 'senior' | 'opensource'
export type AIModule = 'vision' | 'audio' | 'pose'

interface AppState {
    // Navigation & Onboarding
    onboardingComplete: boolean
    activeModule: AIModule | null

    // User Profile
    userProfile: {
        name: string
        role: UserRole
        avatar?: string
    } | null

    // System State
    isSidebarOpen: boolean
    language: string
    dynamicLocales: Record<string, TranslationSchema>
    availableLanguages: { id: string; label: string }[]
    primaryColor: string

    // Actions
    completeOnboarding: (profile: { name: string; role: UserRole }) => void
    setModule: (module: AIModule | null) => void
    setSidebarOpen: (open: boolean) => void
    setLanguage: (lang: string) => void
    setPrimaryColor: (color: string) => void
    loadExternalLocales: () => Promise<void>
    importLocale: (name: string, content: string) => Promise<void>
    resetApp: () => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            onboardingComplete: false,
            activeModule: null,
            userProfile: null,
            isSidebarOpen: true,
            language: typeof window !== 'undefined'
                ? (navigator.language.startsWith('tr') ? 'tr' : 'en')
                : 'en',
            dynamicLocales: {},
            availableLanguages: [
                { id: 'en', label: 'English' },
                { id: 'tr', label: 'Türkçe' }
            ],
            primaryColor: '#F6C944',

            completeOnboarding: (profile) => set({
                userProfile: profile,
                onboardingComplete: true
            }),

            setModule: (module) => set({ activeModule: module }),

            setSidebarOpen: (open) => set({ isSidebarOpen: open }),

            setLanguage: (lang) => set({ language: lang }),

            setPrimaryColor: (color) => set({ primaryColor: color }),

            loadExternalLocales: async () => {
                try {
                    const res = await fetch('/api/locales')
                    const { locales } = await res.json()

                    const dynamic: Record<string, TranslationSchema> = {}
                    const langs = [
                        { id: 'en', label: 'English' },
                        { id: 'tr', label: 'Türkçe' }
                    ]

                    for (const loc of locales) {
                        const parsed = await parseLocaleXml(`/locales/${loc.filename}`)
                        if (parsed) {
                            dynamic[loc.id] = parsed.translations as TranslationSchema
                            if (!langs.find(l => l.id === loc.id)) {
                                langs.push({ id: loc.id, label: parsed.name })
                            }
                        }
                    }

                    set({ dynamicLocales: dynamic, availableLanguages: langs })
                } catch (e) {
                    console.error('Failed to load external locales:', e)
                }
            },

            importLocale: async (name, content) => {
                try {
                    const res = await fetch('/api/locales/save', {
                        method: 'POST',
                        body: JSON.stringify({ name, content })
                    })
                    if (res.ok) {
                        await get().loadExternalLocales()
                    }
                } catch (e) {
                    console.error('Import Failed:', e)
                }
            },

            resetApp: () => {
                set({
                    onboardingComplete: false,
                    activeModule: null,
                    userProfile: null
                })
            },
        }),
        {
            name: 'kamiai-app-storage',
            partialize: (state) => ({
                onboardingComplete: state.onboardingComplete,
                activeModule: state.activeModule,
                userProfile: state.userProfile,
                language: state.language,
                isSidebarOpen: state.isSidebarOpen,
                primaryColor: state.primaryColor
            }),
        }
    )
)
