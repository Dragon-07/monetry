'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-sm">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 relative mb-4">
                        <Image
                            src="/logo.png"
                            alt="Monetry Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight text-center uppercase">
                        Recuperar Contraseña
                    </h1>
                    <p className="text-gray-400 text-center text-sm">
                        Te enviaremos un correo con las instrucciones para restablecer tu contraseña
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6">
                        <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-6 text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-emerald-400 font-bold mb-2 text-lg">¡Correo enviado!</h3>
                            <p className="text-gray-300 text-sm">
                                Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada (y la carpeta de spam).
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-200 mb-2 uppercase tracking-wide">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar correo de recuperación'
                            )}
                        </button>

                        <Link
                            href="/login"
                            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al inicio de sesión
                        </Link>
                    </form>
                )}
            </div>
        </div>
    )
}
