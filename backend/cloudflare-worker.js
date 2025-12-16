// Cloudflare Workers API with D1 Database Integration
// Deploy: wrangler deploy

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Handle CORS preflight
function handleOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

// Main router
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Route: GET /api/words/:language
    if (path.match(/^\/api\/words\/\w+$/)) {
      const language = path.split('/').pop();
      
      return new Response(
        JSON.stringify({
          error: 'Words endpoint not needed in Worker',
          message: 'Use Next.js API for words: /api/words/' + language
        }),
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Route: POST /api/leaderboard
    if (path === '/api/leaderboard' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { name, wpm, accuracy, language } = body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return new Response(
            JSON.stringify({ error: 'Name is required' }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        if (typeof wpm !== 'number' || wpm < 0) {
          return new Response(
            JSON.stringify({ error: 'Valid WPM is required' }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100) {
          return new Response(
            JSON.stringify({ error: 'Valid accuracy (0-100) is required' }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        if (!language || typeof language !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Language is required' }),
            { status: 400, headers: CORS_HEADERS }
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
        if (env.DB) {
          try {
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
              { headers: CORS_HEADERS }
            );
          } catch (dbError) {
            console.error('Database insert error:', dbError);
            return new Response(
              JSON.stringify({
                error: 'Database error',
                message: dbError.message
              }),
              { status: 500, headers: CORS_HEADERS }
            );
          }
        } else {
          return new Response(
            JSON.stringify({
              error: 'Database not configured',
              message: 'D1 database binding not found'
            }),
            { status: 500, headers: CORS_HEADERS }
          );
        }

      } catch (error) {
        console.error('Error saving score:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to save score',
            message: error.message 
          }),
          { status: 500, headers: CORS_HEADERS }
        );
      }
    }

    // Route: GET /api/leaderboard/:language
    if (path.match(/^\/api\/leaderboard\/\w+$/)) {
      const language = path.split('/').pop();

      try {
        // Fetch from D1 database
        if (env.DB) {
          try {
            const { results } = await env.DB.prepare(
              'SELECT name, wpm, accuracy, timestamp FROM leaderboard WHERE language = ? ORDER BY wpm DESC, accuracy DESC LIMIT 100'
            ).bind(language).all();

            return new Response(
              JSON.stringify({
                scores: results,
                language: language,
                total: results.length
              }),
              { headers: CORS_HEADERS }
            );
          } catch (dbError) {
            console.error('Database query error:', dbError);
            return new Response(
              JSON.stringify({
                error: 'Database query failed',
                message: dbError.message,
                scores: [],
                language: language,
                total: 0
              }),
              { status: 500, headers: CORS_HEADERS }
            );
          }
        } else {
          return new Response(
            JSON.stringify({
              error: 'Database not configured',
              message: 'D1 database binding not found',
              scores: [],
              language: language,
              total: 0
            }),
            { status: 500, headers: CORS_HEADERS }
          );
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch leaderboard',
            message: error.message,
            scores: [],
            language: language,
            total: 0
          }),
          { status: 500, headers: CORS_HEADERS }
        );
      }
    }

    // Root endpoint - API info
    if (path === '/' || path === '/api') {
      return new Response(
        JSON.stringify({
          name: 'Typemeteor API',
          version: '1.0.0',
          endpoints: {
            'POST /api/leaderboard': 'Save a typing test score',
            'GET /api/leaderboard/:language': 'Get leaderboard for a language'
          },
          database: env.DB ? 'Connected' : 'Not configured'
        }),
        { headers: CORS_HEADERS }
      );
    }

    // 404 for other routes
    return new Response(
      JSON.stringify({ 
        error: 'Not Found', 
        path: path,
        message: 'Endpoint not found. Available endpoints: POST /api/leaderboard, GET /api/leaderboard/:language'
      }),
      { status: 404, headers: CORS_HEADERS }
    );
  }
};