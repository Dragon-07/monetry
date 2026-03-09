'use client'

import { useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Transaccion {
    id: string
    monto: number
    tipo: string
    categoria: string
    fecha: string
}

export function DesgloseCategorias({ transacciones }: { transacciones: Transaccion[] }) {
    const chartData = useMemo(() => {
        // Filtrar solo gastos (los valores positivos se diferencian por tipo='gasto')
        const egresos = transacciones.filter(t => t.tipo === 'gasto')

        // Agrupar por categoría
        const gastosPorCategoria = egresos.reduce((acc, t) => {
            const cat = t.categoria || 'Sin Categoría'
            acc[cat] = (acc[cat] || 0) + Math.abs(t.monto)
            return acc
        }, {} as Record<string, number>)

        // Ordenar de mayor a menor gasto
        const categoriasOrdenadas = Object.entries(gastosPorCategoria)
            .sort(([, a], [, b]) => b - a)

        const labels = categoriasOrdenadas.map(([cat]) => cat)
        const data = categoriasOrdenadas.map(([, monto]) => monto)
        const total = data.reduce((sum, val) => sum + val, 0)

        // Colores modernos (Liquid Glass Vibe)
        const backgroundColors = [
            'rgba(59, 130, 246, 0.8)', // blue-500
            'rgba(147, 51, 234, 0.8)', // purple-600
            'rgba(236, 72, 153, 0.8)', // pink-500
            'rgba(16, 185, 129, 0.8)', // emerald-500
            'rgba(245, 158, 11, 0.8)', // amber-500
            'rgba(99, 102, 241, 0.8)', // indigo-500
            'rgba(239, 68, 68, 0.8)',  // red-500
        ]

        const items = categoriasOrdenadas.map(([cat, monto], index) => {
            const color = backgroundColors[index % backgroundColors.length]
            const porcentaje = total > 0 ? ((monto / total) * 100).toFixed(1) : '0'
            return { categoria: cat, monto, color, porcentaje }
        })

        return {
            labels,
            total,
            items,
            datasets: [
                {
                    data,
                    backgroundColor: items.map(i => i.color),
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    hoverOffset: 4,
                },
            ],
        }
    }, [transacciones])

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Ocultar leyenda por defecto para usar nuestra propia lista interactiva
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
        cutout: '65%'
    }

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Desglose por Categorías</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Historial de gastos registrados, ideal para identificar gastos innecesarios ("gastos hormiga").
                </p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 mt-4">
                {chartData.labels.length > 0 ? (
                    <>
                        {/* Gráfico */}
                        <div className="relative w-full md:w-1/2 max-w-[250px] aspect-square flex-shrink-0">
                            <Doughnut data={chartData} options={options} />
                        </div>

                        {/* Lista de Montos Detallada */}
                        <div className="w-full md:w-1/2 flex flex-col gap-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                            {chartData.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-white/20 dark:border-gray-700/50 shadow-sm backdrop-blur-md hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full shadow-inner flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{item.categoria}</span>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{item.porcentaje}% del total</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100 ml-2 whitespace-nowrap">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.monto)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-400 mt-10">
                        No hay gastos suficientes para mostrar.
                    </div>
                )}
            </div>
        </div>
    )
}
