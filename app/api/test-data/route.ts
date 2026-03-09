import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
    const { data: userRow } = await supabase.from('transacciones').select('user_id').limit(1).single()
    const userId = userRow?.user_id

    if (!userId) {
        return NextResponse.json({ error: 'No se encontró un usuario para asignar transacciones' }, { status: 400 })
    }

    const transacciones = [
        // --- ENERO 2026 ---
        { monto: 35000, tipo: 'ingreso', categoria: 'Salario', fecha: '2026-01-05T09:00:00Z', concepto: 'Sueldo Enero', metodo_pago: 'Transferencia', user_id: userId },
        { monto: -5000, tipo: 'egreso', categoria: 'Vivienda', fecha: '2026-01-08T10:00:00Z', concepto: 'Renta Enero', metodo_pago: 'Efectivo', user_id: userId },
        { monto: -1200, tipo: 'egreso', categoria: 'Comida', fecha: '2026-01-12T14:30:00Z', concepto: 'Súper Quincena 1', metodo_pago: 'Tarjeta Crédito', user_id: userId },
        { monto: -800, tipo: 'egreso', categoria: 'Servicios', fecha: '2026-01-15T08:00:00Z', concepto: 'Internet y Luz', metodo_pago: 'Transferencia', user_id: userId },
        { monto: -2500, tipo: 'egreso', categoria: 'Ocio', fecha: '2026-01-20T21:00:00Z', concepto: 'Salida fin de semana', metodo_pago: 'Efectivo', user_id: userId },
        { monto: -1500, tipo: 'egreso', categoria: 'Comida', fecha: '2026-01-28T18:00:00Z', concepto: 'Súper Quincena 2', metodo_pago: 'Tarjeta Crédito', user_id: userId },

        // --- FEBRERO 2026 ---
        { monto: 35000, tipo: 'ingreso', categoria: 'Salario', fecha: '2026-02-05T09:00:00Z', concepto: 'Sueldo Febrero', metodo_pago: 'Transferencia', user_id: userId },
        { monto: 4000, tipo: 'ingreso', categoria: 'Ventas', fecha: '2026-02-10T11:00:00Z', concepto: 'Venta laptop vieja', metodo_pago: 'Efectivo', user_id: userId },
        { monto: -5000, tipo: 'egreso', categoria: 'Vivienda', fecha: '2026-02-08T10:00:00Z', concepto: 'Renta Febrero', metodo_pago: 'Efectivo', user_id: userId },
        { monto: -1800, tipo: 'egreso', categoria: 'Comida', fecha: '2026-02-12T14:30:00Z', concepto: 'Súper', metodo_pago: 'Tarjeta Crédito', user_id: userId },
        { monto: -900, tipo: 'egreso', categoria: 'Servicios', fecha: '2026-02-15T08:00:00Z', concepto: 'Agua y Luz', metodo_pago: 'Transferencia', user_id: userId },
        { monto: -3200, tipo: 'egreso', categoria: 'Salud', fecha: '2026-02-22T16:00:00Z', concepto: 'Dentista', metodo_pago: 'Tarjeta Crédito', user_id: userId },
        { monto: -1200, tipo: 'egreso', categoria: 'Ocio', fecha: '2026-02-25T20:00:00Z', concepto: 'Cine y cena', metodo_pago: 'Efectivo', user_id: userId }
    ]

    const records = []
    const errors = []

    for (const t of transacciones) {
        const { data, error } = await supabase
            .from('transacciones')
            .insert([t])
            .select()

        if (error) {
            errors.push(error)
        } else {
            records.push(data)
        }
    }

    return NextResponse.json({
        message: 'Proceso de generación de históricos finalizado',
        insertados: records.length,
        errores: errors
    })
}
