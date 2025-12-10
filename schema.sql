CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  language TEXT NOT NULL,
  correct_words INTEGER DEFAULT 0,
  incorrect_words INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wpm ON scores(wpm DESC);
CREATE INDEX IF NOT EXISTS idx_language ON scores(language);
CREATE INDEX IF NOT EXISTS idx_created_at ON scores(created_at DESC);