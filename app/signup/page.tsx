'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

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

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { nombre: nombre || email.split('@')[0] },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            if (error.message.includes('already registered')) {
                setError('Este correo ya tiene una cuenta. Inicia sesión.')
            } else {
                setError(error.message)
            }
            setLoading(false)
            return
        }

        // Si hay sesión activa, ir al dashboard directamente
        if (data.session) {
            router.push('/')
            router.refresh()
            return
        }

        // Si Supabase requiere confirmar email
        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
                <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">¡Cuenta creada!</h2>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        Revisa tu correo <span className="text-emerald-400 font-medium">{email}</span> y haz clic en el enlace de confirmación para activar tu cuenta.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all font-semibold text-center"
                    >
                        Ir al Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-sm">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/50">
                        <span className="text-2xl">🏛️</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                        Crear Cuenta
                    </h1>
                    <p className="text-gray-400 text-center text-sm sm:text-base">
                        Tu espacio financiero personal
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                            Nombre (opcional)
                        </label>
                        <input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Tu nombre"
                            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Correo electrónico *
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            required
                            autoFocus
                            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Contraseña * <span className="text-gray-500 font-normal">(mínimo 6 caracteres)</span>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Crea tu contraseña"
                                required
                                className="w-full p-4 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                            Confirmar contraseña *
                        </label>
                        <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite tu contraseña"
                            required
                            className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-lg p-3">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creando cuenta...
                            </>
                        ) : (
                            'Crear mi cuenta'
                        )}
                    </button>
                </form>

                {/* Enlace a login */}
                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                            Iniciar sesión
                        </Link>
                    </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                    <p className="text-gray-500 text-xs text-center">Sistema protegido © 2025</p>
                </div>
            </div>
        </div>
    )
}
