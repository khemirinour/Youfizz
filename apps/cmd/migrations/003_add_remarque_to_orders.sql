-- Migration: Add remarque field to orders table
-- Created: 2024
-- Description: Adds remarque column to store customer remarks/notes when placing orders

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS "remarque" TEXT;

-- Migration complete

