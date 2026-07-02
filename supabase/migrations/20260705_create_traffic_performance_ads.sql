-- Migration: create_traffic_performance_ads
-- Projeto: Amariti ROAS (dndnamqwnaguvuzvobrv)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dndnamqwnaguvuzvobrv/sql
--
-- Tabela de ingestao agregada (1 linha por dia + fonte de trafego) alimentada
-- pelo webhook app/api/n8n/traffic-ads/route.ts. Diferente de
-- public.ml_performance_roas (granularidade por campanha), aqui o par
-- (date, traffic_source) e unico e usado como chave de conflito no upsert,
-- para o n8n poder reenviar o mesmo dia sem duplicar registros.

CREATE TABLE IF NOT EXISTS public.traffic_performance_ads (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    date           DATE    NOT NULL,
    traffic_source TEXT    NOT NULL,
    ad_spend       NUMERIC NOT NULL DEFAULT 0,
    revenue        NUMERIC NOT NULL DEFAULT 0,
    orders_count   INTEGER NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT traffic_performance_ads_traffic_source_check
        CHECK (traffic_source IN ('ads', 'organic')),
    CONSTRAINT traffic_performance_ads_date_source_key
        UNIQUE (date, traffic_source)
);

ALTER TABLE public.traffic_performance_ads ENABLE ROW LEVEL SECURITY;

-- Nota: o app não usa Supabase Auth — todas as chamadas, inclusive o webhook
-- do n8n, passam pela anon key e são autorizadas na camada da aplicação
-- (header x-api-key). Por isso as policies cobrem 'anon' além de 'authenticated'.

CREATE POLICY "traffic_performance_ads_select_authenticated"
    ON public.traffic_performance_ads FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "traffic_performance_ads_insert_authenticated"
    ON public.traffic_performance_ads FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "traffic_performance_ads_update_authenticated"
    ON public.traffic_performance_ads FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "traffic_performance_ads_delete_authenticated"
    ON public.traffic_performance_ads FOR DELETE
    TO anon, authenticated
    USING (true);
