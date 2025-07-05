import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const { invitationId } = await params;
  try {
    // Update invitation status to declined
    const { data: invitation, error: updateError } = await supabase
      .from('accountability_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId)
      .select(`
        *,
        user:users(name, email)
      `)
      .single();

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 });
    }

    // Send notification email to the user who sent the invitation
    try {
      const { sendInvitationDeclined } = await import('@/lib/resend');
      await sendInvitationDeclined({
        userEmail: invitation.user.email,
        userName: invitation.user.name,
        partnerEmail: invitation.partner_email,
        promise: invitation.promise_text,
      });
      console.log('Decline notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send decline notification email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation declined successfully',
      invitation 
    });

  } catch (error) {
    console.error('Error in decline invitation endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 