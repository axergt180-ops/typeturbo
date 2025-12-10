// Cloudflare Worker with D1 Database
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/words/:language
      if (path.match(/^\/api\/words\/\w+$/) && request.method === 'GET') {
        const language = path.split('/').pop();
        const count = parseInt(url.searchParams.get('count')) || 500;
        
        const words = await getWords(language, count, env);
        
        return new Response(JSON.stringify({
          language,
          count: words.length,
          words
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST /api/scores
      if (path === '/api/scores' && request.method === 'POST') {
        const body = await request.json();
        const { name, wpm, accuracy, language, correctWords, incorrectWords } = body;

        if (!name || !wpm || !accuracy || !language) {
          return new Response(JSON.stringify({ 
            error: 'Missing required fields' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await env.DB.prepare(
          `INSERT INTO scores (name, wpm, accuracy, language, correct_words, incorrect_words, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(name.trim(), wpm, accuracy, language, correctWords || 0, incorrectWords || 0).run();

        return new Response(JSON.stringify({
          message: 'Score saved successfully',
          id: result.meta.last_row_id
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET /api/leaderboard
      if (path === '/api/leaderboard' && request.method === 'GET') {
        const language = url.searchParams.get('language') || 'all';
        const limit = parseInt(url.searchParams.get('limit')) || 10;

        let query = `
          SELECT id, name, wpm, accuracy, language, correct_words, incorrect_words, 
                 created_at, date(created_at) as date
          FROM scores
        `;

        if (language !== 'all') {
          query += ` WHERE language = ?`;
        }

        query += ` ORDER BY wpm DESC, accuracy DESC LIMIT ?`;

        const stmt = language !== 'all' 
          ? env.DB.prepare(query).bind(language, limit)
          : env.DB.prepare(query).bind(limit);

        const { results } = await stmt.all();

        return new Response(JSON.stringify({
          language,
          total: results.length,
          leaderboard: results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET /api/stats
      if (path === '/api/stats' && request.method === 'GET') {
        const { results: totalScores } = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM scores'
        ).all();

        const { results: uniquePlayers } = await env.DB.prepare(
          'SELECT COUNT(DISTINCT name) as count FROM scores'
        ).all();

        const { results: topWPM } = await env.DB.prepare(
          'SELECT MAX(wpm) as max_wpm FROM scores'
        ).all();

        const { results: avgStats } = await env.DB.prepare(
          'SELECT AVG(wpm) as avg_wpm, AVG(accuracy) as avg_accuracy FROM scores'
        ).all();

        const stats = {
          totalScores: totalScores[0].count,
          totalPlayers: uniquePlayers[0].count,
          topWPM: topWPM[0].max_wpm || 0,
          averageWPM: Math.round(avgStats[0].avg_wpm || 0),
          averageAccuracy: Math.round(avgStats[0].avg_accuracy || 0)
        };

        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // DELETE /api/scores/:id
      if (path.match(/^\/api\/scores\/\d+$/) && request.method === 'DELETE') {
        const id = parseInt(path.split('/').pop());

        await env.DB.prepare('DELETE FROM scores WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({
          message: 'Score deleted successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Word lists helper function
async function getWords(language, count, env) {
  const wordLists = {
    indonesian: ['dan', 'yang', 'di', 'untuk', 'dengan', 'adalah', 'ini', 'itu', 'dari', 'pada', 'tidak', 'akan', 'ada', 'juga', 'atau', 'oleh', 'dapat', 'seperti', 'sudah', 'dalam', 'saya', 'kamu', 'dia', 'kami', 'mereka', 'apa', 'siapa', 'kapan', 'dimana', 'mengapa', 'bagaimana', 'bisa', 'harus', 'mau', 'ingin', 'suka', 'cinta', 'baik', 'buruk', 'besar', 'kecil', 'panjang', 'pendek', 'tinggi', 'rendah', 'cepat', 'lambat', 'baru', 'lama', 'muda', 'tua', 'kuat', 'lemah', 'pintar', 'bodoh', 'cantik', 'jelek', 'kaya', 'miskin', 'senang', 'sedih', 'marah', 'takut', 'berani', 'rajin', 'malas', 'sehat', 'sakit', 'hidup', 'mati', 'datang', 'pergi', 'masuk', 'keluar', 'naik', 'turun', 'buka', 'tutup', 'lihat', 'dengar', 'bicara', 'diam', 'tidur', 'bangun', 'makan', 'minum', 'kerja', 'main', 'belajar', 'ajar', 'rumah', 'sekolah', 'kantor', 'toko', 'pasar', 'jalan', 'mobil', 'motor', 'pesawat', 'kapal'],
    english: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'],
    spanish: ['que', 'de', 'no', 'a', 'la', 'el', 'es', 'y', 'en', 'lo', 'un', 'por', 'qué', 'me', 'una', 'te', 'los', 'se', 'con', 'para', 'mi', 'está', 'si', 'bien', 'pero', 'yo', 'eso', 'las', 'sí', 'su', 'tu', 'aquí', 'del', 'al', 'como', 'le', 'más', 'esto', 'ya', 'todo', 'esta', 'vamos', 'muy', 'hay', 'ahora', 'algo', 'estoy', 'tengo', 'nos', 'tú', 'nada', 'cuando', 'ha', 'este', 'soy', 'tiene', 'así', 'puede', 'son', 'dos', 'también', 'era', 'eres', 'vez', 'tienes', 'creo', 'ella', 'han', 'donde', 'porque', 'dios', 'quien', 'menos', 'debe', 'hacer', 'tiempo', 'ese', 'sobre', 'decir', 'uno', 'solo', 'hace', 'mucho', 'ser', 'año', 'estar', 'estos', 'día', 'ningún', 'sin'],
    french: ['de', 'le', 'et', 'à', 'un', 'être', 'pour', 'que', 'dans', 'ce', 'il', 'qui', 'ne', 'sur', 'se', 'pas', 'plus', 'par', 'je', 'avec', 'tout', 'faire', 'son', 'mettre', 'autre', 'on', 'mais', 'nous', 'comme', 'ou', 'si', 'leur', 'y', 'dire', 'elle', 'devoir', 'avant', 'deux', 'même', 'prendre', 'te', 'aussi', 'bien', 'où', 'sans', 'tu', 'là', 'va', 'voir', 'en', 'avoir', 'pouvoir', 'moi', 'celui', 'quelque', 'très', 'homme', 'après', 'aller', 'dont', 'jour', 'encore', 'vie', 'ça', 'alors', 'savoir', 'grand', 'donc', 'comment', 'venir', 'moins', 'main', 'peu', 'chose', 'toujours', 'sous', 'ans', 'jamais', 'monde', 'fois', 'donner', 'moment', 'trouver', 'vers', 'tous', 'pendant', 'enfant', 'temps', 'contre', 'français'],
    german: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'in', 'prozent', 'hatte', 'kann', 'gegen', 'vom', 'können', 'schon', 'wenn', 'habe', 'seine', 'mark', 'ihre', 'dann', 'unter', 'wir', 'soll', 'ich', 'eines', 'es', 'jahr', 'zwei', 'jahren', 'diese', 'dieser', 'wieder', 'keine', 'seinem', 'ob', 'dir', 'allen', 'seit', 'doch'],
    portuguese: ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele'],
    japanese: ['こと', 'もの', 'ある', 'いる', 'する', 'なる', 'この', 'その', 'ため', 'から', 'という', 'など', 'これ', 'それ', 'ここ', 'そこ', 'どこ', 'あれ', 'どれ', 'なに', 'だれ', 'いつ', 'どう', 'ない', 'ます', 'です', 'でき', 'みる', 'いく', 'くる', 'おく', 'もつ', 'つく', 'だす', 'とる', 'いう', 'みせ', 'ひと', 'とき', 'ところ', 'じぶん', 'てき', 'かた', 'ため', 'もと', 'よう', 'ちゃん', 'さん', 'くん', 'ちゃん', 'けど', 'でも', 'しかし', 'また', 'さらに', 'では', 'なら', 'それで', 'だから', 'そして', 'また', 'つまり', 'ただ', 'ただし', 'もし', 'たとえ', 'さて', 'では', 'じゃ', 'じゃあ', 'まあ', 'ええ', 'はい', 'いいえ', 'うん', 'ううん', 'そう', 'ちがう', 'ほんと', 'うそ']
  };

  const words = wordLists[language] || wordLists.indonesian;
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, words.length));
}