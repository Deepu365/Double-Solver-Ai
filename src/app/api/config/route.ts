import { NextResponse } from 'next/server';

export async function GET() {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return NextResponse.json({
    hasGroqKey,
    hasSupabase,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  });
}
