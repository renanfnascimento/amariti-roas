-- Migration: add_impressions_clicks_for_cro
-- Projeto: Amariti ROAS (dmccgehdvlmsvejgblqx)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dmccgehdvlmsvejgblqx/sql
--
-- O Centro de Comando de CRO classifica anuncios por CTR (clicks/impressions),
-- que ainda nao vinha na ingestao do n8n. Adiciona as colunas com default 0
-- para a UI nao quebrar; a proxima versao do workflow do n8n deve preencher
-- (na API de Ads do ML: metrics prints/clicks por campanha).

ALTER TABLE public.ml_performance_roas
    ADD COLUMN IF NOT EXISTS impressions INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS clicks      INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.traffic_performance_ads
    ADD COLUMN IF NOT EXISTS impressions INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS clicks      INTEGER NOT NULL DEFAULT 0;
