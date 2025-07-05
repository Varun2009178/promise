import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const { promise_id } = await request.json();

    // First, mark the promise as completed in the database
    const { error: updateError } = await supabase
      .from('promises')
      .update({ 
        completed: true
      })
      .eq('id', promise_id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error marking promise as completed:', updateError);
      return NextResponse.json({ error: 'Failed to mark promise as completed' }, { status: 500 });
    }

    // Get the promise details for notifications
    const { data: promiseData, error: fetchError } = await supabase
      .from('promises')
      .select('promise_text, users!inner(name)')
      .eq('id', promise_id)
      .single();

    if (fetchError) {
      console.error('Error fetching promise details:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch promise details' }, { status: 500 });
    }

    const { promiseText, accountabilityPartners, witnessEmail, userName } = {
      promiseText: promiseData.promise_text,
      accountabilityPartners: [], // We'll implement this later if needed
      witnessEmail: null, // We'll implement this later if needed
      userName: promiseData.users.name
    };

    const notifications = [];

    // Notify accountability partners
    if (accountabilityPartners && accountabilityPartners.length > 0) {
      for (const partnerEmail of accountabilityPartners) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-reminder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: partnerEmail,
              subject: `${userName} completed their promise!`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Promise Completed! 🎉</h2>
                  <p><strong>${userName}</strong> has completed their promise:</p>
                  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-style: italic; margin: 0;">"${promiseText}"</p>
                  </div>
                  <p>Great job supporting them on their journey!</p>
                  <p>Keep being an amazing accountability partner!</p>
                </div>
              `
            })
          });

          if (response.ok) {
            notifications.push(`Notified ${partnerEmail}`);
          } else {
            console.error(`Failed to notify ${partnerEmail}`);
          }
        } catch (error) {
          console.error(`Error notifying ${partnerEmail}:`, error);
        }
      }
    }

    // Notify witness
    if (witnessEmail) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: witnessEmail,
            subject: `${userName} completed their promise - Witness Confirmation`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Promise Completed! 🎉</h2>
                <p><strong>${userName}</strong> has completed their promise:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="font-style: italic; margin: 0;">"${promiseText}"</p>
                </div>
                <p>As their witness, you can confirm this completion by replying to this email.</p>
                <p>Thank you for being part of their accountability journey!</p>
              </div>
            `
          })
        });

        if (response.ok) {
          notifications.push(`Notified witness ${witnessEmail}`);
        } else {
          console.error(`Failed to notify witness ${witnessEmail}`);
        }
      } catch (error) {
        console.error(`Error notifying witness ${witnessEmail}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      notifications,
      message: `Sent ${notifications.length} notification(s)`
    });
  } catch (error) {
    console.error('Error in notify-completion endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 