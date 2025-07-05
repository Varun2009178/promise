-- Check Database Schema for Users Table
-- Run this in your Supabase SQL editor to diagnose issues

-- Check if users table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check for unique constraints on email
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users' 
    AND kcu.column_name = 'email';

-- Check for any existing users
SELECT 
    id,
    name,
    email,
    created_at,
    reminder_time
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any duplicate emails
SELECT 
    email,
    COUNT(*) as count
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'; 