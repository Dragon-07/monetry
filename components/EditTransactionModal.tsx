'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'

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
                                    onChange={handleChange}
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
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                                <input
                                    type="text"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-[#f8fafc] dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition-all"
                                />
                            </div>

                            {/* Método de Pago */}
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Método de Pago</label>
                                <input
                                    type="text"
                                    name="metodo_pago"
                                    value={formData.metodo_pago}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-[#f8fafc] dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 transition-all"
                                />
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
