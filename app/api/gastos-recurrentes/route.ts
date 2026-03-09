import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Los gastos recurrentes se almacenan en la tabla 'transacciones' con concepto='RECURRENTE:{...}'
const MARKER = 'RECURRENTE:'

function serializeGasto(gasto: {
  nombre: string,
  dia_cobro: number,
  monto: number,
  activo: boolean,
  categoria: string,
  metodo_pago: string,
  cuenta: string | null,
  tipo?: 'gasto' | 'ingreso'
}) {
  return `${MARKER}${JSON.stringify({
    nombre: gasto.nombre,
    dia_cobro: gasto.dia_cobro,
    activo: gasto.activo,
    categoria: gasto.categoria,
    metodo_pago: gasto.metodo_pago,
    cuenta: gasto.cuenta ?? null,
    tipo: gasto.tipo ?? 'gasto'
  })}`
}

function parseGasto(row: any) {
  try {
    const jsonStr = row.concepto?.replace(MARKER, '') ?? '{}'
    const meta = JSON.parse(jsonStr)
    return {
      id: row.id,
      nombre: meta.nombre ?? row.descripcion ?? 'Sin nombre',
      dia_cobro: meta.dia_cobro ?? 1,
      monto: Number(row.monto),
      activo: meta.activo ?? true,
      categoria: meta.categoria ?? row.categoria ?? 'Otros Gastos',
      metodo_pago: meta.metodo_pago ?? row.metodo_pago ?? 'Tarjeta',
      cuenta: meta.cuenta ?? null,
      tipo: meta.tipo ?? row.tipo ?? 'gasto',
      ultima_ejecucion: row.fecha ?? null,
      created_at: row.created_at,
      updated_at: row.created_at
    }
  } catch {
    return null
  }
}

// GET: Obtener todos los gastos recurrentes del usuario autenticado
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .like('concepto', `${MARKER}%`)
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const gastos = (data ?? []).map(parseGasto).filter(Boolean)
  return NextResponse.json({ data: gastos })
}

// Calcula la próxima fecha en que cae el día programado (este mes o el siguiente)
function getNextScheduledDate(dia_cobro: number): Date {
  const now = new Date()
  const hoy = now.getDate()

  let scheduled = new Date(now.getFullYear(), now.getMonth(), dia_cobro, 0, 0, 0)

  // Si el día ya pasó este mes, programar para el mes siguiente
  if (hoy > dia_cobro) {
    scheduled = new Date(now.getFullYear(), now.getMonth() + 1, dia_cobro, 0, 0, 0)
  }

  return scheduled
}

// POST: Crear nuevo gasto recurrente vinculado al usuario
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const fechaProgramada = getNextScheduledDate(body.dia_cobro)

  const { data, error } = await supabase
    .from('transacciones')
    .insert({
      tipo: body.tipo ?? 'gasto',
      monto: body.monto,
      categoria: body.categoria ?? 'Otros Gastos',
      concepto: serializeGasto({
        nombre: body.nombre,
        dia_cobro: body.dia_cobro,
        monto: body.monto,
        activo: body.activo ?? true,
        categoria: body.categoria ?? 'Otros Gastos',
        metodo_pago: body.metodo_pago ?? 'Tarjeta',
        cuenta: body.cuenta ?? null,
        tipo: body.tipo ?? 'gasto'
      }),
      descripcion: body.nombre,
      metodo_pago: body.metodo_pago ?? 'Tarjeta',
      fecha: fechaProgramada.toISOString(),
      usuario_id: user.id,
    })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = (data ?? []).map(parseGasto).filter(Boolean)
  return NextResponse.json({ data: result }, { status: 201 })
}


// PUT: Actualizar gasto recurrente (solo del usuario dueño)
export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()

  if (!body.id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('transacciones')
    .update({
      tipo: body.tipo ?? 'gasto',
      monto: body.monto,
      categoria: body.categoria ?? 'Otros Gastos',
      concepto: serializeGasto({
        nombre: body.nombre,
        dia_cobro: body.dia_cobro,
        monto: body.monto,
        activo: body.activo ?? true,
        categoria: body.categoria ?? 'Otros Gastos',
        metodo_pago: body.metodo_pago ?? 'Tarjeta',
        cuenta: body.cuenta ?? null,
        tipo: body.tipo ?? 'gasto'
      }),
      descripcion: body.nombre,
      metodo_pago: body.metodo_pago ?? 'Tarjeta',
    })
    .eq('id', body.id)
    .eq('usuario_id', user.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = (data ?? []).map(parseGasto).filter(Boolean)
  return NextResponse.json({ data: result })
}

// DELETE: Eliminar gasto recurrente (solo del usuario dueño)
export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { error } = await supabase
    .from('transacciones')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
