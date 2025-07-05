import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
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

    const { data: promises, error } = await supabase
      .from('promises')
      .select('created_at, completed, promise_text')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the data for the growth chart
    const formattedPromises = promises.map(promise => ({
      date: promise.created_at,
      completed: promise.completed,
      promise_text: promise.promise_text
    }));

    return NextResponse.json({
      promises: formattedPromises
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 