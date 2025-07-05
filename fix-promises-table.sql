-- Fix Promises Table - Add Missing Columns
-- Run this in your Supabase SQL editor

-- Add missing columns to promises table
ALTER TABLE promises 
ADD COLUMN IF NOT EXISTS is_eco_friendly BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS witness_email TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'witness', 'public')),
ADD COLUMN IF NOT EXISTS target_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');

-- Update existing promises to have default values
UPDATE promises 
SET 
    is_eco_friendly = FALSE,
    visibility = 'private',
    target_date = created_at + INTERVAL '24 hours'
WHERE is_eco_friendly IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promises_is_eco_friendly ON promises(is_eco_friendly);
CREATE INDEX IF NOT EXISTS idx_promises_witness_email ON promises(witness_email);
CREATE INDEX IF NOT EXISTS idx_promises_visibility ON promises(visibility);
CREATE INDEX IF NOT EXISTS idx_promises_target_date ON promises(target_date);

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'promises' 
ORDER BY ordinal_position; 