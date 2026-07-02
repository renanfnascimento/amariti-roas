-- Migration: create_ml_performance_roas
-- Projeto: Amariti ROAS (dndnamqwnaguvuzvobrv)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dndnamqwnaguvuzvobrv/sql
--
-- Painel de Performance e ROAS - Mercado Livre. Schema isolado 'roas' para não
-- misturar com as tabelas do bot de WhatsApp/ERP (mesma convenção das demais
-- tabelas de tráfego já existentes nesse schema).

CREATE TABLE IF NOT EXISTS roas.ml_performance_roas (
    id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    date          DATE    NOT NULL DEFAULT NOW(),
    campaign_name TEXT    NOT NULL,
    ad_spend      NUMERIC NOT NULL DEFAULT 0,
    revenue       NUMERIC NOT NULL DEFAULT 0,
    orders_count  INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE roas.ml_performance_roas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ml_performance_roas_select_authenticated"
    ON roas.ml_performance_roas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "ml_performance_roas_insert_authenticated"
    ON roas.ml_performance_roas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "ml_performance_roas_update_authenticated"
    ON roas.ml_performance_roas FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "ml_performance_roas_delete_authenticated"
    ON roas.ml_performance_roas FOR DELETE
    TO authenticated
    USING (true);
