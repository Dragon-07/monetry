import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
    const { email, password, nombre } = await request.json()

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { nombre: nombre || email.split('@')[0] },
            emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
        },
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user })
}
