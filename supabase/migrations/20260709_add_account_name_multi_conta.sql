-- Migration: add_account_name_multi_conta
-- Projeto: Amariti ROAS (dmccgehdvlmsvejgblqx)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dmccgehdvlmsvejgblqx/sql
--
-- Fundação multi-conta (Momento vs Amariti). Toda linha de performance passa a
-- carregar account_name ('momento' | 'amariti' | 'global'), default 'momento'
-- (a conta única existente hoje). As chaves de upsert ganham a nova coluna —
-- ATENÇÃO: o workflow do n8n precisa enviar account_name e usar o novo
-- on_conflict, senão o upsert quebra (constraint antiga deixa de existir).

ALTER TABLE public.ml_performance_roas
    ADD COLUMN IF NOT EXISTS account_name VARCHAR(20) NOT NULL DEFAULT 'momento';

ALTER TABLE public.ml_performance_roas
    DROP CONSTRAINT IF EXISTS ml_performance_roas_account_name_check;

ALTER TABLE public.ml_performance_roas
    ADD CONSTRAINT ml_performance_roas_account_name_check
    CHECK (account_name IN ('momento', 'amariti', 'global'));

ALTER TABLE public.ml_performance_roas
    DROP CONSTRAINT IF EXISTS ml_performance_roas_date_campaign_key;

ALTER TABLE public.ml_performance_roas
    ADD CONSTRAINT ml_performance_roas_date_campaign_key
    UNIQUE (date, campaign_id, account_name);

ALTER TABLE public.traffic_performance_ads
    ADD COLUMN IF NOT EXISTS account_name VARCHAR(20) NOT NULL DEFAULT 'momento';

ALTER TABLE public.traffic_performance_ads
    DROP CONSTRAINT IF EXISTS traffic_performance_ads_account_name_check;

ALTER TABLE public.traffic_performance_ads
    ADD CONSTRAINT traffic_performance_ads_account_name_check
    CHECK (account_name IN ('momento', 'amariti', 'global'));

ALTER TABLE public.traffic_performance_ads
    DROP CONSTRAINT IF EXISTS traffic_performance_ads_date_source_key;

ALTER TABLE public.traffic_performance_ads
    ADD CONSTRAINT traffic_performance_ads_date_source_key
    UNIQUE (date, traffic_source, account_name);
