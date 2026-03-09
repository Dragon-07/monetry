import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const MARKER = 'RECURRENTE:'

/**
 * Procesa gastos recurrentes automáticamente
 * Verifica si hay gastos programados para hoy que no se hayan registrado
 */
export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const hoy = new Date()
  const diaActual = hoy.getDate()
  const fechaHoy = hoy.toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // 1. Obtener todos los gastos recurrentes activos del usuario para el día actual
    // En este esquema, los recurrentes son transacciones con concepto 'RECURRENTE:{...}'
    const { data: recurrentes, error: errorRecurrentes } = await supabase
      .from('transacciones')
      .select('*')
      .like('concepto', `${MARKER}%`)
      .eq('usuario_id', user.id)

    if (errorRecurrentes) {
      return NextResponse.json({ error: errorRecurrentes.message }, { status: 500 })
    }

    const recurrentesHoy = (recurrentes ?? []).filter(row => {
      try {
        const jsonStr = row.concepto?.replace(MARKER, '') ?? '{}'
        const meta = JSON.parse(jsonStr)
        return meta.activo !== false && Number(meta.dia_cobro) === diaActual
      } catch {
        return false
      }
    })

    if (recurrentesHoy.length === 0) {
      return NextResponse.json({
        message: 'No hay gastos recurrentes para procesar hoy',
        procesados: 0
      })
    }

    const transaccionesCreadas = []
    const gastosActualizados = []

    // 2. Verificar qué gastos ya fueron procesados hoy
    for (const recurrente of recurrentesHoy) {
      let meta: any = {}
      try {
        meta = JSON.parse(recurrente.concepto.replace(MARKER, ''))
      } catch { continue }

      const nombre = meta.nombre ?? 'Recurrente'

      // Verificar si ya existe una transacción real para este gasto hoy
      const { data: existe } = await supabase
        .from('transacciones')
        .select('id')
        .not('concepto', 'like', `${MARKER}%`)
        .eq('usuario_id', user.id)
        .eq('descripcion', nombre)
        .gte('fecha', `${fechaHoy}T00:00:00`)
        .lte('fecha', `${fechaHoy}T23:59:59`)
        .limit(1)

      if (existe && existe.length > 0) {
        continue
      }

      // Crear transacción real
      const { data: nueva, error: errIns } = await supabase
        .from('transacciones')
        .insert({
          tipo: recurrente.tipo ?? 'gasto',
          monto: recurrente.monto,
          categoria: meta.categoria ?? recurrente.categoria ?? 'Suscripciones',
          concepto: `${nombre} (Recurrente Automático)`,
          descripcion: nombre,
          metodo_pago: meta.metodo_pago ?? 'Tarjeta',
          fecha: hoy.toISOString(),
          usuario_id: user.id
        })
        .select()

      if (!errIns && nueva) {
        transaccionesCreadas.push(nueva[0])
        gastosActualizados.push(nombre)
      }
    }

    return NextResponse.json({
      success: true,
      procesados: transaccionesCreadas.length,
      gastos: gastosActualizados
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
