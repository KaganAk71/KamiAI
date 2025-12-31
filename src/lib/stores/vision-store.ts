import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { idbManager, DBSavedModel } from '../db/idb-manager'

export const COLORS = [
    '#D4AF37', // Gold
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#a855f7', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#ec4899'  // Pink
]

export interface VisionClass {
    id: string
    name: string
    sampleCount: number
    color: string
}

export interface VisionState {
    modelName: string
    classes: VisionClass[]
    models: DBSavedModel[]
    isModelLoading: boolean
    isWebcamReady: boolean
    currentPrediction: { classId: string; confidence: number } | null
    currentAllConfidences: Record<string, number>
    isLive: boolean

    addClass: (name?: string) => void
    removeClass: (id: string) => void
    updateClassName: (id: string, name: string) => void
    updateClassColor: (id: string, color: string) => void
    addSample: (classId: string, image: HTMLImageElement | HTMLVideoElement) => void
    setPrediction: (prediction: { classId: string; confidence: number } | null) => void
    setAllConfidences: (confidences: Record<string, number>) => void
    setLive: (live: boolean) => void
    setModelLoading: (loading: boolean) => void
    setModelName: (name: string) => void
    refreshModels: () => Promise<void>
    saveModel: () => Promise<void>
    loadModel: (id: string) => Promise<void>
    deleteModel: (id: string) => Promise<void>
}

export const useVisionStore = create<VisionState>()(
    persist(
        (set, get) => ({
            modelName: 'Untitled Agent',
            classes: [
                { id: 'class_1', name: 'Class 1', sampleCount: 0, color: COLORS[0] },
                { id: 'class_2', name: 'Class 2', sampleCount: 0, color: COLORS[1] }
            ],
            models: [],
            isModelLoading: true,
            isWebcamReady: false,
            currentPrediction: null,
            currentAllConfidences: {},
            isLive: false,

            addClass: (name) => set((state) => ({
                classes: [
                    ...state.classes,
                    {
                        id: `class_${Date.now()}`,
                        name: name || `Class ${state.classes.length + 1}`,
                        sampleCount: 0,
                        color: COLORS[state.classes.length % COLORS.length]
                    }
                ]
            })),

            removeClass: (id) => set((state) => ({
                classes: state.classes.filter(c => c.id !== id)
            })),

            updateClassName: (id, name) => set((state) => ({
                classes: state.classes.map(c => c.id === id ? { ...c, name } : c)
            })),

            updateClassColor: (id, color) => set((state) => ({
                classes: state.classes.map(c => c.id === id ? { ...c, color } : c)
            })),

            addSample: (classId, image) => {
                set((state) => ({
                    classes: state.classes.map(c =>
                        c.id === classId ? { ...c, sampleCount: c.sampleCount + 1 } : c
                    )
                }))
            },

            setPrediction: (prediction) => set({ currentPrediction: prediction }),

            setAllConfidences: (confidences) => set({ currentAllConfidences: confidences }),

            setLive: (live) => set({ isLive: live }),

            setModelLoading: (isModelLoading) => set({ isModelLoading }),

            setModelName: (modelName) => set({ modelName }),

            refreshModels: async () => {
                const models = await idbManager.getAllModels()
                set({ models })
            },

            saveModel: async () => {
                const { modelName, classes } = get()
                const model: DBSavedModel = {
                    id: `model_${Date.now()}`,
                    name: modelName,
                    type: 'vision',
                    weights: null,
                    classes: classes.map(c => ({ id: c.id, name: c.name, color: c.color })),
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
                await idbManager.saveModel(model)
                const models = await idbManager.getAllModels()
                set({ models })
            },

            loadModel: async (id) => {
                const model = await idbManager.getModel(id)
                if (model) {
                    set({
                        modelName: model.name,
                        classes: model.classes.map(c => ({
                            ...c,
                            sampleCount: 0
                        }))
                    })
                }
            },

            deleteModel: async (id) => {
                await idbManager.deleteModel(id)
                const models = await idbManager.getAllModels()
                set({ models })
            }
        }),
        {
            name: 'kamiai-vision-storage',
            partialize: (state) => ({
                modelName: state.modelName,
                classes: state.classes
            })
        }
    )
)
