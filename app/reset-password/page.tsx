'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Escuchar el evento de recuperación de contraseña de Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event !== 'PASSWORD_RECOVERY') {
                // Podríamos redirigir si no estamos en modo recuperación
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 3000)
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
                        Restablecer Contraseña
                    </h1>
                    <p className="text-gray-400 text-center text-sm">
                        Ingresa tu nueva contraseña para acceder a tu cuenta
                    </p>
                </div>

                {success ? (
                    <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-6 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-emerald-400 font-bold mb-2 text-lg">Contraseña actualizada</h3>
                        <p className="text-gray-300 text-sm">
                            Tu contraseña ha sido cambiada con éxito. Serás redirigido al inicio de sesión en unos segundos...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-200 mb-2 uppercase tracking-wide">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    className="w-full p-4 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-200 mb-2 uppercase tracking-wide">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
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
                                    Actualizando...
                                </>
                            ) : (
                                'Cambiar Contraseña'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
