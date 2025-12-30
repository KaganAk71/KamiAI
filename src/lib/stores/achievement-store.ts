import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Achievement {
    id: string
    title: { en: string, tr: string }
    description: { en: string, tr: string }
    icon: string
    isHidden: boolean
    isUnlocked: boolean
    unlockedAt?: number
}

interface AchievementState {
    achievements: Achievement[]
    unlock: (id: string) => void
    resetAchievements: () => void
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    // 10 Visible Achievements
    {
        id: 'first_model',
        title: { en: 'First Steps', tr: 'İlk Adımlar' },
        description: { en: 'Train your first AI model.', tr: 'İlk yapay zeka modelini eğit.' },
        icon: '🚀',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'perfect_precision',
        title: { en: 'Perfect Precision', tr: 'Kusursuz Keskinlik' },
        description: { en: 'Achieve 100% confidence in a prediction.', tr: 'Bir tahminde %100 doğruluk oranına ulaş.' },
        icon: '🎯',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'senior_architect',
        title: { en: 'Senior Architect', tr: 'Kıdemli Mimar' },
        description: { en: 'Switch your knowledge tier to Senior.', tr: 'Bilgi seviyeni Kıdemli (Senior) olarak değiştir.' },
        icon: '👑',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'data_hoarder',
        title: { en: 'Data Hoarder', tr: 'Veri İstifçisi' },
        description: { en: 'Collect 500 samples for a single class.', tr: 'Tek bir sınıf için 500 örnek topla.' },
        icon: '📦',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'multitasker',
        title: { en: 'Multitasker', tr: 'Çoklu Görevli' },
        description: { en: 'Create 10 different AI classes.', tr: '10 farklı yapay zeka sınıfı oluştur.' },
        icon: '🧠',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'system_format',
        title: { en: 'Clean Slate', tr: 'Temiz Bir Başlangıç' },
        description: { en: 'Perform a full system format.', tr: 'Tam bir sistem formatı gerçekleştir.' },
        icon: '🧹',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'webgpu_master',
        title: { en: 'Hardware Overclocker', tr: 'Donanım Canavarı' },
        description: { en: 'Enable WebGPU backend for extreme performance.', tr: 'Ekstrem performans için WebGPU motorunu etkinleştir.' },
        icon: '⚡',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'language_learner',
        title: { en: 'Polyglot Agent', tr: 'Poliglot Ajan' },
        description: { en: 'Switch between English and Turkish.', tr: 'İngilizce ve Türkçe arasında geçiş yap.' },
        icon: '🌍',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'first_error',
        title: { en: 'Hello Darkness', tr: 'Merhaba Karanlık' },
        description: { en: 'Encounter your first system error.', tr: 'İlk sistem hatan ile karşılaş.' },
        icon: '⚠️',
        isHidden: false,
        isUnlocked: false
    },
    {
        id: 'dark_mode_lover',
        title: { en: 'Night Watch', tr: 'Gece Nöbeti' },
        description: { en: 'Activate the Midnight Depth theme.', tr: 'Midnight Depth (Gece) temasını etkinleştir.' },
        icon: '🌙',
        isHidden: false,
        isUnlocked: false
    },

    // 14 Hidden Achievements
    {
        id: 'the_67',
        title: { en: 'The 67 Mystery', tr: '67 Gizemi' },
        description: { en: 'Model confidence is wavering around 67%... are we sure about this?', tr: 'Model doğruluğu %67 civarında sallanıyor... emin miyiz?' },
        icon: '🎲',
        isHidden: true,
        isUnlocked: false
    },
    {
        id: 'fatih_conquest',
        title: { en: 'The Conqueror', tr: 'Cihan Fatihi' },
        description: { en: 'Scaling up the AI like a conquest on horseback.', tr: 'AI atlılar ile sallana sallana fethe gidiyor!' },
        icon: '⚔️',
        isHidden: true,
        isUnlocked: false
    },
    {
        id: 'quick_reflex',
        title: { en: 'Speed Demon', tr: 'Hız Tutkunu' },
        description: { en: 'Set animation scale to 0.1x.', tr: 'Animasyon hızını 0.1x olarak ayarla.' },
        icon: '🏃',
        isHidden: true,
        isUnlocked: false
    },
    {
        id: 'blur_master',
        title: { en: 'Glassmorphism Addict', tr: 'Buzlu Cam Bağımlısı' },
        description: { en: 'Set blur intensity to maximum.', tr: 'Bulanıklık yoğunluğunu maksimuma getir.' },
        icon: '🌫️',
        isHidden: true,
        isUnlocked: false
    }
    // ... adding more hidden ones progressively or defining them here
]

export const useAchievementStore = create<AchievementState>()(
    persist(
        (set, get) => ({
            achievements: INITIAL_ACHIEVEMENTS,
            unlock: (id) => {
                const { achievements } = get()
                const achievement = achievements.find(a => a.id === id)
                if (achievement && !achievement.isUnlocked) {
                    set({
                        achievements: achievements.map(a =>
                            a.id === id ? { ...a, isUnlocked: true, unlockedAt: Date.now() } : a
                        )
                    })
                    // Trigger global event for UI toast
                    window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: achievement }))
                }
            },
            resetAchievements: () => set({ achievements: INITIAL_ACHIEVEMENTS })
        }),
        {
            name: 'kamiai-achievement-storage'
        }
    )
)
