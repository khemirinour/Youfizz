-- Migration: Add delivery fields to articles table
-- Created: 2024
-- Description: Adds deliveryPrices and deliveryRegions columns to store delivery configuration per article

-- Add deliveryPrices column to articles table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'deliveryPrices'
    ) THEN
        ALTER TABLE "articles" ADD COLUMN "deliveryPrices" jsonb;
    END IF;
END $$;

-- Add deliveryRegions column to articles table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'deliveryRegions'
    ) THEN
        ALTER TABLE "articles" ADD COLUMN "deliveryRegions" jsonb;
    END IF;
END $$;

-- Migration complete

