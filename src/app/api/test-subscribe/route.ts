import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, name, promise, isEcoFriendly, reminderTime } = await request.json();

    console.log('Test subscribe request:', { email, name, promise, isEcoFriendly, reminderTime });

    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed',
        details: testError.message
      }, { 
        status: 500 
      });
    }

    console.log('Database connection successful');

    // Test user creation
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
      console.error('User creation failed:', userError);
      return NextResponse.json({ 
        success: false, 
        error: 'User creation failed',
        details: userError.message
      }, { 
        status: 500 
      });
    }

    console.log('User created successfully:', userData);

    // Test promise creation
    const { data: promiseData, error: promiseError } = await supabase
      .from('promises')
      .insert({
        user_id: userData.id,
        promise_text: promise,
        created_at: new Date().toISOString(),
        completed: false,
      })
      .select()
      .single();

    if (promiseError) {
      console.error('Promise creation failed:', promiseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Promise creation failed',
        details: promiseError.message
      }, { 
        status: 500 
      });
    }

    console.log('Promise created successfully:', promiseData);

    return NextResponse.json({ 
      success: true, 
      userId: userData.id,
      message: 'Test subscription successful' 
    });

  } catch (error) {
    console.error('Test subscription error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
} 