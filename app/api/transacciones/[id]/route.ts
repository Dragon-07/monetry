import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Debido a compatibilidad con Next.js 15, usamos la obtención asincrónica de parámetros.
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const params = await props.params;
    const { id } = params;

    const { error } = await supabase
      .from('transacciones')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json()

    // Preparar campos a actualizar
    const datosActualizados = {
      fecha: body.fecha,
      tipo: body.tipo,
      categoria: body.categoria,
      monto: body.monto,
      descripcion: body.descripcion,
      metodo_pago: body.metodo_pago
    }

    const { data, error } = await supabase
      .from('transacciones')
      .update(datosActualizados)
      .eq('id', id)
      .eq('usuario_id', user.id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
