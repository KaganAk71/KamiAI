import { idbManager } from '../db/idb-manager'
import { useAppStore } from '../stores/app-store'
import { useSettingsStore } from '../stores/settings-store'
import { useAchievementStore } from '../stores/achievement-store'
import { useBackupStore } from '../stores/backup-store'

export interface KamiBackupBundle {
    version: string
    timestamp: number
    stores: {
        app: any
        settings: any
        achievements: any
    }
    database: {
        models: any[]
        samples: any[]
    }
}

export class BackupService {
    static async createBundle(): Promise<KamiBackupBundle> {
        console.log("[Backup] Creating system bundle...")

        const models = await idbManager.getAllModels()
        // For samples, we might want to be selective, but let's try to get all for now
        // This could be large. In a real app we'd use a stream or zip.
        const samples: any[] = []
        for (const model of models) {
            const modelSamples = await idbManager.getSamplesByModel(model.id)
            samples.push(...modelSamples)
        }

        const bundle: KamiBackupBundle = {
            version: "1.0.0",
            timestamp: Date.now(),
            stores: {
                app: useAppStore.getState(),
                settings: useSettingsStore.getState(),
                achievements: useAchievementStore.getState(),
            },
            database: {
                models,
                samples
            }
        }

        return bundle
    }

    static async restoreFromBundle(bundle: KamiBackupBundle) {
        console.log("[Backup] Restoring from bundle...")

        // 1. Restore Database
        await idbManager.formatSystem() // Clear current
        for (const model of bundle.database.models) {
            await idbManager.saveModel(model)
        }
        for (const sample of bundle.database.samples) {
            await idbManager.saveSample(sample)
        }

        // 2. Restore Stores (using their native setters or direct set)
        // Note: For Zustand with persist, we usually want to use the setState but carefully.
        useAppStore.setState(bundle.stores.app)
        useSettingsStore.setState(bundle.stores.settings)
        useAchievementStore.setState(bundle.stores.achievements)

        console.log("[Backup] Restore complete. Reloading UI...")
        window.location.reload()
    }

    static async downloadToLocal() {
        const bundle = await this.createBundle()
        const blob = new Blob([JSON.stringify(bundle)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kamiai_backup_${new Date().toISOString().split('T')[0]}.kami`
        a.click()
        URL.revokeObjectURL(url)

        useBackupStore.getState().addBackupRecord({
            id: `local-${Date.now()}`,
            timestamp: Date.now(),
            provider: 'local',
            size: blob.size,
            filename: a.download
        })
    }

    // Mock syncing for now - can be expanded with real GDrive/GitHub API calls
    static async syncWithCloud(provider: 'github' | 'google') {
        const store = useBackupStore.getState()
        store.setSyncing(true)

        // Simulate network delay
        await new Promise(r => setTimeout(r, 2000))

        const bundle = await this.createBundle()
        console.log(`[Backup] Syncing bundle to ${provider}...`, bundle)

        store.addBackupRecord({
            id: `${provider}-${Date.now()}`,
            timestamp: Date.now(),
            provider: provider,
            size: JSON.stringify(bundle).length,
            filename: `cloud_sync_${provider}.kami`
        })

        store.setSyncing(false)
        return true
    }
}
