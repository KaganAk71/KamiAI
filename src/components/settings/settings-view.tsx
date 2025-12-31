"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User,
    Cpu,
    Bell,
    Shield,
    Globe,
    Database,
    Trash2,
    RefreshCcw,
    Save,
    ChevronRight,
    Sparkles,
    Zap,
    Monitor,
    Languages,
    Trophy,
    Sliders,
    HardDrive,
    Plus,
    ShieldCheck,
    Cloud
} from "lucide-react"
import { useAppStore } from "@/lib/stores/app-store"
import { useSettingsStore, AIBackend } from "@/lib/stores/settings-store"
import { useTranslation } from "@/lib/i18n/use-translation"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useAchievementStore } from "@/lib/stores/achievement-store"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { useBackupStore } from "@/lib/stores/backup-store"
import { BackupService } from "@/lib/services/backup-service"

type SettingsTab = "identity" | "ai" | "interface" | "achievements" | "cloud" | "system"

export function SettingsView() {
    const [activeTab, setActiveTab] = React.useState<SettingsTab>("identity")
    const t = useTranslation()

    const tabs = [
        { id: "identity", label: t.identity, icon: User },
        { id: "ai", label: t.aiCore, icon: Cpu },
        { id: "interface", label: "Interface", icon: Monitor },
        { id: "cloud", label: t.cloudBackup, icon: Globe },
        { id: "achievements", label: t.achievements, icon: Trophy },
        { id: "system", label: t.systemData, icon: Database },
    ]

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {t.systemSettings}
                    </h1>
                    <p className="text-muted-foreground text-sm">{t.configureAgent}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{t.premiumActive}</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
                {/* Sidebar Navigation */}
                <div className="col-span-12 lg:col-span-3 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as SettingsTab)}
                            className={cn(
                                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                    : "bg-card/50 hover:bg-card border border-white/5 hover:border-white/10 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === tab.id ? "scale-110" : "")} />
                            <span className="font-bold tracking-tight">{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="col-span-12 lg:col-span-9 bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                    <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                {activeTab === "identity" && <ProfileSettings />}
                                {activeTab === "ai" && <AISettingsPanel />}
                                {activeTab === "interface" && <InterfaceSettingsPanel />}
                                {activeTab === "cloud" && <BackupSyncSettingsPanel />}
                                {activeTab === "achievements" && <AchievementsPanel />}
                                {activeTab === "system" && <DataSettingsPanel />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground italic">
                            {t.syncNote}
                        </p>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all active:scale-95">
                            <Save className="w-4 h-4" />
                            {t.forceSync}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProfileSettings() {
    const { userProfile, completeOnboarding } = useAppStore()
    const [name, setName] = React.useState(userProfile?.name || "")
    const [role, setRole] = React.useState(userProfile?.role || "junior")

    const handleUpdate = () => {
        completeOnboarding({ name, role: role as any })
        if (role === 'senior') useAchievementStore.getState().unlock('senior_architect');
    }

    const t = useTranslation()

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {t.identityAccess}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">{t.operatorName}</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleUpdate}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:border-primary/50 outline-none transition-all font-bold"
                            placeholder="Your Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">{t.knowledgeTier}</label>
                        <select
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value as any)
                                completeOnboarding({ name, role: e.target.value as any })
                                if (e.target.value === 'senior') useAchievementStore.getState().unlock('senior_architect');
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:border-primary/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="junior">{t.juniorDev}</option>
                            <option value="senior">{t.seniorArch}</option>
                            <option value="opensource">{t.openSourceDev}</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="p-6 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-2xl">
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 text-primary/50" />
                        </div>
                    </div>
                    <button className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">Change</button>
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-black tracking-tight">{userProfile?.name}</h4>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest text-primary/70">{userProfile?.role} OPERATOR</p>
                    <div className="mt-3 flex gap-2">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">Lvl 12 Specialist</span>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold">Verified Agent</span>
                    </div>
                </div>
            </section>
        </div>
    )
}

function AISettingsPanel() {
    const { ai, updateAISettings } = useSettingsStore()
    const t = useTranslation()

    const backends: { id: AIBackend; label: string; icon: any }[] = [
        { id: "webgpu", label: "WebGPU (Extreme)", icon: Zap },
        { id: "wasm", label: "WebAssembly (Stable)", icon: Monitor },
        { id: "cpu", label: "CPU Fallback (Eco)", icon: Globe }
    ]

    return (
        <div className="space-y-10">
            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    {t.computeEngine}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {backends.map((b) => (
                        <button
                            key={b.id}
                            onClick={() => {
                                updateAISettings({ backend: b.id })
                                if (b.id === 'webgpu') useAchievementStore.getState().unlock('webgpu_master');
                            }}
                            className={cn(
                                "flex flex-col items-start p-5 rounded-2xl border transition-all duration-300 text-left gap-3",
                                ai.backend === b.id
                                    ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(246,201,68,0.05)]"
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                            )}
                        >
                            <b.icon className={cn("w-6 h-6", ai.backend === b.id ? "text-primary" : "text-muted-foreground")} />
                            <div>
                                <h4 className="font-bold text-sm tracking-tight">{b.label}</h4>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                                    {b.id === 'webgpu' ? 'Recommended' : b.id === 'wasm' ? 'Compatible' : 'Low Power'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{t.hyperparameters}</h3>
                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                        <RefreshCcw className="w-3 h-3" /> {t.restoreDefaults}
                    </button>
                </div>

                <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-black uppercase text-muted-foreground tracking-widest">
                            <span>Confidence Threshold</span>
                            <span className="text-primary font-mono">{Math.round(ai.confidenceThreshold * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={ai.confidenceThreshold}
                            onChange={(e) => updateAISettings({ confidenceThreshold: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                        />
                        <p className="text-[10px] text-muted-foreground italic">Determines how sure the agent must be before classifying an object.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Training Epochs</label>
                            <input
                                type="number"
                                value={ai.epochs}
                                onChange={(e) => updateAISettings({ epochs: parseInt(e.target.value) })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:border-primary/50 text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Learning Rate</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={ai.learningRate}
                                onChange={(e) => updateAISettings({ learningRate: parseFloat(e.target.value) })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:border-primary/50 text-sm font-bold"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function InterfaceSettingsPanel() {
    const { language, setLanguage, availableLanguages } = useAppStore()
    const { notifications, updateNotificationSettings } = useSettingsStore()
    const { theme, setTheme } = useTheme()
    const t = useTranslation()

    const toggles = [
        { id: "voiceFeedback", label: t.voiceInteractions, desc: "Ajan sesli olarak geri bildirimde bulunur.", icon: Globe },
        { id: "soundEffects", label: t.sfxAudio, desc: "Sistem olayları için retro ses efektleri.", icon: Bell },
        { id: "visualAlerts", label: t.headsupAlerts, desc: "Ekran üzerinde anlık bildirim panelleri.", icon: Zap },
    ]

    const themes = [
        { id: "light", label: t.lightMode, icon: Zap },
        { id: "dark", label: t.darkMode, icon: Monitor },
        { id: "system", label: t.systemSync, icon: RefreshCcw },
    ]

    return (
        <div className="space-y-10">
            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    {t.visualTheme}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setTheme(t.id)
                                if (t.id === 'dark') useAchievementStore.getState().unlock('dark_mode_lover');
                            }}
                            className={cn(
                                "flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300",
                                theme === t.id
                                    ? "bg-primary/10 border-primary/40 shadow-xl"
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                            )}
                        >
                            <t.icon className={cn("w-6 h-6", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                            <span className="font-bold text-sm tracking-tight">{t.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    {t.localization}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableLanguages.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => {
                                setLanguage(lang.id)
                                useAchievementStore.getState().unlock('language_learner')
                            }}
                            className={cn(
                                "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                                language === lang.id
                                    ? "bg-primary/10 border-primary/40 shadow-xl"
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs">
                                    {lang.id.toUpperCase()}
                                </div>
                                <span className="font-bold">{lang.label}</span>
                            </div>
                            {language === lang.id && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </button>
                    ))}

                    {/* Import XML Button */}
                    <div className="relative flex items-center gap-3 p-5 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                        <input
                            type="file"
                            accept=".xml"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    const reader = new FileReader()
                                    reader.onload = async (event) => {
                                        const content = event.target?.result as string
                                        await useAppStore.getState().importLocale(file.name, content)
                                        useNotificationStore.getState().pushNotification({
                                            title: "Locale Imported",
                                            message: `${file.name} has been added to available languages.`,
                                            type: "success"
                                        })
                                    }
                                    reader.readAsText(file)
                                }
                            }}
                        />
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-bold text-sm block">{t.importLocale}</span>
                            <span className="text-[10px] opacity-50 uppercase tracking-widest">{t.selectFile}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    {t.audioVisual}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {toggles.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => updateNotificationSettings({ [item.id]: !notifications[item.id as keyof typeof notifications] })}
                            className={cn(
                                "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                                notifications[item.id as keyof typeof notifications]
                                    ? "bg-primary/10 border-primary/40 shadow-xl"
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white/5 text-muted-foreground group-hover:text-primary transition-colors">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-sm tracking-tight">{item.label}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-1 max-w-[150px] leading-tight">{item.desc}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "w-10 h-5 rounded-full relative transition-colors",
                                notifications[item.id as keyof typeof notifications] ? "bg-primary" : "bg-white/10"
                            )}>
                                <div className={cn(
                                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                    notifications[item.id as keyof typeof notifications] ? "left-5.5" : "left-0.5"
                                )} />
                            </div>
                        </button>
                    ))}

                    {/* Notification Permission Request */}
                    <button
                        onClick={async () => {
                            const granted = await useNotificationStore.getState().requestPermission()
                            if (granted) {
                                useNotificationStore.getState().pushNotification({
                                    title: "Notifications Enabled",
                                    message: "You will now receive system notifications from KamiAI.",
                                    type: "success"
                                })
                            } else {
                                useNotificationStore.getState().pushNotification({
                                    title: "Permission Denied",
                                    message: "Please enable notifications in your browser settings.",
                                    type: "error"
                                })
                            }
                        }}
                        className="flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/5 hover:border-white/10 transition-all text-left group"
                    >
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm tracking-tight">System Permissions</h4>
                            <p className="text-[10px] text-muted-foreground mt-1">Enable desktop notifications for background agents.</p>
                        </div>
                    </button>
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary" />
                    {t.extremeCustom}
                </h3>
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-black uppercase text-muted-foreground tracking-widest font-mono">
                            <span>{t.themeColor}</span>
                            <button
                                onClick={() => useAppStore.getState().setPrimaryColor('#F6C944')}
                                className="text-[10px] text-primary/70 hover:text-primary hover:underline"
                            >
                                {t.resetTheme}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { color: '#F6C944', label: 'Gold' },
                                { color: '#3b82f6', label: 'Blue' },
                                { color: '#8b5cf6', label: 'Purple' },
                                { color: '#10b981', label: 'Green' },
                                { color: '#ef4444', label: 'Red' },
                                { color: '#ec4899', label: 'Pink' },
                            ].map((preset) => (
                                <button
                                    key={preset.color}
                                    title={preset.label}
                                    onClick={() => useAppStore.getState().setPrimaryColor(preset.color)}
                                    className="w-8 h-8 rounded-full border border-white/10 hover:scale-110 transition-transform shadow-lg relative"
                                    style={{ backgroundColor: preset.color }}
                                >
                                    {useAppStore.getState().primaryColor === preset.color && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            <div className="w-px h-8 bg-white/10 mx-1" />
                            <div className="relative group">
                                <input
                                    type="color"
                                    value={useAppStore.getState().primaryColor}
                                    onChange={(e) => useAppStore.getState().setPrimaryColor(e.target.value)}
                                    className="w-8 h-8 opacity-0 cursor-pointer absolute inset-0 z-10"
                                />
                                <div className="w-8 h-8 rounded-full bg-[conic-gradient(from_0deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)] border border-white/10 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus className="w-3 h-3 text-white mix-blend-difference" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-primary/10" />

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-black uppercase text-muted-foreground tracking-widest font-mono">
                            <span>UI Animation Scale</span>
                            <span className="text-primary italic">"Custom ROM Style"</span>
                        </div>
                        <div className="flex gap-2">
                            {[0.1, 0.5, 1, 1.5, 2].map((scale) => (
                                <button
                                    key={scale}
                                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 text-xs font-bold transition-all"
                                    onClick={() => {
                                        document.documentElement.style.setProperty('--animation-scale', scale.toString());
                                        if (scale === 0.1) useAchievementStore.getState().unlock('quick_reflex');
                                    }}
                                >
                                    {scale}x
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-black uppercase text-muted-foreground tracking-widest font-mono">
                            <span>Glassmorphism / Blur Intensity</span>
                        </div>
                        <input
                            type="range" min="0" max="40" step="1" defaultValue="8"
                            className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                            onChange={(e) => {
                                document.documentElement.style.setProperty('--blur-intensity', `${e.target.value}px`);
                                if (parseInt(e.target.value) >= 35) useAchievementStore.getState().unlock('blur_master');
                            }}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

function AchievementsPanel() {
    const t = useTranslation()
    const { achievements } = useAchievementStore()
    const { language } = useAppStore()

    const unlockedCount = achievements.filter(a => a.isUnlocked).length
    const totalCount = achievements.length

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 border border-white/10">
                <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Hall of Fame</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {unlockedCount} / {totalCount} Achievements Earned
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (confirm(t.resetAchievements + "?")) {
                                useAchievementStore.getState().resetAchievements()
                                useNotificationStore.getState().pushNotification({
                                    title: "Achievements Reset",
                                    message: "Your progress has been wiped clean.",
                                    type: "warning"
                                })
                            }
                        }}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-95"
                        title={t.resetAchievements}
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 shadow-2xl">
                        <Trophy className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((a) => {
                    const isLocked = !a.isUnlocked
                    const isSecret = a.isHidden && isLocked

                    return (
                        <div
                            key={a.id}
                            className={cn(
                                "p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden group",
                                a.isUnlocked
                                    ? "bg-primary/10 border-primary/30 shadow-lg"
                                    : "bg-white/5 border-white/5 grayscale opacity-60"
                            )}
                        >
                            <div className="flex gap-4 relative z-10">
                                <div className="text-3xl filter drop-shadow-lg group-hover:scale-125 transition-transform duration-500">
                                    {isSecret ? '❓' : a.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold tracking-tight text-sm truncate">
                                        {isSecret ? '???' : (language === 'tr' ? a.title.tr : a.title.en)}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                                        {isSecret ? 'This achievement is hidden. Keep exploring.' : (language === 'tr' ? a.description.tr : a.description.en)}
                                    </p>
                                </div>
                            </div>
                            {a.isUnlocked && (
                                <div className="absolute top-2 right-2">
                                    <Sparkles className="w-3 h-3 text-primary animate-ping" />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function DataSettingsPanel() {
    const { system, updateSystemSettings } = useSettingsStore()
    const { resetApp } = useAppStore()
    const [systemMetrics, setSystemMetrics] = React.useState<any>(null)
    const t = useTranslation()

    React.useEffect(() => {
        fetch('/api/system').then(res => res.json()).then(setSystemMetrics)
    }, [])

    return (
        <div className="space-y-10">
            <section className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Storage & Core
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm uppercase tracking-widest">Hardware Opt.</h4>
                            <button
                                onClick={() => updateSystemSettings({ hardwareAcceleration: !system.hardwareAcceleration })}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative p-1",
                                    system.hardwareAcceleration ? "bg-primary" : "bg-white/10"
                                )}
                            >
                                <motion.div
                                    animate={{ x: system.hardwareAcceleration ? 24 : 0 }}
                                    className="w-4 h-4 bg-white rounded-full"
                                />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Utilize GPU for drawing and interface transitions.</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm uppercase tracking-widest">Auto Model Save</h4>
                            <button
                                onClick={() => updateSystemSettings({ autoSaveModels: !system.autoSaveModels })}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative p-1",
                                    system.autoSaveModels ? "bg-primary" : "bg-white/10"
                                )}
                            >
                                <motion.div
                                    animate={{ x: system.autoSaveModels ? 24 : 0 }}
                                    className="w-4 h-4 bg-white rounded-full"
                                />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Continuously backup model weights during training.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    System Diagnostics
                </h3>

                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-muted-foreground uppercase">OS / ARCH</span>
                        <span className="text-foreground">Linux x86_64</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-muted-foreground uppercase">ENGINE</span>
                        <span className="text-foreground">KamiCore v2.0 (Turbopack)</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-muted-foreground uppercase">WEBGPU SUPPORT</span>
                        <span className="text-green-500 font-bold">ACTIVE / VULKAN</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-muted-foreground uppercase flex items-center gap-1">
                            <HardDrive className="w-3 h-3" /> STORAGE (MAIN)
                        </span>
                        <span className="text-foreground">{systemMetrics?.details?.usedDisk} GB / {systemMetrics?.details?.totalDisk} GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground uppercase">UPTIME</span>
                        <span className="text-primary font-bold">14:22:05</span>
                    </div>
                </div>
            </section>

            <section className="p-8 rounded-3xl bg-destructive/5 border border-destructive/20 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-destructive flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        {t.dangerZone}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Irreversible actions on local data stacks.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => {
                            if (confirm("Are you sure? This will wipe ALL model weights.")) {
                                // Wipe logic
                            }
                        }}
                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-destructive/10 hover:bg-destructive/20 transition-all border border-destructive/10 group"
                    >
                        <div className="text-left">
                            <h4 className="font-bold text-destructive uppercase tracking-wide text-sm">Clear Model Cache</h4>
                            <p className="text-[10px] text-muted-foreground mt-1">Delete all temporary files and weights cached in browser.</p>
                        </div>
                        <Trash2 className="w-5 h-5 text-destructive group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={() => {
                            if (confirm("SYSTEM FORMAT: All data, settings and models will be deleted. Reset now?")) {
                                resetApp()
                                useAchievementStore.getState().unlock('system_format')
                                window.location.reload()
                            }
                        }}
                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-destructive text-destructive-foreground hover:opacity-90 transition-all shadow-xl shadow-destructive/20 group"
                    >
                        <div className="text-left">
                            <h4 className="font-bold uppercase tracking-widest text-sm">{t.systemFormat}</h4>
                            <p className="text-[10px] opacity-70 mt-1 italic">Factory reset KamiAI environment.</p>
                        </div>
                        <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </section>
        </div>
    )
}

function BackupSyncSettingsPanel() {
    const t = useTranslation()
    const {
        connectedAccounts,
        connectAccount,
        disconnectAccount,
        backupHistory,
        autoBackupEnabled,
        setAutoBackup,
        isSyncing
    } = useBackupStore()

    const [showTokenInput, setShowTokenInput] = React.useState(false)
    const [token, setToken] = React.useState("")

    const handleConnect = (provider: 'github' | 'google') => {
        if (provider === 'github') {
            setShowTokenInput(true)
            return
        }
        // Mock connection for google
        connectAccount({
            provider,
            username: 'kami_user_google',
            email: `google@example.com`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=google`
        })
        useNotificationStore.getState().pushNotification({
            title: "Account Connected",
            message: `Google Drive has been successfully linked.`,
            type: "success"
        })
    }

    const handleGHConnect = () => {
        if (!token.startsWith('ghp_')) {
            useNotificationStore.getState().pushNotification({
                title: "Invalid Token",
                message: "Please enter a valid GitHub Personal Access Token.",
                type: "error"
            })
            return
        }
        connectAccount({
            provider: 'github',
            username: 'kami_oss_dev',
            email: `github@example.com`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=github`,
            accessToken: token
        })
        setShowTokenInput(false)
        useNotificationStore.getState().pushNotification({
            title: "GitHub Connected",
            message: "Authentication successful. You can now share projects.",
            type: "success"
        })
    }

    const handleBackup = async (provider: 'local' | 'github' | 'google') => {
        if (provider === 'local') {
            await BackupService.downloadToLocal()
            useNotificationStore.getState().pushNotification({
                title: "Backup Created",
                message: "System bundle downloaded to your device.",
                type: "success"
            })
        } else {
            const success = await BackupService.syncWithCloud(provider)
            if (success) {
                useNotificationStore.getState().pushNotification({
                    title: "Cloud Sync Complete",
                    message: `System synchronized with ${provider} successfully.`,
                    type: "success"
                })
            }
        }
    }

    const githubAccount = connectedAccounts.find(a => a.provider === 'github')
    const googleAccount = connectedAccounts.find(a => a.provider === 'google')

    return (
        <div className="space-y-10">
            {/* Cloud Connections */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    {t.cloudBackup}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* GitHub */}
                    <div className={cn(
                        "p-6 rounded-3xl border-2 transition-all group overflow-hidden relative",
                        githubAccount ? "border-primary/50 bg-primary/5" : "border-white/5 bg-white/5"
                    )}>
                        <AnimatePresence>
                            {showTokenInput && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute inset-0 bg-background/95 backdrop-blur-xl z-50 p-6 flex flex-col justify-center gap-4"
                                >
                                    <div className="space-y-1">
                                        <h5 className="font-black text-xs uppercase tracking-widest">Enter Access Token</h5>
                                        <p className="text-[10px] text-muted-foreground">Personal Access Token (classic) is required.</p>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="ghp_xxxxxxxxxxxx"
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 ring-primary outline-none"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowTokenInput(false)} className="flex-1 py-2 rounded-xl bg-white/5 text-[10px] font-bold uppercase transition-all hover:bg-white/10">Cancel</button>
                                        <button onClick={handleGHConnect} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase transition-all hover:scale-105 active:scale-95">Verify</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-black/50 text-white">
                                <RefreshCcw className={cn("w-6 h-6", githubAccount ? "animate-spin-slow" : "")} />
                            </div>
                            {githubAccount ? (
                                <button onClick={() => disconnectAccount('github')} className="text-[10px] font-black uppercase text-red-500 hover:underline">Disconnect</button>
                            ) : (
                                <button onClick={() => handleConnect('github')} className="px-4 py-2 bg-foreground text-background rounded-xl text-xs font-black uppercase">{t.connectGithub}</button>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-lg">GitHub Sync</h4>
                            <p className="text-sm text-muted-foreground">Save your models as private Gists or Repository backups.</p>
                        </div>
                        {githubAccount && (
                            <div className="mt-4 pt-4 border-t border-primary/10 flex items-center gap-3">
                                <img src={githubAccount.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                                <div>
                                    <p className="text-xs font-bold">{githubAccount.username}</p>
                                    <p className="text-[10px] opacity-50">{githubAccount.email}</p>
                                </div>
                                <button
                                    disabled={isSyncing}
                                    onClick={() => handleBackup('github')}
                                    className="ml-auto p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Google Drive */}
                    <div className={cn(
                        "p-6 rounded-3xl border-2 transition-all group overflow-hidden relative",
                        googleAccount ? "border-primary/50 bg-primary/5" : "border-white/5 bg-white/5"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                <Database className="w-6 h-6" />
                            </div>
                            {googleAccount ? (
                                <button onClick={() => disconnectAccount('google')} className="text-[10px] font-black uppercase text-red-500 hover:underline">Disconnect</button>
                            ) : (
                                <button onClick={() => handleConnect('google')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase">{t.connectGoogle}</button>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-lg">Google Drive</h4>
                            <p className="text-sm text-muted-foreground">Store large model weights and sample data in your drive.</p>
                        </div>
                        {googleAccount && (
                            <div className="mt-4 pt-4 border-t border-primary/10 flex items-center gap-3">
                                <img src={googleAccount.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                                <div>
                                    <p className="text-xs font-bold">{googleAccount.username}</p>
                                    <p className="text-[10px] opacity-50">{googleAccount.email}</p>
                                </div>
                                <button
                                    disabled={isSyncing}
                                    onClick={() => handleBackup('google')}
                                    className="ml-auto p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Manual Export/Import */}
            <section className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleBackup('local')}
                        className="flex items-center gap-4 p-6 rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-left group"
                    >
                        <div className="p-3 rounded-2xl bg-white/20 group-hover:rotate-12 transition-transform">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg">{t.exportToDevice}</h4>
                            <p className="text-sm opacity-80">Download .kami system bundle</p>
                        </div>
                    </button>

                    <div className="relative flex items-center gap-4 p-6 rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                        <input
                            type="file"
                            accept=".kami"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    const reader = new FileReader()
                                    reader.onload = async (event) => {
                                        try {
                                            const bundle = JSON.parse(event.target?.result as string)
                                            await BackupService.restoreFromBundle(bundle)
                                        } catch (err) {
                                            useNotificationStore.getState().pushNotification({
                                                title: "Restore Failed",
                                                message: "Invalid or corrupted backup file.",
                                                type: "error"
                                            })
                                        }
                                    }
                                    reader.readAsText(file)
                                }
                            }}
                        />
                        <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg">{t.importFromBackup}</h4>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] font-black">Supports .kami files</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Backup History */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5 text-primary" />
                    {t.backupHistory}
                </h3>
                <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                    {backupHistory.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Cloud className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-sm font-bold">No backups found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {backupHistory.map((record) => (
                                <div key={record.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase",
                                            record.provider === 'local' ? "bg-white/10" : record.provider === 'github' ? "bg-black" : "bg-blue-600"
                                        )}>
                                            {record.provider}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{record.filename}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(record.timestamp).toLocaleString()} • {(record.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <ChevronRight className="w-4 h-4 opacity-30" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/30 border border-white/5 mt-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm tracking-tight">{t.autoBackup}</h4>
                            <p className="text-[10px] text-muted-foreground">Perform daily background syncs to linked accounts.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setAutoBackup(!autoBackupEnabled)}
                        className={cn(
                            "w-12 h-6 rounded-full relative transition-colors",
                            autoBackupEnabled ? "bg-primary" : "bg-white/10"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                            autoBackupEnabled ? "left-7" : "left-1"
                        )} />
                    </button>
                </div>
            </section>
        </div>
    )
}

