"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppStore, UserRole } from "@/lib/stores/app-store"
import { cn } from "@/lib/utils"
import { ShieldCheck, Cpu, GraduationCap, Camera, CheckCircle2, ChevronRight, ArrowRight, Languages, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/i18n/use-translation"

const HELLOS = [
    { text: "Hello", lang: "en" },
    { text: "Merhaba", lang: "tr" },
    { text: "Bonjour", lang: "fr" },
    { text: "Hola", lang: "es" },
    { text: "こんにちは", lang: "jp" },
    { text: "Guten Tag", lang: "de" },
    { text: "Ciao", lang: "it" },
]

export function OnboardingWizard() {
    const [step, setStep] = React.useState(0) // Start at 0 for Hello/Language
    const [name, setName] = React.useState("")
    const [role, setRole] = React.useState<UserRole>("junior")
    const { completeOnboarding, language, setLanguage, availableLanguages } = useAppStore()
    const t = useTranslation()
    const [helloIndex, setHelloIndex] = React.useState(0)

    React.useEffect(() => {
        if (step === 0) {
            const timer = setInterval(() => {
                setHelloIndex((prev) => (prev + 1) % HELLOS.length)
            }, 2000)
            return () => clearInterval(timer)
        }
    }, [step])

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    const handleComplete = () => {
        if (name.trim()) {
            completeOnboarding({ name, role })
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-3xl flex items-center justify-center p-6 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-card border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[3rem] overflow-hidden relative"
            >
                {/* Progress Bar (Hide on Step 0) */}
                {step > 0 && (
                    <div className="h-1 w-full bg-secondary/30 flex">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-full flex-1 transition-all duration-700",
                                    i <= step ? "bg-primary" : "bg-transparent"
                                )}
                            />
                        ))}
                    </div>
                )}

                <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-12 text-center"
                            >
                                <div className="h-32 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.h1
                                            key={HELLOS[helloIndex].text}
                                            initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                                            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                            exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                                            className="text-7xl font-black tracking-tighter"
                                        >
                                            {HELLOS[helloIndex].text}
                                        </motion.h1>
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">{t.localization}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {availableLanguages.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => setLanguage(lang.id)}
                                                className={cn(
                                                    "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                                                    language === lang.id
                                                        ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(246,201,68,0.1)]"
                                                        : "border-white/5 bg-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <span className="text-2xl font-bold">{lang.id.toUpperCase()}</span>
                                                <span className="font-bold text-sm">{lang.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={nextStep}
                                    className="group w-full max-w-sm mx-auto flex items-center justify-center gap-3 bg-foreground text-background py-5 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                                >
                                    {t.continue}
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-primary font-black tracking-widest text-[10px] uppercase bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20">
                                        <Sparkles className="w-3 h-3" />
                                        {t.welcome}
                                    </div>
                                    <h1 className="text-5xl font-black tracking-tighter leading-[0.9]">{t.onboardingWelcomeTitle}</h1>
                                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                                        {t.onboardingWelcomeDesc}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-5 p-6 rounded-[2rem] bg-secondary/30 border border-white/5">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg">{t.onboardingPrivacyTitle}</h3>
                                            <p className="text-sm text-muted-foreground font-medium">{t.onboardingPrivacyDesc}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={nextStep}
                                        className="group flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-3xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(246,201,68,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all"
                                    >
                                        {t.getStarted}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black tracking-tighter">{t.onboardingIdentityTitle}</h2>
                                    <p className="text-muted-foreground text-lg font-medium">{t.onboardingIdentityDesc}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-primary tracking-widest px-1">Your Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Alex"
                                            className="w-full bg-white/5 border-2 border-white/5 rounded-3xl px-8 py-5 placeholder:text-muted-foreground/30 focus:border-primary focus:bg-primary/5 outline-none transition-all font-bold text-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setRole("junior")}
                                            className={cn(
                                                "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 text-center group",
                                                role === "junior" ? "border-primary bg-primary/10 shadow-xl" : "border-white/5 bg-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-colors", role === "junior" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground group-hover:text-foreground")}>
                                                <GraduationCap className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl tracking-tight">Junior</h3>
                                                <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">Small steps, big impact</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setRole("senior")}
                                            className={cn(
                                                "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 text-center group",
                                                role === "senior" ? "border-primary bg-primary/10 shadow-xl" : "border-white/5 bg-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-colors", role === "senior" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground group-hover:text-foreground")}>
                                                <Cpu className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl tracking-tight">Senior</h3>
                                                <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">Full system access</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <button onClick={prevStep} className="text-muted-foreground font-black uppercase tracking-widest text-[10px] px-4 hover:text-foreground transition-colors">{t.back}</button>
                                    <button
                                        onClick={nextStep}
                                        disabled={!name}
                                        className="bg-primary text-primary-foreground px-12 py-5 rounded-[2rem] font-black text-lg shadow-[0_20px_40px_-5px_rgba(246,201,68,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {t.continue}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-3 text-center flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 relative">
                                        <Camera className="w-10 h-10 text-primary" />
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-4 border-card" />
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter">{t.systemReadinessTitle}</h2>
                                    <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto">
                                        {t.systemReadinessDesc}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 rounded-3xl bg-white/5 flex items-center justify-between border border-white/5">
                                        <span className="font-black tracking-tight text-lg">{t.webcamAccess}</span>
                                        <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl text-xs font-black uppercase tracking-widest border border-green-500/20">{t.online}</div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/5 flex items-center justify-between border border-white/5">
                                        <span className="font-black tracking-tight text-lg">{t.micAccess}</span>
                                        <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl text-xs font-black uppercase tracking-widest border border-green-500/20">{t.online}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <button onClick={prevStep} className="text-muted-foreground font-black uppercase tracking-widest text-[10px] px-4 hover:text-foreground transition-colors">{t.back}</button>
                                    <button
                                        onClick={nextStep}
                                        className="bg-primary text-primary-foreground px-12 py-5 rounded-[2rem] font-black text-lg shadow-[0_20px_40px_-5px_rgba(246,201,68,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all"
                                    >
                                        {t.continue}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-12 text-center"
                            >
                                <div className="space-y-6 flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                        className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-2xl"
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-background" />
                                    </motion.div>
                                    <h2 className="text-5xl font-black tracking-tighter leading-tight">{t.readyToCreate}, {name}!</h2>
                                    <p className="text-muted-foreground text-xl font-medium max-w-sm mx-auto leading-relaxed">
                                        {t.setupComplete}
                                    </p>
                                </div>

                                <div className="pt-4 px-8">
                                    <button
                                        onClick={handleComplete}
                                        className="w-full bg-foreground text-background py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-4 group"
                                    >
                                        {t.enterStudio}
                                        <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
