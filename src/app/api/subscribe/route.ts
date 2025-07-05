import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Extract reminder time from request body
    const { email, name, promise, userId, isEcoFriendly, reminderTime } = await request.json();

    console.log('Subscribe request:', { email, name, promise, userId, isEcoFriendly, reminderTime });

    // If userId is provided, create a new promise for existing user
    if (userId) {
      const { data: promiseData, error: promiseError } = await supabase
        .from('promises')
        .insert({
          user_id: userId,
          promise_text: promise,
          created_at: new Date().toISOString(),
          completed: false,
          is_eco_friendly: isEcoFriendly || false,
        })
        .select()
        .single();

      if (promiseError) {
        console.error('Error creating promise for existing user:', promiseError);
        throw promiseError;
      }

      return NextResponse.json({ 
        success: true, 
        userId,
        message: 'New promise created' 
      });
    }

    // First check if user exists by email
    console.log('Checking for existing user with email:', email);
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUserError) {
      console.error('Error checking existing user:', existingUserError);
      throw existingUserError;
    }

    console.log('Existing user check result:', existingUser);

    if (existingUser) {
      // User already exists - return error instead of creating new promise
      console.log('User already exists:', existingUser);
      return NextResponse.json({ 
        success: false, 
        error: 'USER_EXISTS',
        message: `An account with this email already exists. Please log in to continue with your existing account.` 
      }, { 
        status: 409 
      });
    }

    // New user, create account and promise
    console.log('Creating new user...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        reminder_time: reminderTime || 'morning',
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      
      // Check if it's a duplicate key error
      if (userError.code === '23505' || userError.message.includes('duplicate')) {
        return NextResponse.json({ 
          success: false, 
          error: 'USER_EXISTS',
          message: 'An account with this email already exists. Please log in to continue with your existing account.' 
        }, { 
          status: 409 
        });
      }
      
      throw userError;
    }

    console.log('User created successfully:', userData);

    // Insert the promise
    const promiseData: any = {
      user_id: userData.id,
      promise_text: promise,
      created_at: new Date().toISOString(),
      completed: false,
    };

    // Add optional fields if they exist
    if (isEcoFriendly !== null && isEcoFriendly !== undefined) {
      promiseData.is_eco_friendly = isEcoFriendly;
    }

    const { data: promiseResult, error: promiseError } = await supabase
      .from('promises')
      .insert(promiseData)
      .select()
      .single();

    if (promiseError) {
      console.error('Error creating promise:', promiseError);
      
      // Check if it's a missing column error
      if (promiseError.message.includes('is_eco_friendly') || promiseError.code === 'PGRST204') {
        console.log('Missing column detected, trying without eco-friendly field...');
        
        // Try again without the eco-friendly field
        const { data: fallbackPromise, error: fallbackError } = await supabase
      .from('promises')
      .insert({
        user_id: userData.id,
        promise_text: promise,
        created_at: new Date().toISOString(),
        completed: false,
      })
      .select()
      .single();

        if (fallbackError) {
          console.error('Fallback promise creation also failed:', fallbackError);
          throw fallbackError;
        }

        console.log('Promise created successfully (without eco-friendly):', fallbackPromise);
      } else {
        throw promiseError;
      }
    } else {
      console.log('Promise created successfully:', promiseResult);
    }

    // Try to send welcome email, but don't let it break the account creation
    try {
      const { sendWelcomeEmail } = await import('@/lib/resend');
      await sendWelcomeEmail({
        name,
        email,
        userId: userData.id,
        promise,
      });
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if email fails - don't break account creation
    }

    return NextResponse.json({ 
      success: true, 
      userId: userData.id,
      message: 'Subscription successful' 
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
} 