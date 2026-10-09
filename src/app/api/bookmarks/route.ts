import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getBookmarks, toggleBookmark } from '@/lib/supabase/data-service';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const bookmarks = await getBookmarks(userId);
    return NextResponse.json({ bookmarks });
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    return NextResponse.json({ error: 'Failed to retrieve bookmarks.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const body = await req.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
    }

    const result = await toggleBookmark(userId, messageId);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error toggling bookmark:', err);
    return NextResponse.json({ error: 'Failed to toggle bookmark.' }, { status: 500 });
  }
}
