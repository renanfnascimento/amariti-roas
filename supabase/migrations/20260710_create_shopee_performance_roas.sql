-- Migration: create_shopee_performance_roas
-- Projeto: Amariti ROAS (dmccgehdvlmsvejgblqx)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dmccgehdvlmsvejgblqx/sql
--
-- Espelho da inteligência do Mercado Livre para a Shopee: 1 linha por campanha
-- por dia por conta, alimentada pelo webhook app/api/n8n/shopee-roas/route.ts
-- com upsert em (date, campaign_id, account_name).

CREATE TABLE IF NOT EXISTS public.shopee_performance_roas (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    date          DATE    NOT NULL,
    campaign_id   BIGINT,
    campaign_name TEXT    NOT NULL,
    ad_spend      NUMERIC NOT NULL DEFAULT 0,
    revenue       NUMERIC NOT NULL DEFAULT 0,
    orders_count  INTEGER NOT NULL DEFAULT 0,
    impressions   INTEGER NOT NULL DEFAULT 0,
    clicks        INTEGER NOT NULL DEFAULT 0,
    account_name  VARCHAR(20) NOT NULL DEFAULT 'momento',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT shopee_performance_roas_account_name_check
        CHECK (account_name IN ('momento', 'amariti', 'global')),
    CONSTRAINT shopee_performance_roas_date_campaign_key
        UNIQUE (date, campaign_id, account_name)
);

ALTER TABLE public.shopee_performance_roas ENABLE ROW LEVEL SECURITY;

-- Nota: o app não usa Supabase Auth — todas as chamadas passam pela anon key e
-- são autorizadas na camada da aplicação (header x-api-key no webhook).
-- Por isso as policies cobrem 'anon' além de 'authenticated'.

CREATE POLICY "shopee_performance_roas_select"
    ON public.shopee_performance_roas FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "shopee_performance_roas_insert"
    ON public.shopee_performance_roas FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "shopee_performance_roas_update"
    ON public.shopee_performance_roas FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "shopee_performance_roas_delete"
    ON public.shopee_performance_roas FOR DELETE
    TO anon, authenticated
    USING (true);
