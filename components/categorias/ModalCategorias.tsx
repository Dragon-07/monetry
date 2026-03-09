'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Edit2, Check, AlertCircle } from 'lucide-react'

interface Categoria {
    id: string
    nombre: string
    tipo: 'gasto' | 'ingreso'
    orden: number
}

interface Props {
    tipo: 'gasto' | 'ingreso'
    open: boolean
    onClose: () => void
    onUpdate: () => void
}

export function ModalCategorias({ tipo, open, onClose, onUpdate }: Props) {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [nuevoNombre, setNuevoNombre] = useState('')
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const [editandoNombre, setEditandoNombre] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) {
            fetchCategorias()
        }
    }, [open, tipo])

    const fetchCategorias = async () => {
        setFetching(true)
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .eq('usuario_id', session.user.id)
            .eq('tipo', tipo)
            .order('orden', { ascending: true })

        if (error) {
            console.error('Error fetching categorias:', error)
        } else {
            setCategorias(data || [])
        }
        setFetching(false)
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nuevoNombre.trim()) return

        setLoading(true)
        setError('')
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const maxOrden = categorias.length > 0 ? Math.max(...categorias.map(c => c.orden)) : 0

        const { error } = await supabase
            .from('categorias')
            .insert({
                nombre: nuevoNombre.trim(),
                tipo,
                usuario_id: session.user.id,
                orden: maxOrden + 1
            })

        if (error) {
            setError('Error al añadir categoría')
        } else {
            setNuevoNombre('')
            fetchCategorias()
            onUpdate()
        }
        setLoading(false)
    }

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) return

        const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Error al eliminar: ' + error.message)
        } else {
            fetchCategorias()
            onUpdate()
        }
    }

    const handleUpdateNombre = async (id: string) => {
        if (!editandoNombre.trim()) return

        const { error } = await supabase
            .from('categorias')
            .update({ nombre: editandoNombre.trim() })
            .eq('id', id)

        if (error) {
            alert('Error al actualizar')
        } else {
            setEditandoId(null)
            fetchCategorias()
            onUpdate()
        }
    }

    const moveStep = async (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= categorias.length) return

        const newCategorias = [...categorias]
        const temp = newCategorias[index]
        newCategorias[index] = newCategorias[targetIndex]
        newCategorias[targetIndex] = temp

        // Actualizar orden en BD de forma optimista
        setCategorias(newCategorias)

        for (let i = 0; i < newCategorias.length; i++) {
            await supabase
                .from('categorias')
                .update({ orden: i })
                .eq('id', newCategorias[i].id)
        }

        onUpdate()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Gestionar Categorías
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            Categorías de {tipo === 'gasto' ? 'gastos' : 'ingresos'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Add Form */}
                    <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            placeholder="Nueva categoría..."
                            className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading || !nuevoNombre.trim()}
                            className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </button>
                    </form>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* List */}
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {fetching ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500 italic">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                Cargando...
                            </div>
                        ) : categorias.length === 0 ? (
                            <p className="text-center py-8 text-gray-500 italic">No hay categorías personalizadas</p>
                        ) : (
                            categorias.map((cat, index) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-emerald-500/50 transition-all group shadow-sm"
                                >
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => moveStep(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 hover:text-emerald-500 disabled:opacity-0 transition-all"
                                        >
                                            <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => moveStep(index, 'down')}
                                            disabled={index === categorias.length - 1}
                                            className="p-1 hover:text-emerald-500 disabled:opacity-0 transition-all"
                                        >
                                            <ArrowDown className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="flex-1">
                                        {editandoId === cat.id ? (
                                            <input
                                                autoFocus
                                                value={editandoNombre}
                                                onChange={(e) => setEditandoNombre(e.target.value)}
                                                onBlur={() => handleUpdateNombre(cat.id)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateNombre(cat.id)}
                                                className="w-full p-1 bg-gray-50 dark:bg-gray-700 border-b border-emerald-500 outline-none text-gray-900 dark:text-white"
                                            />
                                        ) : (
                                            <span className="text-gray-900 dark:text-white font-medium">{cat.nombre}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditandoId(cat.id)
                                                setEditandoNombre(cat.nombre)
                                            }}
                                            className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id, cat.nombre)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-center">
                    <button
                        onClick={onClose}
                        className="w-full p-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
    )
}
