import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

/**
 * API para subir y procesar archivos CSV de ingresos/gastos
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Validar que sea CSV
    if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
      return NextResponse.json({
        error: 'Solo se permiten archivos CSV (.csv)'
      }, { status: 400 })
    }

    // Leer contenido del archivo
    const content = await file.text()
    const lines = content.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({
        error: 'El archivo está vacío o no tiene datos'
      }, { status: 400 })
    }

    // Parsear CSV
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const transacciones = []
    const errors = []

    // Validar headers esperados
    const requiredHeaders = ['fecha', 'tipo', 'categoria', 'monto']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

    if (missingHeaders.length > 0) {
      return NextResponse.json({
        error: `Faltan columnas requeridas: ${missingHeaders.join(', ')}`,
        hint: 'Formato esperado: fecha,tipo,categoria,monto,descripcion,num_pax,metodo_pago,registrado_por'
      }, { status: 400 })
    }

    // Procesar cada fila
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map(v => v.trim())

      if (values.length !== headers.length) {
        errors.push(`Fila ${i + 1}: Número de columnas incorrecto`)
        continue
      }

      // Crear objeto con los datos
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })

      // Validaciones
      const tipo = row.tipo?.toLowerCase()
      if (tipo !== 'gasto' && tipo !== 'ingreso') {
        errors.push(`Fila ${i + 1}: Tipo debe ser 'gasto' o 'ingreso'`)
        continue
      }

      const monto = parseFloat(row.monto)
      if (isNaN(monto) || monto <= 0) {
        errors.push(`Fila ${i + 1}: Monto inválido`)
        continue
      }

      // Preparar transacción
      const transaccion: any = {
        fecha: row.fecha ? new Date(row.fecha).toISOString() : new Date().toISOString(),
        tipo,
        categoria: row.categoria || 'Otros ' + (tipo === 'gasto' ? 'Gastos' : 'Ingresos'),
        monto,
        descripcion: row.descripcion || null,
        metodo_pago: row.metodo_pago || 'Efectivo',
        usuario_id: user.id
      }

      transacciones.push(transaccion)
    }

    if (transacciones.length === 0) {
      return NextResponse.json({
        error: 'No se pudo procesar ninguna transacción',
        details: errors
      }, { status: 400 })
    }

    // Insertar en Supabase (batch)
    const { error: insertError, data } = await supabase
      .from('transacciones')
      .insert(transacciones)
      .select()

    if (insertError) {
      throw new Error(`Error al insertar en BD: ${insertError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: `Se registraron ${transacciones.length} transacciones exitosamente`,
      count: transacciones.length,
      errors: errors.length > 0 ? errors : undefined,
      transactions: data,
    })

  } catch (error: any) {
    console.error('Upload Excel error:', error)
    return NextResponse.json(
      {
        error: 'Error procesando archivo',
        details: error.message
      },
      { status: 500 }
    )
  }
}
