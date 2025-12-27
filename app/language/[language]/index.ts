// functions/api/leaderboard/index.ts - POST handler for saving scores

interface Env {
  DB: D1Database;
}

interface ScoreRequest {
  name: string;
  wpm: number;
  accuracy: number;
  language: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS request (CORS preflight)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// Handle POST request (save score)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json() as ScoreRequest;
    const { name, wpm, accuracy, language } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!wpm || wpm < 0 || wpm > 300) {
      return new Response(
        JSON.stringify({ error: 'Invalid WPM value' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!accuracy || accuracy < 0 || accuracy > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid accuracy value' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!language) {
      return new Response(
        JSON.stringify({ error: 'Language is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert into database
    const timestamp = new Date().toISOString();
    
    const result = await env.DB.prepare(
      'INSERT INTO leaderboard (name, wpm, accuracy, language, timestamp) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      name.trim(),
      wpm,
      accuracy,
      language,
      timestamp
    ).run();

    console.log('Score saved:', { name, wpm, accuracy, language, timestamp });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Score saved successfully',
        data: {
          name: name.trim(),
          wpm,
          accuracy,
          language,
          timestamp
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error saving score:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to save score',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle GET request (for testing)
export async function onRequestGet(context: { request: Request; env: Env }) {
  return new Response(
    JSON.stringify({ 
      message: 'POST to this endpoint to save scores',
      endpoint: '/api/leaderboard',
      method: 'POST',
      body: {
        name: 'string (required)',
        wpm: 'number (0-300)',
        accuracy: 'number (0-100)',
        language: 'string (required)'
      }
    }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}