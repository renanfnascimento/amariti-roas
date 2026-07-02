-- Migration: add_campaign_id_unique_to_ml_performance_roas
-- Projeto: Amariti ROAS (dmccgehdvlmsvejgblqx)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dmccgehdvlmsvejgblqx/sql
--
-- O n8n passa a enviar 1 linha POR CAMPANHA (granular) em vez de agregado
-- diario. campaign_id vem da API de Ads do ML (ex.: 353062683) e, junto com
-- date, forma a chave de upsert — reenvios do mesmo dia atualizam a linha em
-- vez de duplicar. Linhas antigas (seed manual) ficam com campaign_id NULL e
-- nunca colidem (NULLs sao distintos em unique constraints no Postgres).

ALTER TABLE public.ml_performance_roas
    ADD COLUMN IF NOT EXISTS campaign_id BIGINT;

ALTER TABLE public.ml_performance_roas
    DROP CONSTRAINT IF EXISTS ml_performance_roas_date_campaign_key;

ALTER TABLE public.ml_performance_roas
    ADD CONSTRAINT ml_performance_roas_date_campaign_key
    UNIQUE (date, campaign_id);
