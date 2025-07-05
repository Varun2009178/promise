import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current uncompleted promise
    const { data: currentPromise, error: currentPromiseError } = await supabase
      .from('promises')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (currentPromiseError && currentPromiseError.code !== 'PGRST116') {
      console.error('Error fetching current promise:', currentPromiseError);
    }

    // Get most recent promise (for 24-hour restriction)
    const { data: mostRecentPromise, error: mostRecentError } = await supabase
      .from('promises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (mostRecentError && mostRecentError.code !== 'PGRST116') {
      console.error('Error fetching most recent promise:', mostRecentError);
    }

    // Calculate time left if there's a current promise
    let timeLeft = 0;
    if (currentPromise) {
      // Use target_date if it exists, otherwise calculate from created_at
      let targetTime;
      if (currentPromise.target_date) {
        targetTime = new Date(currentPromise.target_date).getTime();
      } else {
        // Fallback: 24 hours from creation
        targetTime = new Date(currentPromise.created_at).getTime() + (24 * 60 * 60 * 1000);
      }
      const now = Date.now();
      timeLeft = Math.max(0, targetTime - now);
    }

    const responseData = {
      name: userData.name,
      email: userData.email,
      reminder_time: userData.reminder_time,
      current_promise: currentPromise || null,
      most_recent_promise: mostRecentPromise || null,
      timeLeft
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in user endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // First get the most recent uncompleted promise
    const { data: promiseData, error: fetchError } = await supabase
      .from('promises')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) throw fetchError;
    
    // Then update only that specific promise
    const { error: updateError } = await supabase
      .from('promises')
      .update({ completed: body.completed })
      .eq('id', promiseData.id)
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Add PATCH method to update user preferences like reminder time
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const body = await request.json();
    const { completed, completed_at, reminder_time, promise_text, target_date, is_eco_friendly, witness_email, visibility } = body;

    // Update user reminder time
    if (reminder_time) {
      const { error: userError } = await supabase
        .from('users')
        .update({ reminder_time })
        .eq('id', params.userId);

      if (userError) {
        console.error('Error updating user reminder time:', userError);
        return NextResponse.json({ error: 'Failed to update reminder time' }, { status: 500 });
      }
    }

    // Update promise
    if (completed !== undefined || completed_at || promise_text || target_date || is_eco_friendly !== undefined || witness_email || visibility) {
      const updateData: any = {};
      
      if (completed !== undefined) updateData.completed = completed;
      if (completed_at) updateData.completed_at = completed_at;
      if (promise_text) updateData.promise_text = promise_text;
      if (target_date) updateData.target_date = target_date;
      if (is_eco_friendly !== undefined) updateData.is_eco_friendly = is_eco_friendly;
      if (witness_email !== undefined) updateData.witness_email = witness_email;
      if (visibility) updateData.visibility = visibility;
      
      updateData.updated_at = new Date().toISOString();

      const { error: promiseError } = await supabase
        .from('promises')
        .update(updateData)
        .eq('user_id', params.userId)
        .is('completed_at', null);

      if (promiseError) {
        console.error('Error updating promise:', promiseError);
        return NextResponse.json({ error: 'Failed to update promise' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in user endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { promise_text, target_date, is_eco_friendly, witness_email, visibility } = await request.json();

    if (!promise_text || !target_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new promise
    const { data, error } = await supabase
      .from('promises')
      .insert({
        user_id: params.userId,
        promise_text,
        target_date,
        is_eco_friendly: is_eco_friendly || false,
        witness_email,
        visibility: visibility || 'private',
        created_at: new Date().toISOString(),
        completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promise:', error);
      return NextResponse.json({ error: 'Failed to create promise' }, { status: 500 });
    }

    return NextResponse.json({ success: true, promise: data });
  } catch (error) {
    console.error('Error in user endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 