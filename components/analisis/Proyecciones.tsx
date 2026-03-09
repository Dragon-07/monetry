'use client'

import { useMemo, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface Transaccion {
    id: string
    monto: number
    tipo: string
    fecha: string
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const fmt = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

const fmtK = (v: number) => {
    const abs = Math.abs(v)
    if (abs >= 1000) return `$${(v / 1000).toFixed(0)}k`
    return `$${v.toFixed(0)}`
}

/** Media ponderada exponencial: último 50%, penúltimo 30%, antepenúltimo 20% */
function mediaEWA(valores: number[]): number {
    if (valores.length === 0) return 0
    if (valores.length === 1) return valores[0]
    if (valores.length === 2) return valores[0] * 0.4 + valores[1] * 0.6
    const [a, b, c] = valores.slice(-3)
    return a * 0.2 + b * 0.3 + c * 0.5
}

export function Proyecciones({ transacciones }: { transacciones: Transaccion[] }) {
    const [simulOpen, setSimulOpen] = useState(false)
    const [redGastos, setRedGastos] = useState(0)   // % reducción gastos
    const [incIngresos, setIncIngresos] = useState(0) // % aumento ingresos

    const anioActual = new Date().getFullYear()
    const mesActualIdx = new Date().getMonth() // 0-11

    /* ─── Datos históricos del año actual ─── */
    const historico = useMemo(() => {
        const arr = Array.from({ length: 12 }, () => ({ ingresos: 0, gastos: 0, tieneData: false }))
        transacciones.forEach(t => {
            const fecha = new Date(t.fecha)
            if (isNaN(fecha.getTime())) return
            if (fecha.getFullYear() !== anioActual) return
            const m = fecha.getMonth()
            arr[m].tieneData = true
            if (t.tipo === 'ingreso') arr[m].ingresos += Math.abs(t.monto)
            else if (t.tipo === 'gasto') arr[m].gastos += Math.abs(t.monto)
        })
        return arr
    }, [transacciones, anioActual])

    /* ─── Media ponderada de los últimos 3 meses con datos ─── */
    const { proyIngresos: baseProyI, proyGastos: baseProyG } = useMemo(() => {
        const conDatos = historico
            .slice(0, mesActualIdx + 1)
            .filter(m => m.tieneData)
        const valI = conDatos.map(m => m.ingresos)
        const valG = conDatos.map(m => m.gastos)
        return {
            proyIngresos: mediaEWA(valI),
            proyGastos: mediaEWA(valG),
        }
    }, [historico, mesActualIdx])

    /* ─── Datos completos de 12 meses (real + proyectado) ─── */
    const { dataI, dataG, dataA, esFuturo } = useMemo(() => {
        const dI: number[] = []
        const dG: number[] = []
        const dA: number[] = []
        const ef: boolean[] = []

        for (let i = 0; i < 12; i++) {
            let ing: number, gas: number
            if (i <= mesActualIdx && historico[i].tieneData) {
                ing = historico[i].ingresos
                gas = historico[i].gastos
                ef.push(false)
            } else {
                ing = baseProyI
                gas = baseProyG
                ef.push(true)
            }
            dI.push(ing)
            dG.push(gas)
            dA.push(ing - gas)
        }
        return { dataI: dI, dataG: dG, dataA: dA, esFuturo: ef }
    }, [historico, mesActualIdx, baseProyI, baseProyG])

    /* ─── KPIs base (sin simulador) ─── */
    const kpisBase = useMemo(() => {
        const mesesRestantes = 11 - mesActualIdx // meses futuros
        const ahorroProyDic = dataA
            .slice(mesActualIdx + 1)
            .reduce((s, v) => s + v, 0)
        const ingresosTotales = dataI.reduce((s, v) => s + v, 0)
        const gastosTotales = dataG.reduce((s, v) => s + v, 0)
        return { mesesRestantes, ahorroProyDic, ingresosTotales, gastosTotales }
    }, [dataI, dataG, dataA, mesActualIdx])

    /* ─── KPIs con simulador aplicado ─── */
    const kpisSim = useMemo(() => {
        const factorI = 1 + incIngresos / 100
        const factorG = 1 - redGastos / 100
        const mesesRestantes = kpisBase.mesesRestantes

        let ahorroSim = 0
        let ingTotSim = 0
        let gasTotSim = 0

        for (let i = 0; i < 12; i++) {
            const esFut = esFuturo[i]
            const ing = esFut ? dataI[i] * factorI : dataI[i]
            const gas = esFut ? dataG[i] * factorG : dataG[i]
            ingTotSim += ing
            gasTotSim += gas
            if (esFut) ahorroSim += ing - gas
        }

        const ahorroExtra = ahorroSim - kpisBase.ahorroProyDic
        return { mesesRestantes, ahorroProyDic: ahorroSim, ingresosTotales: ingTotSim, gastosTotales: gasTotSim, ahorroExtra }
    }, [kpisBase, dataI, dataG, esFuturo, incIngresos, redGastos])

    /* ─── Chart data ─── */
    const chartData = useMemo(() => ({
        labels: MESES,
        datasets: [
            {
                label: 'Ingresos',
                data: dataI,
                borderColor: 'rgba(16,185,129,1)',
                backgroundColor: 'rgba(16,185,129,0.08)',
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(16,185,129,1)',
                pointBorderColor: '#fff',
                fill: true,
                tension: 0.4,
                segment: {
                    borderDash: (ctx: any) => esFuturo[ctx.p0DataIndex] ? [6, 4] : undefined,
                    borderColor: (ctx: any) => esFuturo[ctx.p0DataIndex]
                        ? 'rgba(16,185,129,0.5)'
                        : 'rgba(16,185,129,1)',
                },
            },
            {
                label: 'Gastos',
                data: dataG,
                borderColor: 'rgba(239,68,68,1)',
                backgroundColor: 'rgba(239,68,68,0.06)',
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(239,68,68,1)',
                pointBorderColor: '#fff',
                fill: true,
                tension: 0.4,
                segment: {
                    borderDash: (ctx: any) => esFuturo[ctx.p0DataIndex] ? [6, 4] : undefined,
                    borderColor: (ctx: any) => esFuturo[ctx.p0DataIndex]
                        ? 'rgba(239,68,68,0.5)'
                        : 'rgba(239,68,68,1)',
                },
            },
            {
                label: 'Ahorro Neto',
                data: dataA,
                borderColor: 'rgba(139,92,246,1)',
                backgroundColor: 'rgba(139,92,246,0.10)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: dataA.map(v => v >= 0 ? 'rgba(16,185,129,1)' : 'rgba(239,68,68,1)'),
                pointBorderColor: '#fff',
                fill: true,
                tension: 0.4,
                segment: {
                    borderDash: (ctx: any) => esFuturo[ctx.p0DataIndex] ? [4, 4] : undefined,
                    borderColor: (ctx: any) => esFuturo[ctx.p0DataIndex]
                        ? 'rgba(139,92,246,0.45)'
                        : 'rgba(139,92,246,1)',
                },
            },
        ],
    }), [dataI, dataG, dataA, esFuturo])

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
                borderColor: 'rgba(139,92,246,0.35)',
                borderWidth: 1,
                callbacks: {
                    title: (items: any[]) => {
                        const idx = items[0]?.dataIndex
                        const tipo = esFuturo[idx] ? '📊 Proyectado' : '✅ Real'
                        return `${MESES[idx]} ${anioActual}  •  ${tipo}`
                    },
                    label: (ctx: any) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
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
    }), [esFuturo, anioActual])

    const hayDatos = transacciones.length > 0

    /* ─── Texto conclusión simulador ─── */
    const conclusionSim = useMemo(() => {
        if (redGastos === 0 && incIngresos === 0) return null
        const partes: string[] = []
        if (redGastos > 0) partes.push(`reduces tus gastos un ${redGastos}%`)
        if (incIngresos > 0) partes.push(`aumentas tus ingresos un ${incIngresos}%`)
        const condicional = `Si ${partes.join(' y ')}...`
        const extra = kpisSim.ahorroExtra
        const podrías = extra >= 0
            ? `podrías ahorrar ${fmt(extra)} adicionales antes de diciembre.`
            : `tu déficit aumentaría ${fmt(Math.abs(extra))} para diciembre.`
        return `${condicional} ${podrías}`
    }, [redGastos, incIngresos, kpisSim.ahorroExtra])

    return (
        <>
            {/* ── Encabezado ── */}
            <div className="mb-5">
                <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                    Proyecciones del Año (Forecasting)
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Media ponderada de los últimos 3 meses.{' '}
                    <span className="opacity-60">Línea punteada = futuro proyectado.</span>
                </p>
            </div>

            {/* ── KPIs cierre de año ── */}
            {hayDatos && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {/* Ahorro proyectado */}
                    <div className="rounded-xl p-3 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                        <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            💰 Ahorro al cierre
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 mb-0.5">Proyectado a Dic</p>
                        <p className={`text-xl font-black ${kpisSim.ahorroProyDic >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {kpisSim.ahorroProyDic < 0 && <span className="mr-1">⚠️</span>}
                            {fmt(kpisSim.ahorroProyDic)}
                        </p>
                    </div>
                    {/* Ingresos totales */}
                    <div className="rounded-xl p-3 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                        <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            📈 Ingresos año
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 mb-0.5">Real + proyección</p>
                        <p className="text-xl font-black text-emerald-500">{fmt(kpisSim.ingresosTotales)}</p>
                    </div>
                    {/* Gastos totales */}
                    <div className="rounded-xl p-3 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                        <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            📉 Gastos año
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 mb-0.5">Real + proyección</p>
                        <p className="text-xl font-black text-red-500">{fmt(kpisSim.gastosTotales)}</p>
                    </div>
                    {/* Meses restantes */}
                    <div className="rounded-xl p-3 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
                        <p className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            📅 Meses restantes
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 mb-0.5">Para cerrar diciembre</p>
                        <p className="text-xl font-black text-violet-500">
                            {kpisSim.mesesRestantes} {kpisSim.mesesRestantes === 1 ? 'mes' : 'meses'}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Gráfico ── */}
            <div className="relative min-h-[280px] w-full">
                {hayDatos ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <svg className="w-14 h-14 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <p className="text-gray-400 font-medium">Sin datos para proyectar</p>
                        <p className="text-xs text-gray-400">Registra transacciones del año actual.</p>
                    </div>
                )}
            </div>

            {/* ── Simulador colapsable ── */}
            {hayDatos && (
                <div className="mt-5">
                    <button
                        onClick={() => setSimulOpen(o => !o)}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="text-base">🎛️</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                            Simulador: ¿Qué pasa si...?
                        </span>
                        <svg
                            className={`ml-auto w-4 h-4 text-gray-400 transition-transform duration-200 ${simulOpen ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {simulOpen && (
                        <div className="mt-3 px-4 py-4 rounded-xl bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm space-y-5">
                            {/* Slider gastos */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        📉 Reduzco mis gastos mensuales en
                                    </label>
                                    <span className="text-sm font-bold text-red-500">{redGastos}%</span>
                                </div>
                                <input
                                    type="range" min={0} max={50} step={5}
                                    value={redGastos}
                                    onChange={e => setRedGastos(Number(e.target.value))}
                                    className="w-full accent-red-500"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                    <span>0%</span><span>25%</span><span>50%</span>
                                </div>
                            </div>

                            {/* Slider ingresos */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        📈 Aumento mis ingresos mensuales en
                                    </label>
                                    <span className="text-sm font-bold text-emerald-500">{incIngresos}%</span>
                                </div>
                                <input
                                    type="range" min={0} max={50} step={5}
                                    value={incIngresos}
                                    onChange={e => setIncIngresos(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                    <span>0%</span><span>25%</span><span>50%</span>
                                </div>
                            </div>

                            {/* Conclusión dinámica */}
                            {conclusionSim && (
                                <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${kpisSim.ahorroExtra >= 0
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
                                    }`}>
                                    {conclusionSim}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
