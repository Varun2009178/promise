# Production Setup Guide

## 🚀 **Deploy to Production**

### **Step 1: Push to GitHub**

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Create GitHub repository** and push:
```bash
git remote add origin https://github.com/yourusername/promise-app.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy to Vercel**

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import your repository**:
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure environment variables**:
   - Go to Project Settings → Environment Variables
   - Add these variables:
     ```
     RESEND_API_KEY=your_resend_api_key
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
     ```

4. **Deploy** - Vercel will automatically deploy your app

### **Step 3: Set Up Supabase Cron Jobs**

1. **Get your Vercel URL** (e.g., `https://your-app.vercel.app`)

2. **Go to Supabase Dashboard** → **SQL Editor**

3. **Enable extensions**:
   - Go to **Database** → **Extensions**
   - Enable `pg_cron` (contact support if needed)
   - Enable `http` (should be available)

4. **Run this SQL** (replace `YOUR-VERCEL-URL` with your actual URL):

```sql
-- Enable http extension for making API calls
CREATE EXTENSION IF NOT EXISTS http;

-- Add column to track completion reminders
ALTER TABLE promises 
ADD COLUMN IF NOT EXISTS completion_reminder_sent TIMESTAMP WITH TIME ZONE;

-- Function to send gentle reminders at user's preferred time
CREATE OR REPLACE FUNCTION send_gentle_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    current_hour INTEGER;
    reminder_hour INTEGER;
BEGIN
    -- Get current hour
    current_hour := EXTRACT(HOUR FROM NOW());
    
    -- Loop through users who should receive gentle reminders now
    FOR user_record IN 
        SELECT 
            u.id,
            u.name,
            u.email,
            u.reminder_time,
            p.promise_text,
            p.completed
        FROM users u
        LEFT JOIN LATERAL (
            SELECT promise_text, completed
            FROM promises 
            WHERE user_id = u.id 
            AND completed = false
            ORDER BY created_at DESC 
            LIMIT 1
        ) p ON true
        WHERE u.reminder_time IS NOT NULL
        AND p.promise_text IS NOT NULL
    LOOP
        -- Map reminder_time to hour
        CASE user_record.reminder_time
            WHEN 'morning' THEN reminder_hour := 9;
            WHEN 'midday' THEN reminder_hour := 12;
            WHEN 'evening' THEN reminder_hour := 18;
            ELSE reminder_hour := 9; -- Default to morning
        END CASE;
        
        -- Send reminder if it's the right hour and promise is not completed
        IF current_hour = reminder_hour AND NOT user_record.completed THEN
            -- Call the API endpoint to send email
            PERFORM net.http_post(
                url := 'https://YOUR-VERCEL-URL/api/send-reminder',
                headers := '{"Content-Type": "application/json"}',
                body := json_build_object(
                    'userId', user_record.id,
                    'reminderType', 'gentle'
                )::text
            );
        END IF;
    END LOOP;
END;
$$;

-- Function to send completion reminders 24 hours after promise creation
CREATE OR REPLACE FUNCTION send_completion_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    promise_record RECORD;
BEGIN
    -- Loop through promises that are exactly 24 hours old
    FOR promise_record IN 
        SELECT 
            p.id,
            p.promise_text,
            p.completed,
            p.created_at,
            u.id as user_id,
            u.name,
            u.email
        FROM promises p
        JOIN users u ON p.user_id = u.id
        WHERE p.created_at <= NOW() - INTERVAL '24 hours'
        AND p.created_at > NOW() - INTERVAL '25 hours'
        AND p.completion_reminder_sent IS NULL
    LOOP
        -- Call the API endpoint to send email
        PERFORM net.http_post(
            url := 'https://YOUR-VERCEL-URL/api/send-reminder',
            headers := '{"Content-Type": "application/json"}',
            body := json_build_object(
                'userId', promise_record.user_id,
                'reminderType', 'completion'
            )::text
        );
        
        -- Mark that completion reminder was sent
        UPDATE promises 
        SET completion_reminder_sent = NOW()
        WHERE id = promise_record.id;
    END LOOP;
END;
$$;

-- Schedule gentle reminders to run every hour
SELECT cron.schedule(
    'send-gentle-reminders',
    '0 * * * *', -- Every hour at minute 0
    'SELECT send_gentle_reminders();'
);

-- Schedule completion reminders to run every hour
SELECT cron.schedule(
    'send-completion-reminders',
    '0 * * * *', -- Every hour at minute 0
    'SELECT send_completion_reminders();'
);
```

### **Step 4: Test Production**

1. **Test emails**: Visit `https://your-app.vercel.app/test-email`

2. **Test cron functions**:
```sql
-- Test gentle reminders
SELECT send_gentle_reminders();

-- Test completion reminders
SELECT send_completion_reminders();
```

3. **Check cron jobs**:
```sql
-- View scheduled jobs
SELECT * FROM cron.job;

-- View recent runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## 🔧 **Environment Variables**

Make sure these are set in your Vercel project:

- `RESEND_API_KEY` - Your Resend API key
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `NEXT_PUBLIC_APP_URL` - Your Vercel app URL

## 📊 **Monitoring**

- **Email logs**: Check Resend dashboard
- **Cron logs**: Check Supabase SQL editor
- **App logs**: Check Vercel dashboard

## 🎯 **What You'll Have**

- ✅ Production app on Vercel
- ✅ Automated email reminders
- ✅ Real user data processing
- ✅ Monitoring and logging
- ✅ Scalable infrastructure 