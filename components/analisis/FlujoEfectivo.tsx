'use client'

import { useMemo } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
)

interface Transaccion {
    id: string
    monto: number
    tipo: string
    fecha: string
    concepto?: string
}

const fmt = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

const fmtK = (v: number) => {
    const abs = Math.abs(v)
    if (abs >= 1000) return `$${(v / 1000).toFixed(0)}k`
    return `$${v.toFixed(0)}`
}

export function FlujoEfectivo({ transacciones }: { transacciones: Transaccion[] }) {
    const mesDatos = useMemo(() => {
        // Filtrar seguridad: excluir RECURRENTE: y PRESUPUESTO:
        const filtradas = transacciones.filter(t => {
            const concepto = (t.concepto ?? '').toUpperCase()
            return !concepto.startsWith('RECURRENTE:') && !concepto.startsWith('PRESUPUESTO:')
        })

        const agrupado = filtradas.reduce((acc, t) => {
            const date = new Date(t.fecha)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const label = date.toLocaleString('es-CO', { month: 'short', year: 'numeric' })

            if (!acc[key]) acc[key] = { label, ingresos: 0, gastos: 0, ms: date.getTime() }

            if (t.tipo === 'ingreso') acc[key].ingresos += Math.abs(t.monto)
            else if (t.tipo === 'gasto') acc[key].gastos += Math.abs(t.monto)

            return acc
        }, {} as Record<string, { label: string; ingresos: number; gastos: number; ms: number }>)

        return Object.entries(agrupado)
            .map(([, d]) => ({ ...d, ahorro: d.ingresos - d.gastos }))
            .sort((a, b) => a.ms - b.ms)
            .slice(-6) // últimos 6 meses
    }, [transacciones])

    // --- KPIs ---
    const kpis = useMemo(() => {
        if (mesDatos.length === 0) return null
        const mejorMes = mesDatos.reduce((best, m) => (m.ahorro > best.ahorro ? m : best), mesDatos[0])
        const promedio = mesDatos.reduce((s, m) => s + m.ahorro, 0) / mesDatos.length
        const deficit = mesDatos.filter(m => m.ahorro < 0).length
        return { mejorMes, promedio, deficit }
    }, [mesDatos])

    // --- Chart data ---
    const chartData = useMemo(() => ({
        labels: mesDatos.map(d => d.label),
        datasets: [
            {
                type: 'bar' as const,
                label: 'Ingresos',
                data: mesDatos.map(d => d.ingresos),
                backgroundColor: 'rgba(16, 185, 129, 0.80)',
                borderRadius: 5,
                order: 2,
            },
            {
                type: 'bar' as const,
                label: 'Gastos',
                data: mesDatos.map(d => d.gastos),
                backgroundColor: 'rgba(239, 68, 68, 0.80)',
                borderRadius: 5,
                order: 2,
            },
            {
                type: 'line' as const,
                label: 'Ahorro Neto',
                data: mesDatos.map(d => d.ahorro),
                borderColor: 'rgba(139, 92, 246, 1)',   // violet-500
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                borderWidth: 2.5,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: mesDatos.map(d =>
                    d.ahorro >= 0 ? 'rgba(16,185,129,1)' : 'rgba(239,68,68,1)'
                ),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.4,
                fill: false,
                yAxisID: 'y',
                order: 1,
            },
        ],
    }), [mesDatos])

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgb(156,163,175)',
                    font: { family: "'Inter', sans-serif", size: 12 },
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.95)',
                titleColor: '#e2e8f0',
                bodyColor: '#cbd5e1',
                padding: 14,
                cornerRadius: 10,
                borderColor: 'rgba(139,92,246,0.3)',
                borderWidth: 1,
                callbacks: {
                    label: (ctx: any) => {
                        const label = ctx.dataset.label ?? ''
                        return ` ${label}: ${fmt(ctx.parsed.y)}`
                    },
                    afterBody: (items: any[]) => {
                        const idx = items[0]?.dataIndex
                        if (idx === undefined || !mesDatos[idx]) return []
                        const { ingresos, gastos, ahorro } = mesDatos[idx]
                        if (items.length < 3) return [] // already shown via datasets
                        return [`────────────`, ` Ahorro: ${fmt(ahorro)}`]
                    },
                },
            },
        },
        scales: {
            y: {
                grid: { color: 'rgba(156,163,175,0.08)' },
                ticks: {
                    color: 'rgb(156,163,175)',
                    callback: (v: any) => fmtK(Number(v)),
                },
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgb(156,163,175)' },
            },
        },
    }), [mesDatos])

    if (mesDatos.length === 0) {
        return (
            <>
                <div className="mb-4">
                    <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Flujo de Efectivo</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Relación directa entre ingresos y gastos por mes. Analiza tu capacidad de ahorro.
                    </p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-3">
                    <svg className="w-14 h-14 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-400 dark:text-gray-500 font-medium">Sin datos suficientes</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">Registra al menos 1 mes de transacciones para ver el análisis.</p>
                </div>
            </>
        )
    }

    return (
        <>
            {/* Encabezado */}
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Flujo de Efectivo</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Relación directa entre ingresos y gastos por mes. Analiza tu capacidad de ahorro.
                </p>
            </div>

            {/* KPIs */}
            {kpis && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {/* Mejor mes */}
                    <div className="rounded-xl p-3 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                        <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            🏆 Mejor mes de ahorro
                        </p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{kpis.mejorMes.label}</p>
                        <p className={`text-xl font-black ${kpis.mejorMes.ahorro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {fmt(kpis.mejorMes.ahorro)}
                        </p>
                    </div>

                    {/* Promedio */}
                    <div className="rounded-xl p-3 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                        <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            📊 Promedio mensual
                        </p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ahorro neto</p>
                        <p className={`text-xl font-black ${kpis.promedio >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {fmt(kpis.promedio)}
                        </p>
                    </div>

                    {/* Meses en déficit */}
                    <div className="rounded-xl p-3 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                        <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            📉 Meses en déficit
                        </p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Últimos 6 meses</p>
                        <p className={`text-xl font-black ${kpis.deficit > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {kpis.deficit} {kpis.deficit === 1 ? 'mes' : 'meses'}
                        </p>
                    </div>
                </div>
            )}

            {/* Gráfico */}
            <div className="relative min-h-[280px] w-full">
                <Chart type="bar" data={chartData} options={options} />
            </div>

            {/* Tabla resumen */}
            <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200/50 dark:border-white/10">
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mes</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ingresos</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gastos</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ahorro</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tasa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mesDatos.map((m, i) => {
                            const tasa = m.ingresos > 0 ? (m.ahorro / m.ingresos) * 100 : 0
                            const positivo = m.ahorro >= 0
                            return (
                                <tr key={i} className="border-b border-gray-100/30 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 capitalize">{m.label}</td>
                                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-mono">{fmt(m.ingresos)}</td>
                                    <td className="py-2 px-3 text-right text-red-500 dark:text-red-400 font-mono">{fmt(m.gastos)}</td>
                                    <td className={`py-2 px-3 text-right font-bold font-mono ${positivo ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {positivo ? '+' : ''}{fmt(m.ahorro)}
                                    </td>
                                    <td className={`py-2 px-3 text-right font-semibold ${positivo ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {tasa.toFixed(1)}%
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}
