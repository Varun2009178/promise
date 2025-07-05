import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email field' }, { status: 400 });
    }

    // For now, just return success since the column doesn't exist
    // TODO: Add witness_email column to promises table
    console.log('Would set witness:', email, 'for user:', userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in witness endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // For now, return null since the column doesn't exist
    // TODO: Add witness_email column to promises table
    return NextResponse.json({ witnessEmail: null });
  } catch (error) {
    console.error('Error in witness endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 