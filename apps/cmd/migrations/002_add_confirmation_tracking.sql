-- Migration: Add confirmation tracking fields to orders table
-- Created: 2024
-- Description: Adds fields to track confirmation attempts and the user who confirmed the order

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS "confirmationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "confirmedByUserId" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "confirmedByUserName" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "confirmedByUserEmail" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "lastConfirmationAttemptAt" TIMESTAMP;

-- Set default values for existing orders
UPDATE orders
SET "confirmationAttempts" = 0
WHERE "confirmationAttempts" IS NULL;

-- Migration complete

