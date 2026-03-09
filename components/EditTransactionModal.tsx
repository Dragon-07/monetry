'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Check, Settings2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ModalCategorias } from './categorias/ModalCategorias'

const CATEGORIAS_GASTOS_DEFAULT = [
    'Trabajo', 'Programación', 'Transporte', 'Alimentos',
    'Entretenimiento', 'Educación', 'Otros gastos'
]

const CATEGORIAS_INGRESOS_DEFAULT = [
    'Trabajo', 'Programación', 'ventas', 'Salario', 'Otros ingresos'
]

interface Transaccion {
    id: string
    fecha: string
    tipo: 'gasto' | 'ingreso'
    categoria: string
    monto: number
    descripcion: string
    metodo_pago: string
}

interface EditTransactionModalProps {
    transaction: Transaccion
    onClose: () => void
    onSuccess: () => void
}

export function EditTransactionModal({ transaction, onClose, onSuccess }: EditTransactionModalProps) {
    const [loading, setLoading] = useState(false)
    const [errorLocal, setErrorLocal] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    const [categorias, setCategorias] = useState<{ id: string, nombre: string, tipo: string }[]>([])
    const [fetchingCategorias, setFetchingCategorias] = useState(false)
    const [openCategorias, setOpenCategorias] = useState(false)

    // Utilizar el formato adecuado para inputs de fecha-hora ("YYYY-MM-DDThh:mm")
    const formatDateForInput = (dateString: string) => {
        try {
            const d = new Date(dateString)
            // Ajuste básico para aislar tiempo local (sin considerar zonas horarias complejas)
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
            return d.toISOString().slice(0, 16)
        } catch {
            return dateString
        }
    }

    const [formData, setFormData] = useState({
        fecha: formatDateForInput(transaction.fecha),
        tipo: transaction.tipo,
        categoria: transaction.categoria,
        monto: transaction.monto.toString(),
        descripcion: transaction.descripcion || '',
        metodo_pago: transaction.metodo_pago || ''
    })

    const fetchCategorias = useCallback(async (uid: string, tipoForm: string) => {
        setFetchingCategorias(true)
        const { data, error } = await supabase
            .from('categorias')
            .select('id, nombre, tipo')
            .eq('usuario_id', uid)
            .eq('tipo', tipoForm)
            .order('orden', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
        } else if (data && data.length > 0) {
            setCategorias(data)
        } else {
            // Seeding
            const defaults = tipoForm === 'gasto' ? CATEGORIAS_GASTOS_DEFAULT : CATEGORIAS_INGRESOS_DEFAULT
            const toInsert = defaults.map((nombre, index) => ({
                nombre,
                tipo: tipoForm,
                usuario_id: uid,
                orden: index
            }))

            const { data: inserted, error: insertError } = await supabase
                .from('categorias')
                .insert(toInsert)
                .select()

            if (!insertError && inserted) {
                setCategorias(inserted)
            }
        }
        setFetchingCategorias(false)
    }, [])

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const uid = session?.user?.id ?? null
            setUserId(uid)
            if (uid) fetchCategorias(uid, formData.tipo)
        })
    }, [formData.tipo, fetchCategorias])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorLocal('')

        try {
            const payload = {
                ...formData,
                monto: parseFloat(formData.monto)
            }

            // Convertir la fecha al formato ISO correcto que espera Supabase
            if (payload.fecha) {
                payload.fecha = new Date(payload.fecha).toISOString()
            }

            const res = await fetch(`/api/transacciones/${transaction.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Error al actualizar la transacción')
            }

            onSuccess()
        } catch (err: any) {
            setErrorLocal(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop con efecto blur Liquid Glass */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal de Categorías */}
            <ModalCategorias
                tipo={formData.tipo as 'gasto' | 'ingreso'}
                open={openCategorias}
                onClose={() => setOpenCategorias(false)}
                onUpdate={() => userId && fetchCategorias(userId, formData.tipo)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-[#ffffff] dark:bg-[#111827] border border-gray-200 dark:border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] z-50">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
                        Editar Transacción
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {errorLocal && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800/50">
                            {errorLocal}
                        </div>
                    )}

                    <form id="edit-transaction-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Tipo */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={(e) => {
                                        handleChange(e)
                                        // Reset categoria when type changes
                                        setFormData(prev => ({ ...prev, categoria: '' }))
                                    }}
                                    required
                                    className="w-full p-3 bg-[#f8fafc] dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all"
                                >
                                    <option value="ingreso">Ingreso</option>
                                    <option value="gasto">Gasto</option>
                                </select>
                            </div>

                            {/* Monto */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-[#f8fafc] dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition-all"
                                />
                            </div>

                            {/* Fecha */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha y Hora</label>
                                <input
                                    type="datetime-local"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-[#f8fafc] dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition-all"
                                />
                            </div>

                            {/* Categoría */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenCategorias(true)}
                                        className="text-[10px] flex items-center gap-0.5 text-emerald-500 hover:text-emerald-600 font-semibold"
                                    >
                                        <Settings2 className="w-2.5 h-2.5" />
                                        Editar
                                    </button>
                                </div>
                                <div className="relative">
                                    <select
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleChange}
                                        required
                                        disabled={fetchingCategorias}
                                        className="w-full p-3 bg-[#f8fafc] dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition-all disabled:opacity-50"
                                    >
                                        {fetchingCategorias ? (
                                            <option>Cargando...</option>
                                        ) : (
                                            <>
                                                <option value="">Seleccionar...</option>
                                                {categorias.map((cat) => (
                                                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                    {fetchingCategorias && (
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Método de Pago */}
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Método de Pago</label>
                                <select
                                    name="metodo_pago"
                                    value={formData.metodo_pago}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-[#f8fafc] dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition-all"
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción (Opcional)</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full p-3 bg-[#f8fafc] dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="edit-transaction-form"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
