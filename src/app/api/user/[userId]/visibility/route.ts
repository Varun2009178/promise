import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const { visibility } = await request.json();

    if (!visibility) {
      return NextResponse.json({ error: 'Missing visibility field' }, { status: 400 });
    }

    // Validate visibility value
    if (!['private', 'witness', 'public'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 });
    }

    // For now, just return success since the column doesn't exist
    // TODO: Add visibility column to promises table
    console.log('Would set visibility:', visibility, 'for user:', userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in visibility endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // For now, return 'private' since the column doesn't exist
    // TODO: Add visibility column to promises table
    return NextResponse.json({ visibility: 'private' });
  } catch (error) {
    console.error('Error in visibility endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 