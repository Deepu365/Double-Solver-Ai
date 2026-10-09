import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getChatById, updateChatTitle, deleteChat } from '@/lib/supabase/data-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const chat = await getChatById(userId, id);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (err) {
    console.error('Error fetching chat details:', err);
    return NextResponse.json({ error: 'Failed to retrieve chat details.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'A valid title is required.' }, { status: 400 });
    }

    const success = await updateChatTitle(userId, id, title.trim());
    if (!success) {
      return NextResponse.json({ error: 'Chat not found or unable to update.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, title: title.trim() });
  } catch (err) {
    console.error('Error updating chat title:', err);
    return NextResponse.json({ error: 'Failed to update chat title.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const success = await deleteChat(userId, id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete chat.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting chat:', err);
    return NextResponse.json({ error: 'Failed to delete chat.' }, { status: 500 });
  }
}
