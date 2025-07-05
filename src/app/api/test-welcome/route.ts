import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/resend';

export async function GET() {
  try {
    await sendWelcomeEmail({
      name: 'Test User',
      email: 'delivered@resend.dev',
      userId: 'test-user-id',
      promise: 'I will spend 30 minutes reading today'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    });
  } catch (error) {
    console.error('Welcome email test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send welcome email' 
    }, { 
      status: 500 
    });
  }
} 