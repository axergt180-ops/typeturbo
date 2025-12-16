import { NextRequest, NextResponse } from 'next/server';

// Enable Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// In-memory storage for demo purposes
// In production, use a database like PostgreSQL, MongoDB, or Cloudflare D1
let leaderboardData: Record<string, any[]> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string }> }  // ← Changed to Promise
) {
  // Await params (Next.js 15+ requirement)
  const { language } = await params;

  // Get scores for this language, sorted by WPM desc, then accuracy desc
  const scores = (leaderboardData[language] || [])
    .sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    })
    .slice(0, 100); // Top 100 scores

  return NextResponse.json({
    scores: scores,
    language: language,
    total: scores.length
  });
}