import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'kamiai-local-db'
const DB_VERSION = 1

export interface DBChatMessage {
    id: string
    text: string
    sender: 'user' | 'ai'
    timestamp: number
}

export interface DBSavedModel {
    id: string
    name: string
    type: 'vision' | 'audio' | 'pose'
    weights: any // TF.js model.save() format
    topology?: any
    classes: { id: string, name: string, color: string }[]
    createdAt: number
    updatedAt: number
}

export interface TrainingSample {
    id: string
    modelId: string
    classId: string
    data: Blob | string // Image URL or binary data
    timestamp: number
}

class IDBManager {
    private db: IDBPDatabase | null = null

    async getDB() {
        if (this.db) return this.db

        this.db = await openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Models Store
                if (!db.objectStoreNames.contains('models')) {
                    db.createObjectStore('models', { keyPath: 'id' })
                }

                // Samples Store
                if (!db.objectStoreNames.contains('samples')) {
                    const sampleStore = db.createObjectStore('samples', { keyPath: 'id' })
                    sampleStore.createIndex('modelId', 'modelId')
                    sampleStore.createIndex('classId', 'classId')
                }

                // Generic Settings / Key-Value
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings')
                }
            },
        })

        return this.db
    }

    // --- Model Methods ---
    async saveModel(model: DBSavedModel) {
        const db = await this.getDB()
        await db.put('models', model)
    }

    async getModel(id: string): Promise<DBSavedModel | undefined> {
        const db = await this.getDB()
        return db.get('models', id)
    }

    async getAllModels(): Promise<DBSavedModel[]> {
        const db = await this.getDB()
        return db.getAll('models')
    }

    async deleteModel(id: string) {
        const db = await this.getDB()
        await db.delete('models', id)
        // Cleanup samples related to this model
        const samples = await this.getSamplesByModel(id)
        for (const sample of samples) {
            await this.deleteSample(sample.id)
        }
    }

    // --- Sample Methods ---
    async saveSample(sample: TrainingSample) {
        const db = await this.getDB()
        await db.put('samples', sample)
    }

    async getSamplesByModel(modelId: string): Promise<TrainingSample[]> {
        const db = await this.getDB()
        return db.getAllFromIndex('samples', 'modelId', modelId)
    }

    async deleteSample(id: string) {
        const db = await this.getDB()
        await db.delete('samples', id)
    }

    // --- Settings / KV ---
    async setSetting(key: string, value: any) {
        const db = await this.getDB()
        await db.put('settings', value, key)
    }

    async getSetting(key: string): Promise<any> {
        const db = await this.getDB()
        return db.get('settings', key)
    }

    // Factory Reset
    async formatSystem() {
        const db = await this.getDB()
        const stores = db.objectStoreNames
        for (const store of stores) {
            await db.clear(store as any)
        }
    }
}

export const idbManager = new IDBManager()
