import { NextRequest, NextResponse } from 'next/server';

// Enable Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

// In-memory storage for demo purposes
// In production, use a database like PostgreSQL, MongoDB, or Cloudflare D1
let leaderboardData: Record<string, any[]> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, wpm, accuracy, language } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (typeof wpm !== 'number' || wpm < 0) {
      return NextResponse.json(
        { error: 'Valid WPM is required' },
        { status: 400 }
      );
    }

    if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100) {
      return NextResponse.json(
        { error: 'Valid accuracy (0-100) is required' },
        { status: 400 }
      );
    }

    if (!language || typeof language !== 'string') {
      return NextResponse.json(
        { error: 'Language is required' },
        { status: 400 }
      );
    }

    // Initialize language array if not exists
    if (!leaderboardData[language]) {
      leaderboardData[language] = [];
    }

    // Create score entry
    const scoreEntry = {
      name: name.trim().slice(0, 50), // Limit name length
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy),
      language: language,
      timestamp: new Date().toISOString()
    };

    // Add to leaderboard
    leaderboardData[language].push(scoreEntry);

    // Keep only top 1000 scores per language to prevent memory issues
    if (leaderboardData[language].length > 1000) {
      leaderboardData[language] = leaderboardData[language]
        .sort((a, b) => {
          if (b.wpm !== a.wpm) return b.wpm - a.wpm;
          return b.accuracy - a.accuracy;
        })
        .slice(0, 1000);
    }

    return NextResponse.json({
      success: true,
      score: scoreEntry,
      message: 'Score saved successfully'
    });

  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}