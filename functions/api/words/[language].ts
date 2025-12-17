// Cloudflare Pages Function for Words API
// File: functions/api/words/[language].ts

interface Env {
  // Add any bindings here if needed in future
}

// This runs on Cloudflare's edge network
export async function onRequest(context: any): Promise<Response> {
  const { params, env, request } = context;
  const language = params.language;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Import words data - this works in Cloudflare Pages
    const wordsData = await import('../../../data/words-data.json');
    const allWords = wordsData.default || wordsData;
    
    // Get words for requested language
    const words = allWords[language as keyof typeof allWords];
    
    if (!words || !Array.isArray(words)) {
      return new Response(
        JSON.stringify({ 
          error: 'Language not found',
          message: `No words available for language: ${language}`,
          availableLanguages: Object.keys(allWords)
        }),
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }
    
    // Return words
    return new Response(
      JSON.stringify({
        words: words,
        language: language,
        total: words.length
      }),
      { 
        status: 200,
        headers: corsHeaders
      }
    );
    
  } catch (error: any) {
    console.error('Error loading words:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to load words',
        message: error.message 
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}