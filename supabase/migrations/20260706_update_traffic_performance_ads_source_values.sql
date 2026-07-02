-- Migration: update_traffic_performance_ads_source_values
-- Projeto: Amariti ROAS (dmccgehdvlmsvejgblqx)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dmccgehdvlmsvejgblqx/sql
--
-- O n8n identifica a origem do Mercado Livre com os valores 'ml_organico' e
-- 'ml_ads' (não existe atribuição de Ads por pedido na API do ML — a
-- separação é feita cruzando o total de vendas com as métricas da API de
-- Advertising). Ajusta a constraint de traffic_performance_ads, criada
-- originalmente com 'ads'/'organic', para aceitar os valores reais enviados
-- pelo webhook.

ALTER TABLE public.traffic_performance_ads
    DROP CONSTRAINT IF EXISTS traffic_performance_ads_traffic_source_check;

ALTER TABLE public.traffic_performance_ads
    ADD CONSTRAINT traffic_performance_ads_traffic_source_check
    CHECK (traffic_source IN ('ml_ads', 'ml_organico'));
