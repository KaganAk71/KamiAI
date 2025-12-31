import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BackupProvider = 'local' | 'github' | 'google'

export interface BackupRecord {
    id: string
    timestamp: number
    provider: BackupProvider
    size: number
    filename: string
    note?: string
}

export interface CloudAccount {
    provider: 'github' | 'google'
    username: string
    email?: string
    avatar?: string
    accessToken?: string
    lastSync?: number
}

interface BackupState {
    backupHistory: BackupRecord[]
    connectedAccounts: CloudAccount[]
    autoBackupEnabled: boolean
    backupInterval: 'daily' | 'weekly' | 'manual'
    isSyncing: boolean

    // Actions
    connectAccount: (account: CloudAccount) => void
    disconnectAccount: (provider: 'github' | 'google') => void
    addBackupRecord: (record: BackupRecord) => void
    removeBackupRecord: (id: string) => void
    setAutoBackup: (enabled: boolean, interval?: 'daily' | 'weekly' | 'manual') => void
    setSyncing: (syncing: boolean) => void
}

export const useBackupStore = create<BackupState>()(
    persist(
        (set) => ({
            backupHistory: [],
            connectedAccounts: [],
            autoBackupEnabled: false,
            backupInterval: 'manual',
            isSyncing: false,

            connectAccount: (acc) => set((state) => ({
                connectedAccounts: [...state.connectedAccounts.filter(a => a.provider !== acc.provider), acc]
            })),

            disconnectAccount: (provider) => set((state) => ({
                connectedAccounts: state.connectedAccounts.filter(a => a.provider !== provider)
            })),

            addBackupRecord: (record) => set((state) => ({
                backupHistory: [record, ...state.backupHistory].slice(0, 20) // Keep last 20
            })),

            removeBackupRecord: (id) => set((state) => ({
                backupHistory: state.backupHistory.filter(b => b.id !== id)
            })),

            setAutoBackup: (enabled, interval) => set({
                autoBackupEnabled: enabled,
                backupInterval: interval || 'manual'
            }),

            setSyncing: (syncing) => set({ isSyncing: syncing })
        }),
        {
            name: 'kamiai-backup-storage',
            partialize: (state) => ({
                backupHistory: state.backupHistory,
                connectedAccounts: state.connectedAccounts.map(a => ({ ...a, accessToken: 'HIDDEN' })), // Don't persist real tokens in localstorage for security, though usually fine for local dev
                autoBackupEnabled: state.autoBackupEnabled,
                backupInterval: state.backupInterval
            })
        }
    )
)
