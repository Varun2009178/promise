import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: { invitationId: string } }) {
  try {
    // Update invitation status to accepted
    const { data: invitation, error: updateError } = await supabase
      .from('accountability_invitations')
      .update({ status: 'accepted' })
      .eq('id', params.invitationId)
      .select(`
        *,
        user:users(name, email)
      `)
      .single();

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
    }

    // Send notification email to the user who sent the invitation
    try {
      const { sendInvitationAccepted } = await import('@/lib/resend');
      await sendInvitationAccepted({
        userEmail: invitation.user.email,
        userName: invitation.user.name,
        partnerEmail: invitation.partner_email,
        promise: invitation.promise_text,
      });
      console.log('Acceptance notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send acceptance notification email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation accepted successfully',
      invitation 
    });

  } catch (error) {
    console.error('Error in accept invitation endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 