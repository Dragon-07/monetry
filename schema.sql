-- Table: transacciones (Stores all income and expenses)
CREATE TABLE transacciones (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core Transaction Fields
  fecha TIMESTAMP NOT NULL DEFAULT NOW(),
  tipo TEXT CHECK (tipo IN ('ingreso', 'gasto')) NOT NULL,
  monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
  categoria TEXT NOT NULL,

  -- Optional Details
  concepto TEXT DEFAULT 'Transacción manual',
  descripcion TEXT,
  metodo_pago TEXT CHECK (metodo_pago IN ('Efectivo', 'Tarjeta', 'Transferencia')),
  registrado_por TEXT,
  foto_url TEXT,

  -- Metadata
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha DESC);
CREATE INDEX idx_transacciones_tipo ON transacciones(tipo);
CREATE INDEX idx_transacciones_usuario ON transacciones(usuario_id);

-- Enable Row Level Security (RLS)
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transacciones FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own transactions"
  ON transacciones FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);
