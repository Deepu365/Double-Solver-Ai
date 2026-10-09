import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getDashboardStats } from '@/lib/supabase/data-service';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    const clientUserId = req.headers.get('x-user-id');
    const userId = authUser?.id || clientUserId || 'demo-user';

    const stats = await getDashboardStats(userId);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return NextResponse.json({ error: 'Failed to retrieve dashboard statistics.' }, { status: 500 });
  }
}
