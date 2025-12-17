// Cloudflare Pages Function for Leaderboard POST API
// File: functions/api/leaderboard/index.ts

interface Env {
  DB: D1Database;
}

export async function onRequest(context: any): Promise<Response> {
  const { env, request } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }
  
  try {
    const body = await request.json();
    const { name, wpm, accuracy, language } = body;
    
    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (typeof wpm !== 'number' || wpm < 0) {
      return new Response(
        JSON.stringify({ error: 'Valid WPM is required' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100) {
      return new Response(
        JSON.stringify({ error: 'Valid accuracy (0-100) is required' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (!language || typeof language !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Language is required' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Create score entry
    const scoreEntry = {
      name: name.trim().slice(0, 50),
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy),
      language: language,
      timestamp: new Date().toISOString()
    };
    
    // Save to D1 database
    if (!env.DB) {
      return new Response(
        JSON.stringify({
          error: 'Database not configured',
          message: 'D1 database binding not found'
        }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    await env.DB.prepare(
      'INSERT INTO leaderboard (name, wpm, accuracy, language, timestamp) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      scoreEntry.name,
      scoreEntry.wpm,
      scoreEntry.accuracy,
      scoreEntry.language,
      scoreEntry.timestamp
    ).run();
    
    return new Response(
      JSON.stringify({
        success: true,
        score: scoreEntry,
        message: 'Score saved successfully to database'
      }),
      { status: 200, headers: corsHeaders }
    );
    
  } catch (error: any) {
    console.error('Error saving score:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to save score',
        message: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}