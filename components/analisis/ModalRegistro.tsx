'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PlusCircle, Loader2, CheckCircle2, XCircle, X, Calendar } from 'lucide-react'

const CATEGORIAS_GASTOS = [
    'Trabajo', 'Programación', 'Transporte', 'Alimentos',
    'Entretenimiento', 'Educación', 'Otros gastos'
]

const CATEGORIAS_INGRESOS = [
    'Trabajo', 'Programación', 'ventas', 'Salario', 'Otros ingresos'
]

const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia']

interface Props {
    onSuccess: () => void
}

export function ModalRegistro({ onSuccess }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    // 'gasto' o 'ingreso' — mismos valores que usa la tabla transacciones
    const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
    const [monto, setMonto] = useState('')
    const [categoria, setCategoria] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [metodo_pago, setMetodoPago] = useState('Efectivo')
    const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id ?? null)
        })
    }, [])

    const categoriasActuales = tipo === 'gasto' ? CATEGORIAS_GASTOS : CATEGORIAS_INGRESOS

    const resetForm = () => {
        setMonto('')
        setCategoria('')
        setDescripcion('')
        setMetodoPago('Efectivo')
        setFecha(new Date().toISOString().split('T')[0])
        setError('')
        setSuccess(false)
    }

    const handleClose = () => {
        setOpen(false)
        resetForm()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            const montoNum = parseFloat(monto)
            if (!monto || montoNum <= 0) {
                throw new Error('El monto debe ser mayor a 0')
            }
            if (!categoria) {
                throw new Error('Debes seleccionar una categoría')
            }

            // Guardar el monto SIEMPRE POSITIVO — la tabla guarda positivo y usa 'tipo' para discriminar
            const fechaFinal = new Date(`${fecha}T12:00:00`).toISOString()

            const { error: insertError } = await supabase
                .from('transacciones')
                .insert({
                    tipo,                         // 'gasto' | 'ingreso'
                    monto: montoNum,              // POSITIVO siempre
                    categoria,
                    concepto: descripcion || `${tipo === 'gasto' ? 'Gasto' : 'Ingreso'} - ${categoria}`,
                    descripcion: descripcion || null,
                    metodo_pago,
                    fecha: fechaFinal,
                    usuario_id: userId,
                })

            if (insertError) throw insertError

            setSuccess(true)
            onSuccess()

            setTimeout(() => {
                setSuccess(false)
                handleClose()
            }, 1500)
        } catch (err: any) {
            setError(err.message || 'Error al registrar transacción')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Botón de apertura */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg transition-all text-sm font-medium shadow-md hover:shadow-lg"
            >
                <PlusCircle className="w-4 h-4" />
                Nueva Transacción
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
                >
                    {/* Modal */}
                    <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                Registrar Transacción
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Tipo */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setTipo('gasto'); setCategoria('') }}
                                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tipo === 'gasto'
                                        ? 'bg-red-500 text-white shadow-md ring-2 ring-red-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30'
                                        }`}
                                >
                                    💸 Gasto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setTipo('ingreso'); setCategoria('') }}
                                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tipo === 'ingreso'
                                        ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                        }`}
                                >
                                    💰 Ingreso
                                </button>
                            </div>

                            {/* Monto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Monto (COP) *
                                </label>
                                <input
                                    type="number"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    step="0.01"
                                    min="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Categoría *
                                </label>
                                <select
                                    value={categoria}
                                    onChange={(e) => setCategoria(e.target.value)}
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categoriasActuales.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Descripción (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Ej: Súper del fin de semana"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    <Calendar className="w-4 h-4 inline mr-1.5 align-middle" />
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Método de pago */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Método de Pago
                                </label>
                                <div className="flex gap-2">
                                    {METODOS_PAGO.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setMetodoPago(m)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${metodo_pago === m
                                                ? 'bg-teal-500 text-white border-teal-500'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-teal-400'
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mensajes */}
                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    ¡Transacción registrada exitosamente!
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm">
                                    <XCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${tipo === 'gasto'
                                        ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                                        }`}
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                    ) : (
                                        `Registrar ${tipo === 'gasto' ? 'Gasto' : 'Ingreso'}`
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
