-- Migration: add_traffic_source_to_ml_performance_roas
-- Projeto: Amariti ROAS (dmccgehdvlmsvejgblqx)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dmccgehdvlmsvejgblqx/sql
--
-- Separa vendas orgânicas de vendas via Mercado Ads na conta "Momento Vestidos".
-- Idempotente: pode ser executada mesmo se a coluna já existir.

ALTER TABLE public.ml_performance_roas
    ADD COLUMN IF NOT EXISTS traffic_source TEXT NOT NULL DEFAULT 'ads';

ALTER TABLE public.ml_performance_roas
    DROP CONSTRAINT IF EXISTS ml_performance_roas_traffic_source_check;

ALTER TABLE public.ml_performance_roas
    ADD CONSTRAINT ml_performance_roas_traffic_source_check
    CHECK (traffic_source IN ('ads', 'organic'));
