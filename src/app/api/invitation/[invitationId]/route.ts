import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const { invitationId } = await params;
  try {
    const { data: invitation, error } = await supabase
      .from('accountability_invitations')
      .select(`
        *,
        user:users(name, email)
      `)
      .eq('id', invitationId)
      .single();

    if (error) {
      console.error('Error fetching invitation:', error);
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error in invitation endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 