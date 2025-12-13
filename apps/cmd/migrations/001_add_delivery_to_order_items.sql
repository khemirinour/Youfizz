-- Migration: Add delivery fields to order items
-- Created: 2024
-- Description: Documents the addition of delivery fields (hasDelivery, destination, deliveryPrice) to order items JSONB structure
-- Note: Since items is a JSONB column, no schema change is required. This migration is for documentation purposes.
-- The items structure now supports:
-- {
--   "articleId": "uuid",
--   "qty": number,
--   "price": "decimal string",
--   "hasDelivery": boolean (optional),
--   "destination": "string" (optional, required if hasDelivery is true),
--   "deliveryPrice": "decimal string" (optional, required if hasDelivery is true)
-- }

-- No SQL changes needed as items is JSONB and can store flexible structure
-- Migration complete

