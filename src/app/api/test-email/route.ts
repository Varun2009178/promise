import { NextRequest, NextResponse } from 'next/server';
import { sendGentleReminder, sendCompletionReminder } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    // Check if RESEND_API_KEY is set
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const { email, type, isCompleted = false } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ error: 'Missing email or type' }, { status: 400 });
    }

    console.log('Sending test email:', { email, type, isCompleted });
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

    const testData = {
      name: 'Test User',
      email,
      userId: 'test-user-id',
      promise: 'This is a test promise to verify the email design and functionality.',
      isCompleted
    };

    let emailResult;
    if (type === 'gentle') {
      console.log('Sending gentle reminder...');
      emailResult = await sendGentleReminder(testData);
      console.log('Gentle reminder result:', emailResult);
    } else if (type === 'completion') {
      console.log('Sending completion reminder...');
      emailResult = await sendCompletionReminder(testData);
      console.log('Completion reminder result:', emailResult);
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "gentle" or "completion"' }, { status: 400 });
    }

    console.log('Final email result:', emailResult);

    if (!emailResult) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email not sent (possibly already completed for gentle reminder)',
        emailResult,
        type,
        isCompleted
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} test email sent to ${email}`,
      emailResult,
      type,
      isCompleted
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 