-- Database Migration for Social & Accountability Features
-- Run this in your Supabase SQL editor

-- Add new columns to promises table
ALTER TABLE promises 
ADD COLUMN IF NOT EXISTS witness_email TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'witness', 'public'));

-- Create accountability_partners table
CREATE TABLE IF NOT EXISTS accountability_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, partner_email)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accountability_partners_user_id ON accountability_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_promises_witness_email ON promises(witness_email);
CREATE INDEX IF NOT EXISTS idx_promises_visibility ON promises(visibility);

-- Add RLS policies for accountability_partners table
ALTER TABLE accountability_partners ENABLE ROW LEVEL SECURITY;

-- Users can only see their own accountability partners
CREATE POLICY "Users can view their own accountability partners" ON accountability_partners
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own accountability partners
CREATE POLICY "Users can insert their own accountability partners" ON accountability_partners
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own accountability partners
CREATE POLICY "Users can delete their own accountability partners" ON accountability_partners
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Update existing promises to have default visibility
UPDATE promises SET visibility = 'private' WHERE visibility IS NULL; 