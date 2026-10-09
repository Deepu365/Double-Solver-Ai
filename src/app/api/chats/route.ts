import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getChats, createChat } from '@/lib/supabase/data-service';
import { SubjectType } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || undefined;

    const chats = await getChats(userId, search);
    return NextResponse.json({ chats });
  } catch (err) {
    console.error('Error fetching chats:', err);
    return NextResponse.json({ error: 'Failed to retrieve chat history.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const body = await req.json();
    const { title = 'New Chat', subject = 'General' } = body;

    const chat = await createChat(userId, title, subject as SubjectType);
    return NextResponse.json({ chat }, { status: 201 });
  } catch (err) {
    console.error('Error creating chat:', err);
    return NextResponse.json({ error: 'Failed to create new chat session.' }, { status: 500 });
  }
}
