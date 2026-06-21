-- Migration: create_roas_schema_and_tables
-- Projeto: Amariti ROAS (dndnamqwnaguvuzvobrv)
-- Executar no SQL Editor do Supabase: https://supabase.com/dashboard/project/dndnamqwnaguvuzvobrv/sql
--
-- Schema isolado para não misturar com as tabelas do bot de WhatsApp/ERP.

CREATE SCHEMA IF NOT EXISTS roas;

CREATE TABLE IF NOT EXISTS roas.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    name TEXT NOT NULL,
    status BOOLEAN DEFAULT true,
    daily_budget NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS roas.shopee_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES roas.campaigns(id),
    date DATE NOT NULL,
    ad_spend NUMERIC DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    roas NUMERIC DEFAULT 0,
    contribution_margin NUMERIC DEFAULT 0
);
