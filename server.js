const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database file path
const DB_FILE = path.join(__dirname, 'database.json');
const DATA_FOLDER = path.join(__dirname, 'data');

// Initialize database
async function initDatabase() {
  try {
    await fs.access(DB_FILE);
  } catch {
    const initialData = {
      scores: [],
      lastId: 0
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('✅ Database initialized');
  }
}

// Read database
async function readDatabase() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { scores: [], lastId: 0 };
  }
}

// Write database
async function writeDatabase(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
}

// Load words from data folder
async function loadWordsFromFile(language) {
  try {
    const filePath = path.join(DATA_FOLDER, `${language}.js`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Extract array from export statement
    const match = fileContent.match(/export const \w+Words = (\[[\s\S]*?\]);/);
    if (match) {
      const wordsArray = eval(match[1]);
      return wordsArray;
    }
    
    return [];
  } catch (error) {
    console.error(`Error loading words for ${language}:`, error);
    return [];
  }
}

// API Routes

// GET /api/words/:language - Ambil kata-kata dari file
app.get('/api/words/:language', async (req, res) => {
  const { language } = req.params;
  const count = parseInt(req.query.count) || 500;
  
  try {
    const words = await loadWordsFromFile(language);
    
    if (words.length === 0) {
      return res.status(404).json({ 
        error: 'Language not found or no words available'
      });
    }
    
    // Shuffle dan ambil sejumlah kata
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, Math.min(count, words.length));
    
    res.json({
      language,
      count: selectedWords.length,
      words: selectedWords
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load words' });
  }
});

// POST /api/scores - Simpan skor baru
app.post('/api/scores', async (req, res) => {
  try {
    const { name, wpm, accuracy, language, correctWords, incorrectWords } = req.body;
    
    if (!name || !wpm || !accuracy || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, wpm, accuracy, language' 
      });
    }
    
    const db = await readDatabase();
    
    const newScore = {
      id: ++db.lastId,
      name: name.trim(),
      wpm: parseInt(wpm),
      accuracy: parseInt(accuracy),
      language,
      correctWords: correctWords || 0,
      incorrectWords: incorrectWords || 0,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('id-ID')
    };
    
    db.scores.push(newScore);
    await writeDatabase(db);
    
    console.log(`✅ New score saved: ${name} - ${wpm} WPM (${language})`);
    
    res.status(201).json({
      message: 'Score saved successfully',
      score: newScore
    });
    
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// GET /api/leaderboard - Ambil leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { language, limit = 10 } = req.query;
    
    const db = await readDatabase();
    let scores = [...db.scores];
    
    if (language && language !== 'all') {
      scores = scores.filter(s => s.language === language);
    }
    
    scores.sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    });
    
    const limitNum = parseInt(limit);
    const topScores = scores.slice(0, limitNum);
    
    res.json({
      language: language || 'all',
      total: scores.length,
      leaderboard: topScores
    });
    
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// GET /api/stats - Statistik umum
app.get('/api/stats', async (req, res) => {
  try {
    const db = await readDatabase();
    
    const stats = {
      totalScores: db.scores.length,
      totalPlayers: new Set(db.scores.map(s => s.name)).size,
      topWPM: 0,
      averageWPM: 0,
      averageAccuracy: 0
    };
    
    if (db.scores.length > 0) {
      stats.topWPM = Math.max(...db.scores.map(s => s.wpm));
      stats.averageWPM = Math.round(
        db.scores.reduce((sum, s) => sum + s.wpm, 0) / db.scores.length
      );
      stats.averageAccuracy = Math.round(
        db.scores.reduce((sum, s) => sum + s.accuracy, 0) / db.scores.length
      );
    }
    
    res.json(stats);
    
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// DELETE /api/scores/:id - Hapus skor
app.delete('/api/scores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDatabase();
    
    const index = db.scores.findIndex(s => s.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Score not found' });
    }
    
    const deleted = db.scores.splice(index, 1)[0];
    await writeDatabase(db);
    
    console.log(`🗑️  Score deleted: ${deleted.name} - ${deleted.wpm} WPM`);
    
    res.json({
      message: 'Score deleted successfully',
      deleted
    });
    
  } catch (error) {
    console.error('Error deleting score:', error);
    res.status(500).json({ error: 'Failed to delete score' });
  }
});

// Serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/language/:lang', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'typing-test.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║                                        ║
║   🚀 TYPEMETEOR BACKEND RUNNING        ║
║                                        ║
║   Server: http://localhost:${PORT}      ║
║   API:    http://localhost:${PORT}/api ║
║                                        ║
║   Available Endpoints:                 ║
║   GET  /api/words/:language            ║
║   POST /api/scores                     ║
║   GET  /api/leaderboard                ║
║   GET  /api/stats                      ║
║                                        ║
╚════════════════════════════════════════╝
    `);
  });
}

startServer();