'use client'

import { useState, useMemo } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Calendar, AlignJustify, CalendarDays, Settings2, ChevronDown, ChevronUp } from 'lucide-react'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

interface Transaccion {
    id: string
    monto: number
    tipo: string
    categoria: string
    fecha: string
}

type RangoTiempo = 'Diaria' | 'Semanal' | 'Mensual' | 'Personalizada'

export function ComparativasCategorias({ transacciones }: { transacciones: Transaccion[] }) {
    const [rango, setRango] = useState<RangoTiempo>('Mensual')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)

    // Filtrar transacciones por fecha según el rango seleccionado
    const transaccionesFiltradas = useMemo(() => {
        const hoy = new Date()
        const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

        let inicio: Date
        let fin: Date = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999)

        if (rango === 'Diaria') {
            inicio = hoyInicio
        } else if (rango === 'Semanal') {
            inicio = new Date(hoyInicio)
            inicio.setDate(inicio.getDate() - 7)
        } else if (rango === 'Mensual') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
            fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999)
        } else {
            // Personalizada
            if (!fechaInicio || !fechaFin) return transacciones
            inicio = new Date(fechaInicio)
            inicio.setHours(0, 0, 0, 0)
            fin = new Date(fechaFin)
            fin.setHours(23, 59, 59, 999)
        }

        return transacciones.filter(t => {
            const fechaTx = new Date(t.fecha)
            return fechaTx >= inicio && fechaTx <= fin
        })
    }, [transacciones, rango, fechaInicio, fechaFin])

    // Calcular el texto legible del rango de fechas
    const rangoTexto = useMemo(() => {
        if (transaccionesFiltradas.length === 0 && rango !== 'Personalizada') return ''

        const hoy = new Date()
        let inicio: Date
        let fin: Date = hoy

        if (rango === 'Diaria') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
        } else if (rango === 'Semanal') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7)
        } else if (rango === 'Mensual') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
            fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
        } else {
            if (!fechaInicio || !fechaFin) return 'Selecciona un rango'
            inicio = new Date(fechaInicio)
            fin = new Date(fechaFin)
        }

        const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
        const fmtIn = inicio.toLocaleDateString('es-CO', opciones)
        const fmtFin = fin.toLocaleDateString('es-CO', opciones)

        return `Del ${fmtIn} al ${fmtFin}`
    }, [rango, fechaInicio, fechaFin, transaccionesFiltradas])


    // Calcular balances y data para Trabajo y Programación
    const { trabajo, programacion } = useMemo(() => {
        let ingTrabajo = 0
        let gasTrabajo = 0
        let ingProg = 0
        let gasProg = 0

        transaccionesFiltradas.forEach(t => {
            const monto = Math.abs(t.monto)
            // Normalizar categoría: sin acentos, sin mayúsculas, sin espacios extra
            const cat = (t.categoria || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim()

            if (cat === 'trabajo') {
                if (t.tipo === 'ingreso') ingTrabajo += monto
                else gasTrabajo += monto
            } else if (cat === 'programacion') {
                if (t.tipo === 'ingreso') ingProg += monto
                else gasProg += monto
            }
        })

        return {
            trabajo: { ingreso: ingTrabajo, gasto: gasTrabajo, balance: ingTrabajo - gasTrabajo },
            programacion: { ingreso: ingProg, gasto: gasProg, balance: ingProg - gasProg }
        }
    }, [transaccionesFiltradas])

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val)
    }

    const crearConfigGrafico = (ingreso: number, gasto: number) => {
        return {
            labels: ['Ingresos vs Gastos'],
            datasets: [
                {
                    label: 'Ingresos',
                    data: [ingreso],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)', // emerald-500
                    borderRadius: 4,
                },
                {
                    label: 'Gastos',
                    data: [gasto],
                    backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
                    borderRadius: 4,
                }
            ]
        }
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(156, 163, 175, 0.1)' },
                ticks: { color: 'rgb(156, 163, 175)' }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgb(156, 163, 175)' }
            }
        }
    }

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header y Toggle */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                    <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Comparativas</h2>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">
                        {rangoTexto}
                    </p>
                </div>

                <div className="bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl flex overflow-x-auto no-scrollbar gap-1">
                    {[
                        { id: 'Diaria' as RangoTiempo, icon: Calendar, label: 'Diaria' },
                        { id: 'Semanal' as RangoTiempo, icon: AlignJustify, label: 'Semanal' },
                        { id: 'Mensual' as RangoTiempo, icon: CalendarDays, label: 'Mensual' },
                        { id: 'Personalizada' as RangoTiempo, icon: Settings2, label: 'Personalizada' },
                    ].map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => {
                                if (id === 'Personalizada') {
                                    setShowDatePicker(!showDatePicker)
                                } else {
                                    setRango(id)
                                    setShowDatePicker(false)
                                }
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap justify-center flex-1 sm:flex-none flex-shrink-0 uppercase tracking-wide ${rango === id
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{label}</span>
                            {id === 'Personalizada' && (
                                showDatePicker ? <ChevronUp className="w-3 h-3 ml-0.5 opacity-70" /> : <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selector de fechas personalizado */}
            {showDatePicker && (
                <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha Inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha Fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (fechaInicio && fechaFin) {
                                    setRango('Personalizada')
                                    setShowDatePicker(false)
                                }
                            }}
                            disabled={!fechaInicio || !fechaFin}
                            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            )}

            {/* Balances */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                {/* Balance Trabajo */}
                <div className="bg-white/60 dark:bg-gray-800/60 border border-emerald-200 dark:border-emerald-800/40 p-5 rounded-2xl flex flex-col justify-center text-center shadow-md backdrop-blur-md transition-all hover:shadow-lg">
                    <span className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1.5 uppercase tracking-wide">Trabajo</span>
                    <span className={`text-2xl sm:text-3xl font-black ${trabajo.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(trabajo.balance)}
                    </span>
                    <div className="flex justify-center gap-3 mt-3 text-sm font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">↑ {formatCurrency(trabajo.ingreso)}</span>
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">↓ {formatCurrency(trabajo.gasto)}</span>
                    </div>
                </div>

                {/* Balance Programación */}
                <div className="bg-white/60 dark:bg-gray-800/60 border border-blue-200 dark:border-blue-800/40 p-5 rounded-2xl flex flex-col justify-center text-center shadow-md backdrop-blur-md transition-all hover:shadow-lg">
                    <span className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1.5 uppercase tracking-wide">Programación</span>
                    <span className={`text-2xl sm:text-3xl font-black ${programacion.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(programacion.balance)}
                    </span>
                    <div className="flex justify-center gap-3 mt-3 text-sm font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">↑ {formatCurrency(programacion.ingreso)}</span>
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">↓ {formatCurrency(programacion.gasto)}</span>
                    </div>
                </div>
            </div>

            {/* Gráficos de barras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 mt-2 min-h-[220px]">
                {/* Trabajo Chart */}
                <div className="relative w-full h-full flex flex-col">
                    <span className="text-sm font-black text-center text-gray-800 dark:text-gray-100 mb-3 border-b-2 border-emerald-500/30 pb-1">Trabajo</span>
                    <div className="flex-1 relative">
                        <Bar data={crearConfigGrafico(trabajo.ingreso, trabajo.gasto)} options={chartOptions as any} />
                    </div>
                </div>

                {/* Programación Chart */}
                <div className="relative w-full h-full flex flex-col">
                    <span className="text-sm font-black text-center text-gray-800 dark:text-gray-100 mb-3 border-b-2 border-blue-500/30 pb-1">Programación</span>
                    <div className="flex-1 relative">
                        <Bar data={crearConfigGrafico(programacion.ingreso, programacion.gasto)} options={chartOptions as any} />
                    </div>
                </div>
            </div>
        </div>
    )
}
