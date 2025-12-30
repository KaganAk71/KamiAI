import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AIBackend = 'webgpu' | 'wasm' | 'cpu'

export interface AISettings {
    epochs: number
    learningRate: number
    batchSize: number
    confidenceThreshold: number
    backend: AIBackend
}

export interface NotificationSettings {
    voiceFeedback: boolean
    soundEffects: boolean
    visualAlerts: boolean
}

export interface SettingsState {
    ai: AISettings
    notifications: NotificationSettings
    system: {
        hardwareAcceleration: boolean
        autoSaveModels: boolean
        telemetryEnabled: boolean
    }

    // Actions
    updateAISettings: (settings: Partial<AISettings>) => void
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
    updateSystemSettings: (settings: Partial<SettingsState['system']>) => void
    resetSettings: () => void
}

const DEFAULT_SETTINGS: Omit<SettingsState, 'updateAISettings' | 'updateNotificationSettings' | 'updateSystemSettings' | 'resetSettings'> = {
    ai: {
        epochs: 10,
        learningRate: 0.001,
        batchSize: 16,
        confidenceThreshold: 0.7,
        backend: 'webgpu'
    },
    notifications: {
        voiceFeedback: true,
        soundEffects: true,
        visualAlerts: true
    },
    system: {
        hardwareAcceleration: true,
        autoSaveModels: true,
        telemetryEnabled: false
    }
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...DEFAULT_SETTINGS,

            updateAISettings: (newAi) => set((state) => ({
                ai: { ...state.ai, ...newAi }
            })),

            updateNotificationSettings: (newNotif) => set((state) => ({
                notifications: { ...state.notifications, ...newNotif }
            })),

            updateSystemSettings: (newSys) => set((state) => ({
                system: { ...state.system, ...newSys }
            })),

            resetSettings: () => set(DEFAULT_SETTINGS)
        }),
        {
            name: 'kamiai-settings-storage'
        }
    )
)
