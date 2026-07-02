-- Migration: move_ml_performance_roas_to_public
-- Projeto: Amariti ROAS (dndnamqwnaguvuzvobrv)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dndnamqwnaguvuzvobrv/sql
--
-- A migração anterior (20260702_create_ml_performance_roas.sql) criava a tabela
-- no schema 'roas', que não está na lista de "Exposed schemas" da Data API —
-- isso faz o PostgREST recusar qualquer chamada da anon key com
-- "Invalid schema: roas", exigindo alteração manual no painel do Supabase.
--
-- 'public' já vem exposto por padrão em todo projeto Supabase, então recriar
-- a tabela lá elimina a necessidade dessa configuração manual.

DROP TABLE IF EXISTS roas.ml_performance_roas;

CREATE TABLE IF NOT EXISTS public.ml_performance_roas (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    date          DATE    NOT NULL DEFAULT NOW(),
    campaign_name TEXT    NOT NULL,
    ad_spend      NUMERIC NOT NULL DEFAULT 0,
    revenue       NUMERIC NOT NULL DEFAULT 0,
    orders_count  INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ml_performance_roas ENABLE ROW LEVEL SECURITY;

-- Nota: o app não usa Supabase Auth (nenhuma tela de login) — todas as
-- chamadas, inclusive o webhook do n8n, passam pela anon key e são
-- autorizadas na camada da aplicação (Server Actions + header x-api-key).
-- Por isso as policies cobrem 'anon' além de 'authenticated'.

CREATE POLICY "ml_performance_roas_select_authenticated"
    ON public.ml_performance_roas FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "ml_performance_roas_insert_authenticated"
    ON public.ml_performance_roas FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "ml_performance_roas_update_authenticated"
    ON public.ml_performance_roas FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "ml_performance_roas_delete_authenticated"
    ON public.ml_performance_roas FOR DELETE
    TO anon, authenticated
    USING (true);
