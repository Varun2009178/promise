import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const { partnerEmail, promise, userId } = await request.json();

    if (!partnerEmail || !promise || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user data for the invitation
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Store the invitation in the database
    const { data: invitationData, error: invitationError } = await supabase
      .from('accountability_invitations')
      .insert({
        user_id: userId,
        partner_email: partnerEmail.toLowerCase().trim(),
        promise_text: promise,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    // Send invitation email
    try {
      const { sendPartnerInvitation } = await import('@/lib/resend');
      await sendPartnerInvitation({
        partnerEmail: partnerEmail.toLowerCase().trim(),
        userName: userData.name,
        userEmail: userData.email,
        promise,
        invitationId: invitationData.id,
      });
      console.log('Partner invitation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send partner invitation email:', emailError);
      // Continue even if email fails - don't break the invitation process
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      invitation: invitationData
    });

  } catch (error) {
    console.error('Error in invite partner endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // Get pending invitations for the user
    const { data: invitations, error } = await supabase
      .from('accountability_invitations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    console.error('Error in invite partner endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 