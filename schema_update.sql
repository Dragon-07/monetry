-- Archivo para actualizar el esquema de la base de datos en Supabase

CREATE TABLE IF NOT EXISTS public.gastos_mensuales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_app TEXT NOT NULL,
    dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro >= 1 AND dia_de_cobro <= 31),
    monto NUMERIC(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    usuario_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS si es necesario
ALTER TABLE public.gastos_mensuales ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view own gastos mensuales"
    ON public.gastos_mensuales FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own gastos mensuales"
    ON public.gastos_mensuales FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own gastos mensuales"
    ON public.gastos_mensuales FOR UPDATE
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own gastos mensuales"
    ON public.gastos_mensuales FOR DELETE
    USING (auth.uid() = usuario_id);
