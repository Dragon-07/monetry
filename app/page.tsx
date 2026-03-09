'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import { KPICard } from '@/components/KPICard'
import { DataViews } from '@/components/DataViews'
import { Calendar, TrendingUp, DollarSign } from 'lucide-react'

// Dynamic import for TrendChart to avoid SSR issues with Chart.js
const TrendChart = dynamic(() => import('@/components/TrendChart').then(mod => ({ default: mod.TrendChart })), {
  ssr: false,
  loading: () => <div className="text-center py-12 text-gray-600 dark:text-gray-400">Cargando gráfica...</div>
})

type Vista = 'diaria' | 'semanal' | 'mensual' | 'personalizada'

export default function HomePage() {
  const [vista, setVista] = useState<Vista>('mensual')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [kpis, setKpis] = useState({
    ingresos: 0,
    gastos: 0,
    balance: 0,
    transacciones: 0,
  })

  const [rangoFechas, setRangoFechas] = useState({ inicio: '', fin: '' })
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    procesarGastosRecurrentes() // Procesar gastos automáticos primero
    fetchKPIs()
  }, [vista, fechaInicio, fechaFin])

  const procesarGastosRecurrentes = async () => {
    try {
      const response = await fetch('/api/gastos-recurrentes/procesar', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.procesados > 0) {
        console.log(`✅ Procesados ${data.procesados} gastos recurrentes:`, data.gastos)
      }
    } catch (error) {
      console.error('Error al procesar gastos recurrentes:', error)
    }
  }

  const fetchKPIs = async () => {
    setLoading(true)

    let startDate: Date
    let endDate = new Date()

    // Calcular fecha de inicio y fin según vista
    switch (vista) {
      case 'diaria':
        startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'semanal':
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'mensual':
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'personalizada':
        if (!fechaInicio || !fechaFin) {
          setLoading(false)
          return
        }
        startDate = new Date(fechaInicio)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(fechaFin)
        endDate.setHours(23, 59, 59, 999)
        break
      default:
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
    }

    // Guardar rango de fechas para mostrar
    setRangoFechas({
      inicio: startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
      fin: endDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    })

    // Consultar transacciones en lugar de resumen_diario
    // Excluir plantillas de gastos recurrentes (prefijo RECURRENTE:)
    let query = supabase
      .from('transacciones')
      .select('*')
      .not('concepto', 'like', 'RECURRENTE:%')
      .gte('fecha', startDate.toISOString())

    if (vista === 'personalizada') {
      query = query.lte('fecha', endDate.toISOString())
    }

    const { data, error } = await query

    if (data) {
      // Calcular totales agrupando por tipo
      let totalIngresos = 0
      let totalGastos = 0

      data.forEach(row => {
        const monto = parseFloat(row.monto || 0)
        if (row.tipo === 'ingreso') {
          totalIngresos += monto
        } else if (row.tipo === 'gasto') {
          totalGastos += monto
        }
      })

      setKpis({
        ingresos: totalIngresos,
        gastos: totalGastos,
        balance: totalIngresos - totalGastos,
        transacciones: data.length,
      })
    }

    setLoading(false)
  }

  const aplicarFechasPersonalizadas = () => {
    if (fechaInicio && fechaFin) {
      setVista('personalizada')
      setShowDatePicker(false)
    }
  }

  const handleDataChanged = () => {
    fetchKPIs()
    setRefreshTrigger(prev => prev + 1)
  }

  const getVistaLabel = () => {
    switch (vista) {
      case 'diaria': return 'Hoy'
      case 'semanal': return 'Últimos 7 días'
      case 'mensual': return 'Últimos 30 días'
      case 'personalizada': return `${fechaInicio} - ${fechaFin}`
      default: return 'Últimos 30 días'
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-xl text-gray-900 dark:text-white">Cargando...</div>
    </div>
  )

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="py-4">
        <h1 className="text-xl font-black uppercase tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Vista general de tus finanzas <span className="text-gray-400 dark:text-gray-500 font-medium text-base">· {getVistaLabel()}</span>
        </h1>
        {rangoFechas.inicio && rangoFechas.fin && (
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center uppercase tracking-wide">
            <span className="mr-2">�</span> Del {rangoFechas.inicio} al {rangoFechas.fin}
          </p>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🗓️</span>
          <h2 className="font-semibold text-lg">Período de Análisis</h2>
        </div>
        <div className="flex space-x-2 bg-white/20 dark:bg-black/20 p-1 rounded-xl flex-wrap">
          <button
            onClick={() => setVista('diaria')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'diaria'
              ? 'glass-panel shadow-sm text-gray-900 dark:text-white'
              : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
              }`}
          >
            <span className="material-icons text-[16px] align-middle mr-1">today</span> Diaria
          </button>
          <button
            onClick={() => setVista('semanal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'semanal'
              ? 'glass-panel shadow-sm text-gray-900 dark:text-white'
              : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
              }`}
          >
            <span className="material-icons text-[16px] align-middle mr-1">view_week</span> Semanal
          </button>
          <button
            onClick={() => setVista('mensual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'mensual'
              ? 'glass-panel shadow-sm text-gray-900 dark:text-white'
              : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
              }`}
          >
            <span className="material-icons text-[16px] align-middle mr-1">calendar_month</span> Mensual
          </button>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'personalizada'
              ? 'glass-panel shadow-sm text-gray-900 dark:text-white'
              : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
              }`}
          >
            <span className="material-icons text-[16px] align-middle mr-1">tune</span> Personalizada
          </button>
        </div>
      </div>

      {showDatePicker && (
        <div className="glass-panel rounded-2xl p-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📅 Selecciona Periodo Personalizado
          </h4>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-3 bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full p-3 bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={aplicarFechasPersonalizadas}
              disabled={!fechaInicio || !fechaFin}
              className="px-6 py-3 glass-panel hover:bg-white/60 dark:hover:bg-white/10 transition-colors rounded-lg font-semibold disabled:opacity-50"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <KPICard title={`Ingresos (${getVistaLabel()})`} value={kpis.ingresos} icon="income" color="green" />
        <KPICard title={`Gastos (${getVistaLabel()})`} value={kpis.gastos} icon="expense" color="red" />
        <KPICard title="Balance Neto" value={kpis.balance} icon="balance" color={kpis.balance > 0 ? 'green' : 'red'} />
        <KPICard title="Transacciones" value={kpis.transacciones} icon="transactions" color="blue" />
      </div>

      <div className="glass-panel rounded-2xl p-6 min-h-[400px]">
        <div className="flex items-center space-x-2 mb-8">
          <span className="text-xl">📈</span>
          <h2 className="font-bold text-xl text-gray-800 dark:text-white">Tendencia · {getVistaLabel()}</h2>
        </div>
        <div className="w-full overflow-x-auto relative z-10">
          <TrendChart vista={vista} fechaInicio={fechaInicio} fechaFin={fechaFin} refreshTrigger={refreshTrigger} />
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="relative z-10">
          <DataViews
            vista={vista}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            hideControls={true}
            onDataChanged={handleDataChanged}
          />
        </div>
      </div>
    </main>
  )
}
