-- Migration: create_product_metrics_table
-- Executar em: https://supabase.com/dashboard/project/dmccgehdvlmsvejgblqx/sql
--
-- Assume que roas.shopee_products JÁ EXISTE com product_id BIGINT PRIMARY KEY.
-- Se não existir, crie-a primeiro:
--
-- CREATE TABLE IF NOT EXISTS roas.shopee_products (
--     product_id  BIGINT  PRIMARY KEY,
--     name        TEXT    NOT NULL,
--     price       NUMERIC DEFAULT 0
-- );

CREATE TABLE IF NOT EXISTS roas.shopee_product_metrics (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  BIGINT  REFERENCES roas.shopee_products(product_id) ON DELETE CASCADE,
    date        DATE    NOT NULL,
    impressions INT     DEFAULT 0,
    clicks      INT     DEFAULT 0,
    orders      INT     DEFAULT 0,
    visitors    INT     DEFAULT 0,
    UNIQUE(product_id, date)
);
