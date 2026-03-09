'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, XCircle, Plus, Trash2, Edit, Calendar, DollarSign, BadgeCheck } from 'lucide-react'

const CATEGORIAS_GASTOS = [
  'Trabajo', 'Programación', 'Transporte', 'Alimentos',
  'Entretenimiento', 'Educación', 'Otros gastos'
]

const CATEGORIAS_INGRESOS = [
  'Trabajo', 'Programación', 'ventas', 'Salario', 'Otros ingresos'
]

const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia']

interface GastoRecurrente {
  id: string
  nombre: string
  dia_cobro: number
  monto: number
  activo: boolean
  categoria: string
  metodo_pago: string
  cuenta: string | null
  tipo: 'gasto' | 'ingreso'
  ultima_ejecucion: string | null
}

export default function GastosRecurrentesPage() {
  const [gastos, setGastos] = useState<GastoRecurrente[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionSuccessId, setActionSuccessId] = useState<string | null>(null)

  // Form state
  const [nombre, setNombre] = useState('')
  const [dia_cobro, setDiaCobro] = useState('')
  const [monto, setMonto] = useState('')
  const [activo, setActivo] = useState(true)
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [categoria, setCategoria] = useState('Suscripciones')
  const [metodo_pago, setMetodoPago] = useState('Tarjeta')
  const [cuenta, setCuenta] = useState('')

  // Update category when type changes if current category isn't in new list
  useEffect(() => {
    if (tipo === 'gasto' && !CATEGORIAS_GASTOS.includes(categoria)) {
      setCategoria('Suscripciones')
    } else if (tipo === 'ingreso' && !CATEGORIAS_INGRESOS.includes(categoria)) {
      setCategoria('Salario')
    }
  }, [tipo, categoria])

  useEffect(() => {
    fetchGastos()
  }, [])

  const fetchGastos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/gastos-recurrentes?t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()
      setGastos(data.data || [])
    } catch (err: any) {
      setError('Error al cargar gastos recurrentes')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNombre('')
    setDiaCobro('')
    setMonto('')
    setActivo(true)
    setTipo('gasto')
    setCategoria('Suscripciones')
    setMetodoPago('Tarjeta')
    setCuenta('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (!nombre || !dia_cobro || !monto) {
        throw new Error('Completa todos los campos requeridos')
      }

      const diaNum = parseInt(dia_cobro)
      if (diaNum < 1 || diaNum > 31) {
        throw new Error('El día de cobro debe estar entre 1 y 31')
      }

      const payload = {
        nombre,
        dia_cobro: diaNum,
        monto: parseFloat(monto),
        activo,
        tipo,
        categoria,
        metodo_pago,
        cuenta: cuenta || null,
      }

      let response
      if (editingId) {
        // Actualizar
        response = await fetch('/api/gastos-recurrentes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId }),
        })
      } else {
        // Crear
        response = await fetch('/api/gastos-recurrentes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSuccess(editingId ? 'Gasto actualizado exitosamente' : 'Gasto creado exitosamente')
      resetForm()
      fetchGastos()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al guardar gasto')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (gasto: GastoRecurrente) => {
    setNombre(gasto.nombre)
    setDiaCobro(gasto.dia_cobro.toString())
    setMonto(gasto.monto.toString())
    setActivo(gasto.activo)
    setTipo(gasto.tipo)
    setCategoria(gasto.categoria)
    setMetodoPago(gasto.metodo_pago)
    setCuenta(gasto.cuenta || '')
    setEditingId(gasto.id)
    setShowForm(true)
  }

  const handlePagar = async (gasto: GastoRecurrente) => {
    const accion = gasto.tipo === 'ingreso' ? 'cobro' : 'pago'
    const accionConfirm = gasto.tipo === 'ingreso' ? 'ingreso' : 'gasto'

    // El popup nativo de confirmación ya no es necesario aquí
    // puesto que la UI ahora confirma antes de llamar a esta función.
    setProcessingId(gasto.id)

    try {
      const response = await fetch('/api/gastos-recurrentes/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gasto.id }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSuccess(`✅ ${gasto.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} de "${gasto.nombre}" registrado en el sistema`)
      setActionSuccessId(gasto.id)
      setTimeout(() => {
        setSuccess('')
        setActionSuccessId(null)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error al registrar el pago')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    // La UI ya se encarga de la confirmación antes de llamar a esta función,
    // así que removemos el confirm() nativo.
    setProcessingId(id)

    try {
      const response = await fetch(`/api/gastos-recurrentes?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setSuccess('Registro eliminado exitosamente')
      setActionSuccessId(id)
      setTimeout(() => {
        setSuccess('')
        setActionSuccessId(null)
        fetchGastos()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Error al eliminar')
    } finally {
      setProcessingId(null)
    }
  }

  const calcularTotalGastos = () => {
    return gastos
      .filter(g => g.activo && g.tipo !== 'ingreso')
      .reduce((sum, g) => sum + parseFloat(g.monto.toString()), 0)
  }

  const calcularTotalIngresos = () => {
    return gastos
      .filter(g => g.activo && g.tipo === 'ingreso')
      .reduce((sum, g) => sum + parseFloat(g.monto.toString()), 0)
  }

  const calcularBalance = () => {
    return calcularTotalIngresos() - calcularTotalGastos()
  }

  const renderAcciones = (gasto: GastoRecurrente) => (
    <div className="flex items-center justify-end gap-3 min-h-[36px]">
      {actionSuccessId === gasto.id ? (
        <span className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <CheckCircle2 className="w-5 h-5" />
          ¡Hecho!
        </span>
      ) : processingId === gasto.id ? (
        <span className="flex items-center gap-2 px-3 py-1.5 text-gray-500 font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          Procesando...
        </span>
      ) : confirmDeleteId === gasto.id ? (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
          <button onClick={() => handleDelete(gasto.id)} className="px-3 py-1.5 bg-red-500 text-white font-bold rounded-lg text-sm hover:bg-red-600 transition-colors shadow-sm">Sí, borrar</button>
          <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm">Cancelar</button>
        </div>
      ) : confirmPayId === gasto.id ? (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
          <button onClick={() => { handlePagar(gasto); setConfirmPayId(null); }} className="px-3 py-1.5 bg-indigo-500 text-white font-bold rounded-lg text-sm hover:bg-indigo-600 transition-colors shadow-sm">Sí, {gasto.tipo === 'ingreso' ? 'cobrar' : 'pagar'}</button>
          <button onClick={() => setConfirmPayId(null)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm">Cancelar</button>
        </div>
      ) : (
        <>
          {/* Pagado */}
          <button
            onClick={() => { setConfirmPayId(gasto.id); setConfirmDeleteId(null); }}
            title={`Registrar ${gasto.tipo === 'ingreso' ? 'cobro' : 'pago'} de hoy`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 font-semibold text-xs transition-colors shadow-sm"
          >
            <BadgeCheck className="w-4 h-4" />
            {gasto.tipo === 'ingreso' ? 'Cobrado' : 'Pagado'}
          </button>
          {/* Editar */}
          <button
            onClick={() => { handleEdit(gasto); setConfirmPayId(null); setConfirmDeleteId(null); }}
            title="Editar"
            className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
          {/* Eliminar */}
          <button
            onClick={() => { setConfirmDeleteId(gasto.id); setConfirmPayId(null); }}
            title="Eliminar"
            className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-blue-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
          Transacciones Recurrentes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Administra tus suscripciones, cobros y pagos automáticos
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Balance Mensual</span>
            <DollarSign className={`w-5 h-5 ${calcularBalance() >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <div className={`text-2xl font-bold ${calcularBalance() >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            ${Math.abs(calcularBalance()).toFixed(2)}
          </div>
          <div className="flex gap-4 mt-2">
            <p className="text-xs text-green-600 dark:text-green-400">↑ ${calcularTotalIngresos().toFixed(2)}</p>
            <p className="text-xs text-red-600 dark:text-red-400">↓ ${calcularTotalGastos().toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Registros Activos</span>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {gastos.filter(g => g.activo).length}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {gastos.filter(g => g.activo && g.tipo === 'ingreso').length} ingresos, {gastos.filter(g => g.activo && g.tipo !== 'ingreso').length} gastos
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Próximo Cobro</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            Día {Math.min(...gastos.filter(g => g.activo && g.dia_cobro >= new Date().getDate()).map(g => g.dia_cobro), 31)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Este mes</p>
        </div>
      </div>

      {/* Botón añadir */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancelar' : 'Añadir Registro Recurrente'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingId ? 'Editar Registro Recurrente' : 'Nuevo Registro Recurrente'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Tipo de transacción toggles */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setTipo('gasto')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${tipo === 'gasto'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setTipo('ingreso')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${tipo === 'ingreso'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                Ingreso
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Netflix, Spotify"
                  required
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Día de Cobro (1-31) *
                </label>
                <input
                  type="number"
                  value={dia_cobro}
                  onChange={(e) => setDiaCobro(e.target.value)}
                  min="1"
                  max="31"
                  required
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto (MXN) *
                </label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {tipo === 'gasto'
                    ? CATEGORIAS_GASTOS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                    : CATEGORIAS_INGRESOS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuenta (opcional)
                </label>
                <input
                  type="text"
                  value={cuenta}
                  onChange={(e) => setCuenta(e.target.value)}
                  placeholder="Ej: Nubank, BBVA"
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="activo"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-5 h-5 text-emerald-500 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Activo (se cobrará automáticamente)
              </label>
            </div>

            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>{editingId ? 'Actualizar' : 'Crear'} Registro</>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {/* Gastos Recurrentes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-red-100 dark:border-red-900/20">
          <div className="bg-red-50 dark:bg-red-900/10 px-6 py-3 border-b border-red-100 dark:border-red-900/20">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Gastos Recurrentes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Día Cobro</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cuenta</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {gastos.filter(g => g.tipo !== 'ingreso').length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                      No hay gastos recurrentes registrados.
                    </td>
                  </tr>
                ) : (
                  gastos.filter(g => g.tipo !== 'ingreso').map((gasto) => (
                    <tr key={gasto.id} className={`${gasto.activo ? '' : 'opacity-50'} hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{gasto.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Día {gasto.dia_cobro}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400">-${parseFloat(gasto.monto.toString()).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{gasto.categoria}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${gasto.activo ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'}`}>
                          {gasto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{gasto.cuenta || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {renderAcciones(gasto)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ingresos Recurrentes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-emerald-100 dark:border-emerald-900/20">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 px-6 py-3 border-b border-emerald-100 dark:border-emerald-900/20">
            <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ingresos Recurrentes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Día Cobro</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cuenta</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {gastos.filter(g => g.tipo === 'ingreso').length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                      No hay ingresos recurrentes registrados.
                    </td>
                  </tr>
                ) : (
                  gastos.filter(g => g.tipo === 'ingreso').map((gasto) => (
                    <tr key={gasto.id} className={`${gasto.activo ? '' : 'opacity-50'} hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{gasto.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Día {gasto.dia_cobro}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">+${parseFloat(gasto.monto.toString()).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{gasto.categoria}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${gasto.activo ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'}`}>
                          {gasto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{gasto.cuenta || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {renderAcciones(gasto)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
