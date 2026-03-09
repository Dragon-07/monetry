import { createBrowserClient } from '@supabase/ssr'

// Cliente para el navegador (componentes 'use client')
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
