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

    // For now, just return success since the table doesn't exist
    // TODO: Create accountability_partners table in database
    console.log('Would add accountability partner:', email, 'for user:', params.userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in accountability endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email field' }, { status: 400 });
    }

    // For now, just return success since the table doesn't exist
    console.log('Would remove accountability partner:', email, 'for user:', params.userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in accountability endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // For now, return empty array since the table doesn't exist
    // TODO: Create accountability_partners table in database
    return NextResponse.json({ partners: [] });
  } catch (error) {
    console.error('Error in accountability endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 