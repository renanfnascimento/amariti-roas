-- Migration: create_product_analytics_tables
-- Executar em: https://supabase.com/dashboard/project/dndnamqwnaguvuzvobrv/sql

CREATE TABLE IF NOT EXISTS roas.shopee_products (
    id                UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopee_product_id TEXT    NOT NULL,
    account           TEXT    NOT NULL DEFAULT 'shopee-renan',
    name              TEXT    NOT NULL,
    price             NUMERIC DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shopee_product_id, account)
);

CREATE TABLE IF NOT EXISTS roas.shopee_product_metrics (
    id                  UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopee_product_id   TEXT    NOT NULL,
    account             TEXT    NOT NULL DEFAULT 'shopee-renan',
    date                DATE    NOT NULL,
    impressions         INTEGER DEFAULT 0,
    clicks              INTEGER DEFAULT 0,
    orders              INTEGER DEFAULT 0,
    units               INTEGER DEFAULT 0,
    product_visitors    INTEGER DEFAULT 0,
    cart_visitors       INTEGER DEFAULT 0,
    revenue             NUMERIC DEFAULT 0,
    -- Taxas calculadas (armazenadas para facilitar queries)
    ctr                 NUMERIC DEFAULT 0,   -- clicks / impressions * 100
    order_conv_rate     NUMERIC DEFAULT 0,   -- orders / clicks * 100
    cart_conv_rate      NUMERIC DEFAULT 0,   -- cart_visitors / product_visitors * 100
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shopee_product_id, account, date)
);

-- Seed com os dados reais da Shopee Renan (período atual)
INSERT INTO roas.shopee_products (shopee_product_id, account, name, price) VALUES
  ('11698694233', 'shopee-renan', 'Kit 3 Calças Jogger Slim Malha Crepe Feminina', 119.92),
  ('18465873199', 'shopee-renan', 'Calça Feminina Malha Crepe Jogger Faixa Lateral', 118.26),
  ('23994919436', 'shopee-renan', 'Kit 2 Calças Jogger feminina com elástico Listra na Lateral colorida em Crepe', 78.92),
  ('19499092538', 'shopee-renan', 'Conjunto Feminino Tricolor Crepe', 47.94)
ON CONFLICT (shopee_product_id, account) DO NOTHING;

INSERT INTO roas.shopee_product_metrics
    (shopee_product_id, account, date, impressions, clicks, orders, units, product_visitors, cart_visitors, revenue, ctr, order_conv_rate, cart_conv_rate)
VALUES
    ('11698694233', 'shopee-renan', CURRENT_DATE, 26,   1,  1, 1, 1,  1, 119.92, 3.85, 100.00, 100.00),
    ('18465873199', 'shopee-renan', CURRENT_DATE, 1358, 56, 1, 3, 46, 8, 118.26, 4.12,   1.79,  17.39),
    ('23994919436', 'shopee-renan', CURRENT_DATE, 1326, 39, 1, 1, 35, 5,  78.92, 2.94,   2.56,  14.29),
    ('19499092538', 'shopee-renan', CURRENT_DATE, 248,  12, 1, 1, 11, 0,  47.94, 4.84,   8.33,   0.00)
ON CONFLICT (shopee_product_id, account, date) DO NOTHING;
