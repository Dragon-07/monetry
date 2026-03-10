'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DesgloseCategorias } from '@/components/analisis/DesgloseCategorias'
import { ComparativasCategorias } from '@/components/analisis/ComparativasCategorias'
import { FlujoEfectivo } from '@/components/analisis/FlujoEfectivo'
import { Proyecciones } from '@/components/analisis/Proyecciones'
import { ModalRegistro } from '@/components/analisis/ModalRegistro'
import { PieChart, Loader2 } from 'lucide-react'

export default function AnalisisPage() {
    const [transacciones, setTransacciones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            // Solo tomamos transacciones reales, excluyendo recordatorios recurrentes
            const { data: trxData, error: trxError } = await supabase
                .from('transacciones')
                .select('*')
                .not('concepto', 'like', 'RECURRENTE:%')
                .order('fecha', { ascending: false })

            if (trxError) throw trxError

            setTransacciones(trxData || [])
        } catch (error) {
            console.error('Error fetching data for analysis:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <PieChart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Análisis Financiero
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Descubre patrones, controla tus presupuestos y proyecta tu futuro.
                        </p>
                    </div>
                </div>

                {/* Botón de nueva transacción */}
                <ModalRegistro onSuccess={fetchData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Desglose por Categorías */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col h-full hover-lift">
                    <DesgloseCategorias transacciones={transacciones} />
                </div>

                {/* 2. Comparativas de Trabajo y Programación */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col h-full hover-lift lg:col-span-1 border border-white/40 dark:border-gray-700/50 shadow-sm backdrop-blur-md">
                    <ComparativasCategorias transacciones={transacciones} />
                </div>

                {/* 3. Análisis de Flujo de Efectivo */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col h-full hover-lift lg:col-span-2">
                    <FlujoEfectivo transacciones={transacciones} />
                </div>

                {/* 4. Proyecciones (Forecasting) */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col h-full hover-lift lg:col-span-2">
                    <Proyecciones transacciones={transacciones} />
                </div>
            </div>
        </div>
    )
}
