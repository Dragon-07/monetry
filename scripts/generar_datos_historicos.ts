import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generarDatos() {
    console.log('Generando datos históricos para análisis...')

    const transacciones = [
        // --- ENERO 2026 ---
        {
            monto: 35000,
            tipo: 'ingreso',
            categoria: 'Salario',
            fecha: '2026-01-05T09:00:00Z',
            descripcion: 'Sueldo Enero',
            metodo_pago: 'Transferencia'
        },
        {
            monto: -5000,
            tipo: 'egreso',
            categoria: 'Vivienda',
            fecha: '2026-01-08T10:00:00Z',
            descripcion: 'Renta Enero',
            metodo_pago: 'Efectivo'
        },
        {
            monto: -1200,
            tipo: 'egreso',
            categoria: 'Comida',
            fecha: '2026-01-12T14:30:00Z',
            descripcion: 'Súper Quincena 1',
            metodo_pago: 'Tarjeta Crédito'
        },
        {
            monto: -800,
            tipo: 'egreso',
            categoria: 'Servicios',
            fecha: '2026-01-15T08:00:00Z',
            descripcion: 'Internet y Luz',
            metodo_pago: 'Transferencia'
        },
        {
            monto: -2500,
            tipo: 'egreso',
            categoria: 'Ocio',
            fecha: '2026-01-20T21:00:00Z',
            descripcion: 'Salida fin de semana',
            metodo_pago: 'Efectivo'
        },
        {
            monto: -1500,
            tipo: 'egreso',
            categoria: 'Comida',
            fecha: '2026-01-28T18:00:00Z',
            descripcion: 'Súper Quincena 2',
            metodo_pago: 'Tarjeta Crédito'
        },

        // --- FEBRERO 2026 ---
        {
            monto: 35000,
            tipo: 'ingreso',
            categoria: 'Salario',
            fecha: '2026-02-05T09:00:00Z',
            descripcion: 'Sueldo Febrero',
            metodo_pago: 'Transferencia'
        },
        {
            monto: 4000,
            tipo: 'ingreso',
            categoria: 'Ventas',
            fecha: '2026-02-10T11:00:00Z',
            descripcion: 'Venta laptop vieja',
            metodo_pago: 'Efectivo'
        },
        {
            monto: -5000,
            tipo: 'egreso',
            categoria: 'Vivienda',
            fecha: '2026-02-08T10:00:00Z',
            descripcion: 'Renta Febrero',
            metodo_pago: 'Efectivo'
        },
        {
            monto: -1800,
            tipo: 'egreso',
            categoria: 'Comida',
            fecha: '2026-02-12T14:30:00Z',
            descripcion: 'Súper',
            metodo_pago: 'Tarjeta Crédito'
        },
        {
            monto: -900,
            tipo: 'egreso',
            categoria: 'Servicios',
            fecha: '2026-02-15T08:00:00Z',
            descripcion: 'Agua y Luz',
            metodo_pago: 'Transferencia'
        },
        {
            monto: -3200,
            tipo: 'egreso',
            categoria: 'Salud',
            fecha: '2026-02-22T16:00:00Z',
            descripcion: 'Dentista',
            metodo_pago: 'Tarjeta Crédito'
        },
        {
            monto: -1200,
            tipo: 'egreso',
            categoria: 'Ocio',
            fecha: '2026-02-25T20:00:00Z',
            descripcion: 'Cine y cena',
            metodo_pago: 'Efectivo'
        }
    ]

    for (const t of transacciones) {
        const { error } = await supabase
            .from('transacciones')
            .insert([t])

        if (error) {
            console.error('Error insertando data:', error)
        } else {
            console.log(`Insertado: ${t.descripcion} (${t.fecha})`)
        }
    }

    console.log('✅ Datos históricos generados exitosamente.')
}

generarDatos()
