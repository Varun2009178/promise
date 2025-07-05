import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      // Check specific email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        user,
        exists: !!user,
        email: email
      });
    } else {
      // Get all users (for debugging)
      const { data: users, error } = await supabase
      .from('users')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

    return NextResponse.json({ 
        users,
        count: users?.length || 0
    });
    }
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ 
      error: 'Failed to test database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
} 