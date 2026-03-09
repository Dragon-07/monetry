import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const MARKER = 'RECURRENTE:'

// POST: Registrar el pago de un gasto recurrente como transacción real
export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
        return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // 1. Buscar los datos del gasto recurrente (solo del usuario)
    const { data: rows, error: fetchError } = await supabase
        .from('transacciones')
        .select('*')
        .eq('id', id)
        .eq('usuario_id', user.id)
        .like('concepto', `${MARKER}%`)
        .single()

    if (fetchError || !rows) {
        return NextResponse.json({ error: 'Gasto recurrente no encontrado' }, { status: 404 })
    }

    // 2. Parsear los metadatos del gasto recurrente
    let meta: any = {}
    try {
        const jsonStr = rows.concepto?.replace(MARKER, '') ?? '{}'
        meta = JSON.parse(jsonStr)
    } catch {
        return NextResponse.json({ error: 'Error al leer datos del gasto' }, { status: 500 })
    }

    // 3. Insertar la transacción REAL (sin marcador RECURRENTE:) con la fecha de hoy
    const ahora = new Date().toISOString()

    const { data: nuevaTx, error: insertError } = await supabase
        .from('transacciones')
        .insert({
            tipo: meta.tipo ?? rows.tipo ?? 'gasto',
            monto: Number(rows.monto),
            categoria: meta.categoria ?? rows.categoria ?? 'Otros Gastos',
            concepto: `${meta.nombre ?? 'Transacción recurrente'} (Registro recurrente)`,
            descripcion: meta.nombre ?? null,
            metodo_pago: meta.metodo_pago ?? rows.metodo_pago ?? 'Tarjeta',
            fecha: ahora,
            usuario_id: user.id,
        })
        .select()
        .single()

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ data: nuevaTx }, { status: 201 })
}
