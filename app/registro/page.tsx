'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, XCircle, Settings2 } from 'lucide-react'
import { ModalCategorias } from '@/components/categorias/ModalCategorias'

const CATEGORIAS_GASTOS_DEFAULT = [
  'Trabajo', 'Programación', 'Transporte', 'Alimentos',
  'Entretenimiento', 'Educación', 'Otros gastos'
]

const CATEGORIAS_INGRESOS_DEFAULT = [
  'Trabajo', 'Programación', 'ventas', 'Salario', 'Otros ingresos'
]

const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia']

export default function RegistroPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [categorias, setCategorias] = useState<{ id: string, nombre: string, tipo: string }[]>([])
  const [fetchingCategorias, setFetchingCategorias] = useState(false)
  const [openCategorias, setOpenCategorias] = useState(false)

  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [metodo_pago, setMetodoPago] = useState('Efectivo')

  const fetchCategorias = useCallback(async (uid: string) => {
    setFetchingCategorias(true)
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, tipo')
      .eq('usuario_id', uid)
      .eq('tipo', tipo)
      .order('orden', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
    } else if (data && data.length > 0) {
      setCategorias(data)
    } else if (uid) {
      // Seeding: Si no hay categorías, insertar las de por defecto
      const defaults = tipo === 'gasto' ? CATEGORIAS_GASTOS_DEFAULT : CATEGORIAS_INGRESOS_DEFAULT
      const toInsert = defaults.map((nombre, index) => ({
        nombre,
        tipo,
        usuario_id: uid,
        orden: index
      }))

      // Usamos upsert con onConflict para evitar errores si otro componente ya las creó
      const { error: insertError } = await supabase
        .from('categorias')
        .upsert(toInsert, { onConflict: 'usuario_id, nombre, tipo' })

      // Después del upsert, volvemos a intentar el fetch para obtener los IDs reales
      const { data: finalData, error: finalError } = await supabase
        .from('categorias')
        .select('id, nombre, tipo')
        .eq('usuario_id', uid)
        .eq('tipo', tipo)
        .order('orden', { ascending: true })

      if (!finalError && finalData) {
        setCategorias(finalData)
      }
    }
    setFetchingCategorias(false)
  }, [tipo])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (uid) fetchCategorias(uid)
    })
  }, [fetchCategorias])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Validaciones
      if (!monto || parseFloat(monto) <= 0) {
        throw new Error('El monto debe ser mayor a 0')
      }
      if (!categoria) {
        throw new Error('Debe seleccionar una categoría')
      }

      // Insertar transacción en BD
      if (!userId) {
        throw new Error('Debes estar autenticado para registrar transacciones.')
      }

      const { error: insertError } = await supabase
        .from('transacciones')
        .insert({
          tipo,
          monto: parseFloat(monto),
          categoria,
          concepto: descripcion || `${tipo === 'gasto' ? 'Gasto' : 'Ingreso'} - ${categoria}`,
          descripcion: descripcion || null,
          metodo_pago,
          fecha: new Date().toISOString(),
          usuario_id: userId,
        })

      if (insertError) throw insertError

      setSuccess(true)

      // Limpiar formulario
      setMonto('')
      setCategoria('')
      setDescripcion('')

      // Reset success después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al registrar transacción')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-6">
        Registrar Transacción
      </h2>

      <ModalCategorias
        tipo={tipo}
        open={openCategorias}
        onClose={() => setOpenCategorias(false)}
        onUpdate={() => userId && fetchCategorias(userId)}
      />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        {/* Tipo de transacción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Transacción
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setTipo('gasto')
                setCategoria('')
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${tipo === 'gasto'
                ? 'bg-red-500 text-white ring-2 ring-red-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => {
                setTipo('ingreso')
                setCategoria('')
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${tipo === 'ingreso'
                ? 'bg-green-500 text-white ring-2 ring-green-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Ingreso
            </button>
          </div>
        </div>

        {/* Monto */}
        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monto (COP) *
          </label>
          <input
            type="number"
            id="monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            step="0.01"
            min="0"
            required
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
          />
        </div>

        {/* Categoría */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría *
            </label>
            <button
              type="button"
              onClick={() => setOpenCategorias(true)}
              className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-600 font-semibold"
            >
              <Settings2 className="w-3 h-3" />
              Editar categorías
            </button>
          </div>
          <div className="relative">
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              disabled={fetchingCategorias}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {fetchingCategorias ? (
                <option>Cargando categorías...</option>
              ) : (
                <>
                  <option value="">Seleccionar categoría...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
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

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            placeholder="Detalles adicionales..."
          />
        </div>

        {/* Método de pago */}
        <div>
          <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Método de Pago
          </label>
          <div className="flex gap-2">
            {METODOS_PAGO.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m)}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${metodo_pago === m
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>¡Transacción registrada exitosamente!</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>Registrar {tipo === 'gasto' ? 'Gasto' : 'Ingreso'}</>
          )}
        </button>
      </form>
    </main>
  )
}
