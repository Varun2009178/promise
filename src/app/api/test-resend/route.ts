import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Testing Resend with email:', email);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

    // Simple test email
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Test Email from Promise App',
      html: '<h1>Test Email</h1><p>If you receive this, Resend is working correctly!</p>'
    });

    console.log('Resend result:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      result
    });

  } catch (error) {
    console.error('Resend test error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 