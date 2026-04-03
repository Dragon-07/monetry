import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const vista = searchParams.get('vista') || 'mensual' // diaria, semanal, mensual, personalizada
  const fechaInicio = searchParams.get('fecha_inicio')
  const fechaFin = searchParams.get('fecha_fin')

  let query = supabase
    .from('transacciones')
    .select('*')
    // Excluir gastos recurrentes (plantillas) del dashboard
    .not('concepto', 'like', 'RECURRENTE:%')
    .eq('usuario_id', user.id) // Refuerzo explícito aunque RLS ya lo hace
    .order('fecha', { ascending: false })

  // Filtros según la vista
  const now = new Date()

  if (vista === 'personalizada' && fechaInicio && fechaFin) {
    // Rango personalizado
    query = query
      .gte('fecha', `${fechaInicio}T00:00:00`)
      .lte('fecha', `${fechaFin}T23:59:59`)
  } else if (vista === 'diaria') {
    // Solo hoy (desde las 00:00:00 de hoy)
    const inicioDia = new Date(now)
    inicioDia.setHours(0, 0, 0, 0)
    query = query
      .gte('fecha', inicioDia.toISOString())
      .lte('fecha', now.toISOString())
  } else if (vista === 'semanal') {
    // Últimos 7 días
    const haceUnaSeamana = new Date(now)
    haceUnaSeamana.setDate(now.getDate() - 7)
    haceUnaSeamana.setHours(0, 0, 0, 0)
    query = query.gte('fecha', haceUnaSeamana.toISOString())
  } else {
    // Vista mensual: Mostrar los últimos 12 meses para tener historial
    const haceDoceMeses = new Date(now)
    haceDoceMeses.setMonth(now.getMonth() - 12)
    haceDoceMeses.setHours(0, 0, 0, 0)
    query = query.gte('fecha', haceDoceMeses.toISOString())
  }

  const { data, error } = await query.limit(1000)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, vista })
}
