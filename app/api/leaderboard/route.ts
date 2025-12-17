import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, wpm, accuracy, language } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (typeof wpm !== 'number' || wpm < 0) {
      return NextResponse.json({ error: 'Valid WPM is required' }, { status: 400 });
    }

    if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100) {
      return NextResponse.json({ error: 'Valid accuracy (0-100) is required' }, { status: 400 });
    }

    if (!language || typeof language !== 'string') {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }

    // Create score entry
    const scoreEntry = {
      name: name.trim().slice(0, 50),
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy),
      language: language,
      timestamp: new Date().toISOString()
    };

    // Access D1 database from Cloudflare Pages environment
    // @ts-ignore - Cloudflare Pages D1 binding
    const DB = process.env.DB;

    if (DB) {
      try {
        // @ts-ignore
        await DB.prepare(
          'INSERT INTO leaderboard (name, wpm, accuracy, language, timestamp) VALUES (?, ?, ?, ?, ?)'
        ).bind(
          scoreEntry.name,
          scoreEntry.wpm,
          scoreEntry.accuracy,
          scoreEntry.language,
          scoreEntry.timestamp
        ).run();

        return NextResponse.json({
          success: true,
          score: scoreEntry,
          message: 'Score saved successfully to database'
        });
      } catch (dbError: any) {
        console.error('Database insert error:', dbError);
        return NextResponse.json({
          error: 'Database error',
          message: dbError.message
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        error: 'Database not configured',
        message: 'D1 database binding not found'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error saving score:', error);
    return NextResponse.json({ 
      error: 'Failed to save score',
      message: error.message 
    }, { status: 500 });
  }
}