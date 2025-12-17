import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string }> }
) {
  const { language } = await params;

  try {
    // Access D1 database from Cloudflare Pages environment
    // @ts-ignore - Cloudflare Pages D1 binding
    const DB = process.env.DB;

    if (DB) {
      try {
        // @ts-ignore
        const { results } = await DB.prepare(
          'SELECT name, wpm, accuracy, timestamp FROM leaderboard WHERE language = ? ORDER BY wpm DESC, accuracy DESC LIMIT 100'
        ).bind(language).all();

        return NextResponse.json({
          scores: results,
          language: language,
          total: results.length
        });
      } catch (dbError: any) {
        console.error('Database query error:', dbError);
        return NextResponse.json({
          error: 'Database query failed',
          message: dbError.message,
          scores: [],
          language: language,
          total: 0
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        error: 'Database not configured',
        message: 'D1 database binding not found',
        scores: [],
        language: language,
        total: 0
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({
      error: 'Failed to fetch leaderboard',
      message: error.message,
      scores: [],
      language: language,
      total: 0
    }, { status: 500 });
  }
}