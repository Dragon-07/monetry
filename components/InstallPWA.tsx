'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setIsVisible(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setDeferredPrompt(null)
            setIsVisible(false)
        }
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm animate-fade-in-up">
            <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                        <Download className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">Instalar Monetry</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Accede más rápido y sin conexión</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleInstallClick}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                        Instalar
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-white/20 rounded-lg text-gray-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
