import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendGentleReminder, sendCompletionReminder } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const { userId, reminderType } = await request.json();

    if (!userId || !reminderType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user data and current promise
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current uncompleted promise
    const { data: currentPromise, error: promiseError } = await supabase
      .from('promises')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (promiseError && promiseError.code !== 'PGRST116') {
      console.error('Error fetching current promise:', promiseError);
      return NextResponse.json({ error: 'Failed to fetch promise' }, { status: 500 });
    }

    // If no current promise, don't send reminder
    if (!currentPromise) {
      return NextResponse.json({ message: 'No active promise to remind about' }, { status: 200 });
    }

    const isCompleted = !!currentPromise.completed;

    // Send appropriate email based on reminder type
    if (reminderType === 'gentle') {
      await sendGentleReminder({
        name: userData.name,
        email: userData.email,
        userId: userData.id,
        promise: currentPromise.promise_text,
        isCompleted
      });
    } else if (reminderType === 'completion') {
      await sendCompletionReminder({
        name: userData.name,
        email: userData.email,
        userId: userData.id,
        promise: currentPromise.promise_text,
        isCompleted
      });

      // Mark that completion reminder was sent
      await supabase
        .from('promises')
        .update({ completion_reminder_sent: new Date().toISOString() })
        .eq('id', currentPromise.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: `${reminderType} reminder sent successfully` 
    });

  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}

// For manual testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Reminder system is running',
    endpoints: {
      daily: 'POST /api/send-reminder with body: { "type": "daily" }',
      completion: 'POST /api/send-reminder with body: { "type": "completion" }'
    }
  });
} 