-- Migration: create_market_competitors_ml
-- Projeto: Amariti ROAS (dmccgehdvlmsvejgblqx)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dmccgehdvlmsvejgblqx/sql
--
-- Vitrine de concorrentes do Mercado Livre para a ferramenta "Concorrência da
-- página" (módulo Mercado). Alimentada pelo webhook
-- app/api/n8n/mercado-concorrencia/route.ts com upsert em ml_item_id.

CREATE TABLE IF NOT EXISTS public.market_competitors_ml (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    ml_item_id    TEXT    NOT NULL UNIQUE,
    title         TEXT    NOT NULL,
    price         NUMERIC NOT NULL DEFAULT 0,
    thumbnail_url TEXT,
    sold_quantity INTEGER NOT NULL DEFAULT 0,
    permalink     TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reenvio do n8n atualiza a linha; o trigger mantém updated_at honesto sem
-- depender do payload.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER market_competitors_ml_set_updated_at
    BEFORE UPDATE ON public.market_competitors_ml
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.market_competitors_ml ENABLE ROW LEVEL SECURITY;

-- Nota: o app não usa Supabase Auth — todas as chamadas passam pela anon key e
-- são autorizadas na camada da aplicação (header x-api-key no webhook).
-- Por isso as policies cobrem 'anon' além de 'authenticated'; service_role
-- ignora RLS por definição.

CREATE POLICY "market_competitors_ml_select"
    ON public.market_competitors_ml FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "market_competitors_ml_insert"
    ON public.market_competitors_ml FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "market_competitors_ml_update"
    ON public.market_competitors_ml FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
