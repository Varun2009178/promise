-- Add completion_reminder_sent column to promises table
-- This tracks when completion reminders have been sent to prevent duplicates

ALTER TABLE promises 
ADD COLUMN IF NOT EXISTS completion_reminder_sent TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when querying completion reminders
CREATE INDEX IF NOT EXISTS idx_promises_completion_reminder 
ON promises(completed, completion_reminder_sent) 
WHERE completed = true AND completion_reminder_sent IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN promises.completion_reminder_sent IS 'Timestamp when completion reminder email was sent to user'; 