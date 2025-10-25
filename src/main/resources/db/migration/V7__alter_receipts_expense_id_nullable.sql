-- Make expense_id nullable in receipts table
ALTER TABLE receipts ALTER COLUMN expense_id DROP NOT NULL;