-- Migration: Add priceAfterDiscount column to articles table
-- Created: 2024
-- Description: Adds optional priceAfterDiscount column to store discounted price for articles

-- Add priceAfterDiscount column to articles table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'priceAfterDiscount'
    ) THEN
        ALTER TABLE "articles" ADD COLUMN "priceAfterDiscount" numeric(12, 2);
    END IF;
END $$;

-- Migration complete

