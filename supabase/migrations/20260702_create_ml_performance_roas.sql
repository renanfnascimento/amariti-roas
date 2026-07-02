-- Migration: create_ml_performance_roas
-- Projeto: Amariti ROAS (dndnamqwnaguvuzvobrv)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dndnamqwnaguvuzvobrv/sql
--
-- SUPERADA por 20260703_move_ml_performance_roas_to_public.sql — o schema 'roas'
-- exige habilitar "Exposed schemas" manualmente no painel do Supabase, o que a
-- usuária pediu para evitar. A tabela foi movida para 'public'. Mantido apenas
-- para histórico; não execute este arquivo isoladamente.
--
-- Painel de Performance e ROAS - Mercado Livre. Schema isolado 'roas' para não
-- misturar com as tabelas do bot de WhatsApp/ERP (mesma convenção das demais
-- tabelas de tráfego já existentes nesse schema).
--
-- IMPORTANTE: depois de rodar esta migration, confirme em Project Settings >
-- API > Data API > Exposed schemas que "roas" está na lista. Sem isso o
-- PostgREST recusa qualquer chamada da anon key para este schema com o erro
-- "Invalid schema: roas", mesmo com tabela e policies corretas.

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

-- Nota: o app não usa Supabase Auth (nenhuma tela de login) — todas as
-- chamadas, inclusive o webhook do n8n, passam pela anon key e são
-- autorizadas na camada da aplicação (Server Actions + header x-api-key).
-- Por isso as policies cobrem 'anon' além de 'authenticated'.

CREATE POLICY "ml_performance_roas_select_authenticated"
    ON roas.ml_performance_roas FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "ml_performance_roas_insert_authenticated"
    ON roas.ml_performance_roas FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "ml_performance_roas_update_authenticated"
    ON roas.ml_performance_roas FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "ml_performance_roas_delete_authenticated"
    ON roas.ml_performance_roas FOR DELETE
    TO anon, authenticated
    USING (true);
