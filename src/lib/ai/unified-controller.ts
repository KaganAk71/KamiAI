import * as tf from '@tensorflow/tfjs'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import * as mobilenet from '@tensorflow-models/mobilenet'
import { idbManager, DBSavedModel } from '@/lib/db/idb-manager'

export type AIModuleType = 'vision' | 'audio' | 'pose'

class UnifiedAIController {
    private classifier: knnClassifier.KNNClassifier | null = null
    private featureExtractor: any = null
    private activeModule: AIModuleType | null = null
    private isReady: boolean = false
    private error: string | null = null

    async init(module: AIModuleType) {
        if (this.activeModule === module && this.isReady) return

        console.log(`[AI] Initializing ${module} engine...`)
        this.activeModule = module
        this.isReady = false
        this.error = null

        await tf.ready()
        this.classifier = knnClassifier.create()

        try {
            if (module === 'vision') {
                this.featureExtractor = await mobilenet.load()
            }
            // Audio and Pose loaders will be added here
        } catch (err) {
            console.error(`[AI] Error loading ${module} model:`, err)
            this.error = "Failed to fetch AI model data. Please check your connection."
            return
        }

        this.isReady = true
        console.log(`[AI] ${module} engine ready.`)
    }

    getError() {
        return this.error
    }

    async addExample(imgElement: HTMLVideoElement | HTMLImageElement, classId: string) {
        if (!this.isReady || !this.classifier || !this.featureExtractor) return

        const img = tf.browser.fromPixels(imgElement)

        if (this.activeModule === 'vision') {
            const activation = (this.featureExtractor as mobilenet.MobileNet).infer(img, true)
            this.classifier.addExample(activation, classId)
        }

        img.dispose()
    }

    async predict(imgElement: HTMLVideoElement | HTMLImageElement) {
        if (!this.isReady || !this.classifier || !this.featureExtractor || this.classifier.getNumClasses() === 0) {
            return null
        }

        const img = tf.browser.fromPixels(imgElement)
        let prediction = null

        if (this.activeModule === 'vision') {
            const activation = (this.featureExtractor as mobilenet.MobileNet).infer(img, true)
            prediction = await this.classifier.predictClass(activation)
            // Activation is handled internally by classifier.predictClass but good to be aware
        }

        img.dispose()
        return prediction
    }

    private serializeDataset(dataset: Record<string, tf.Tensor2D>) {
        const serialized: Record<string, number[][]> = {}
        Object.keys(dataset).forEach((key) => {
            serialized[key] = dataset[key].arraySync()
        })
        return serialized
    }

    private deserializeDataset(serialized: Record<string, number[][]>) {
        const dataset: Record<string, tf.Tensor2D> = {}
        Object.keys(serialized).forEach((key) => {
            dataset[key] = tf.tensor2d(serialized[key])
        })
        return dataset
    }

    setClassifierDataset(serialized: any) {
        if (this.classifier && serialized) {
            const dataset = this.deserializeDataset(serialized)
            this.classifier.setClassifierDataset(dataset)
        }
    }

    // --- Persistence ---
    async saveToLocal(name: string, classes: { id: string; name: string; color: string }[]) {
        if (!this.classifier || !this.activeModule) return

        const dataset = this.classifier.getClassifierDataset()
        const weights = this.serializeDataset(dataset)

        const modelId = `model-${Date.now()}`
        const modelData: DBSavedModel = {
            id: modelId,
            name: name,
            type: this.activeModule,
            weights: weights,
            classes: classes,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        await idbManager.saveModel(modelData)
        return modelId
    }

    // --- Import / Export ---
    async exportModel() {
        // Logic for creating .kamiai zip
        console.log("[AI] Exporting model bundle...")
    }
}

export const aiController = new UnifiedAIController()
