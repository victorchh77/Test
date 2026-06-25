-- Migration: secretary role + transfers + planilla de pagarés
-- Run once in your Supabase SQL editor

-- ── 1. Transfers ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transfers (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  monto           INTEGER      NOT NULL,
  comprobante_url TEXT,
  notas           TEXT,
  verified        BOOLEAN      NOT NULL DEFAULT FALSE,
  verified_by     UUID         REFERENCES profiles(id),
  verified_at     TIMESTAMPTZ,
  created_by      UUID         NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='transfers' AND policyname='transfers_all') THEN
    CREATE POLICY "transfers_all" ON transfers FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 2. Planilla de pagarés – contracts ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagares_contracts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name       TEXT        NOT NULL,
  contract_file_url TEXT,
  dia_pago          INTEGER     NOT NULL CHECK (dia_pago BETWEEN 1 AND 31),
  monto_mensual     INTEGER     NOT NULL,
  notas             TEXT,
  activo            BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by        UUID        REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pagares_contracts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pagares_contracts' AND policyname='pagares_contracts_all') THEN
    CREATE POLICY "pagares_contracts_all" ON pagares_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 3. Planilla de pagarés – monthly payments ─────────────────────────────────
CREATE TABLE IF NOT EXISTS pagares_payments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id  UUID        NOT NULL REFERENCES pagares_contracts(id) ON DELETE CASCADE,
  anio         INTEGER     NOT NULL,
  mes          INTEGER     NOT NULL CHECK (mes BETWEEN 1 AND 12),
  pagado       BOOLEAN     NOT NULL DEFAULT FALSE,
  metodo_pago  TEXT,
  pagado_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (contract_id, anio, mes)
);

ALTER TABLE pagares_payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pagares_payments' AND policyname='pagares_payments_all') THEN
    CREATE POLICY "pagares_payments_all" ON pagares_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 4. Storage buckets ────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('transfer-receipts', 'transfer-receipts', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('pagares-contracts', 'pagares-contracts', TRUE)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='transfer_receipts_public_read') THEN
    CREATE POLICY "transfer_receipts_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'transfer-receipts');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='transfer_receipts_auth_write') THEN
    CREATE POLICY "transfer_receipts_auth_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'transfer-receipts');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='pagares_contracts_public_read') THEN
    CREATE POLICY "pagares_contracts_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'pagares-contracts');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='pagares_contracts_auth_write') THEN
    CREATE POLICY "pagares_contracts_auth_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pagares-contracts');
  END IF;
END $$;
