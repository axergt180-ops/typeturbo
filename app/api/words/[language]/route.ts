import { NextRequest, NextResponse } from 'next/server';
import wordsData from '@/data/words-data.json';

// Enable Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string }> }  // ← Changed to Promise
) {
  // Await params (Next.js 15+ requirement)
  const { language } = await params;
  
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '200');

  // Check if language exists
  if (!wordsData[language as keyof typeof wordsData]) {
    return NextResponse.json(
      { error: 'Language not found', requested: language },
      { status: 404 }
    );
  }

  const words = wordsData[language as keyof typeof wordsData];
  
  // Return requested number of words
  const selectedWords = words.slice(0, Math.min(count, words.length));

  return NextResponse.json({
    words: selectedWords,
    language: language,
    total: words.length
  });
}