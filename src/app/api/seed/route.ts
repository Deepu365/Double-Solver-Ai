import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { seedUserData } from '@/lib/supabase/data-service';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const success = await seedUserData(userId);
    return NextResponse.json({ success, message: 'Sample engineering doubts successfully loaded.' });
  } catch (err) {
    console.error('Error seeding data:', err);
    return NextResponse.json({ error: 'Failed to seed sample doubts.' }, { status: 500 });
  }
}
