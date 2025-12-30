"use client"

import * as React from "react"
import { useVisionStore } from "@/lib/stores/vision-store"
import { cn } from "@/lib/utils"
import { Brain, FolderOpen, Trash2, Plus, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ModelManager() {
    const [isOpen, setIsOpen] = React.useState(false)
    const { modelName: storeName, models, setModelName, saveModel, loadModel, deleteModel } = useVisionStore()
    const [localName, setLocalName] = React.useState(storeName)

    // Sync with store if storeName changes from outside (e.g. loadModel)
    React.useEffect(() => {
        setLocalName(storeName)
    }, [storeName])

    // Auto-save feedback
    const [justSaved, setJustSaved] = React.useState(false)

    const handleSave = () => {
        setModelName(localName) // Ensure store is up to date before saving
        saveModel()
        setJustSaved(true)
        setTimeout(() => setJustSaved(false), 2000)
    }

    return (
        <div className="relative z-50">
            {/* Trigger / Header */}
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur border border-border p-2 rounded-lg shadow-sm">
                <div className="flex-1">
                    <input
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        onBlur={() => setModelName(localName)}
                        className="bg-transparent border-b border-transparent focus:border-primary/50 text-sm font-semibold focus:ring-0 w-44 px-2 py-1 transition-all outline-none"
                        placeholder="Name your agent..."
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={justSaved}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-bold text-xs uppercase tracking-wider active:scale-95",
                        justSaved
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                            : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
                    )}
                    title="Build & Save AI Model"
                >
                    {justSaved ? (
                        <>
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            Packaging...
                        </>
                    ) : (
                        <>
                            <Brain className="w-3.5 h-3.5" />
                            Build Model
                        </>
                    )}
                </button>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "p-2 rounded-md transition-colors",
                        isOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    )}
                    title="Manage Models"
                >
                    <FolderOpen className="w-4 h-4" />
                </button>
            </div>

            {/* Dropdown / Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h4 className="font-semibold text-sm">Saved Models</h4>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                            {models.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <p>No saved models yet.</p>
                                    <p className="text-xs mt-1 opacity-70">Save your current progress!</p>
                                </div>
                            ) : (
                                models.map((model) => (
                                    <div key={model.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1 min-w-0" onClick={() => loadModel(model.id)}>
                                            <div className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors">
                                                {model.name}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(model.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deleteModel(model.id)
                                            }}
                                            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-2 border-t border-border bg-muted/30">
                            <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                <Plus className="w-3 h-3" />
                                Create New Agent
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
