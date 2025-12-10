const API_URL = 'http://localhost:3000/api';

const languageConfig = {
  indonesian: { flag: '🇮🇩', name: 'Indonesian', display: 'Bahasa Indonesia' },
  english: { flag: '🇬🇧', name: 'English', display: 'English' },
  spanish: { flag: '🇪🇸', name: 'Spanish', display: 'Español' },
  french: { flag: '🇫🇷', name: 'French', display: 'Français' },
  german: { flag: '🇩🇪', name: 'German', display: 'Deutsch' },
  portuguese: { flag: '🇵🇹', name: 'Portuguese', display: 'Português' },
  japanese: { flag: '🇯🇵', name: 'Japanese', display: '日本語' }
};

class TypingTest {
  constructor() {
    this.words = [];
    this.currentWordIndex = 0;
    this.input = '';
    this.correctWords = 0;
    this.incorrectWords = 0;
    this.timeLeft = 60;
    this.isActive = false;
    this.isFinished = false;
    this.timer = null;
    
    // Get language from URL
    const path = window.location.pathname;
    const match = path.match(/\/language\/(\w+)/);
    this.language = match ? match[1] : 'indonesian';
    
    this.init();
  }

  init() {
    this.bindElements();
    this.updateLanguageDisplay();
    this.attachEventListeners();
    this.loadWords();
    this.loadLeaderboard();
  }

  bindElements() {
    this.elements = {
      languageFlag: document.getElementById('language-flag'),
      languageName: document.getElementById('language-name'),
      wordsDisplay: document.getElementById('words-display'),
      typingInput: document.getElementById('typing-input'),
      timerEl: document.getElementById('timer'),
      wpmEl: document.getElementById('wpm'),
      accuracyEl: document.getElementById('accuracy'),
      instructionEl: document.getElementById('instruction'),
      resetBtn: document.getElementById('reset-btn'),
      testArea: document.getElementById('test-area'),
      resultsScreen: document.getElementById('results-screen'),
      finalWpm: document.getElementById('final-wpm'),
      finalAccuracy: document.getElementById('final-accuracy'),
      finalCorrect: document.getElementById('final-correct'),
      finalIncorrect: document.getElementById('final-incorrect'),
      tryAgainBtn: document.getElementById('try-again-btn'),
      playerName: document.getElementById('player-name'),
      saveScoreBtn: document.getElementById('save-score-btn'),
      leaderboard: document.getElementById('leaderboard'),
      leaderboardLang: document.getElementById('leaderboard-lang')
    };
  }

  updateLanguageDisplay() {
    const config = languageConfig[this.language] || languageConfig.indonesian;
    if (this.elements.languageFlag) {
      this.elements.languageFlag.textContent = config.flag;
      this.elements.languageName.textContent = `${config.name} Typing Test`;
      this.elements.leaderboardLang.textContent = config.name;
    }
  }

  attachEventListeners() {
    this.elements.typingInput.addEventListener('input', (e) => this.handleInput(e));
    this.elements.resetBtn.addEventListener('click', () => this.reset());
    this.elements.tryAgainBtn.addEventListener('click', () => this.reset());
    this.elements.saveScoreBtn.addEventListener('click', () => this.saveScore());
  }

  async loadWords() {
    try {
      const response = await fetch(`${API_URL}/words/${this.language}?count=100`);
      const data = await response.json();
      this.words = data.words;
      this.displayWords();
    } catch (error) {
      console.error('Error loading words:', error);
    }
  }

  displayWords() {
    this.elements.wordsDisplay.innerHTML = this.words
      .map((word, i) => `<span class="${this.getWordClass(i)}" data-index="${i}">${word}</span>`)
      .join('');
  }

  getWordClass(index) {
    if (index < this.currentWordIndex) return 'text-green-400';
    if (index === this.currentWordIndex) return 'text-yellow-400 font-bold bg-yellow-400/20 px-2 py-1 rounded';
    return 'text-gray-300';
  }

  handleInput(e) {
    const value = e.target.value;
    
    if (!this.isActive && value.length > 0) {
      this.startTest();
    }

    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      if (typedWord === this.words[this.currentWordIndex]) {
        this.correctWords++;
      } else {
        this.incorrectWords++;
      }
      this.currentWordIndex++;
      this.elements.typingInput.value = '';
      this.displayWords();
      this.updateStats();
    }
  }

  startTest() {
    this.isActive = true;
    this.elements.instructionEl.textContent = 'Type the words above, press space after each word';
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.elements.timerEl.textContent = `${this.timeLeft}s`;
      
      if (this.timeLeft <= 0) {
        this.finishTest();
      }
    }, 1000);
  }

  updateStats() {
    const wpm = this.calculateWPM();
    const accuracy = this.calculateAccuracy();
    
    this.elements.wpmEl.textContent = wpm;
    this.elements.accuracyEl.textContent = `${accuracy}%`;
  }

  calculateWPM() {
    const timeElapsed = 60 - this.timeLeft;
    if (timeElapsed === 0) return 0;
    return Math.round((this.correctWords / timeElapsed) * 60);
  }

  calculateAccuracy() {
    const total = this.correctWords + this.incorrectWords;
    if (total === 0) return 100;
    return Math.round((this.correctWords / total) * 100);
  }

  finishTest() {
    clearInterval(this.timer);
    this.isActive = false;
    this.isFinished = true;
    this.elements.typingInput.disabled = true;
    
    this.showResults();
  }

  showResults() {
    this.elements.testArea.classList.add('hidden');
    this.elements.resultsScreen.classList.remove('hidden');
    
    this.elements.finalWpm.textContent = this.calculateWPM();
    this.elements.finalAccuracy.textContent = `${this.calculateAccuracy()}%`;
    this.elements.finalCorrect.textContent = this.correctWords;
    this.elements.finalIncorrect.textContent = this.incorrectWords;
  }

  async saveScore() {
    const name = this.elements.playerName.value.trim();
    if (!name) {
      alert('Please enter your name!');
      return;
    }

    const scoreData = {
      name,
      wpm: this.calculateWPM(),
      accuracy: this.calculateAccuracy(),
      language: this.language,
      correctWords: this.correctWords,
      incorrectWords: this.incorrectWords
    };

    try {
      await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      });
      
      alert('Score saved successfully! 🎉');
      this.loadLeaderboard();
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Failed to save score');
    }
  }

  async loadLeaderboard() {
    try {
      const response = await fetch(`${API_URL}/leaderboard?language=${this.language}&limit=10`);
      const data = await response.json();
      
      this.elements.leaderboard.innerHTML = data.leaderboard.length > 0
        ? data.leaderboard.map((score, i) => `
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <div class="flex items-center gap-3">
                <span class="text-2xl">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                <span class="font-semibold">${score.name}</span>
              </div>
              <div class="flex gap-4 text-sm">
                <span class="text-green-400 font-bold">${score.wpm} WPM</span>
                <span class="text-gray-400">${score.accuracy}%</span>
              </div>
            </div>
          `).join('')
        : '<p class="text-center text-gray-400">No scores yet. Be the first!</p>';
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }

  reset() {
    clearInterval(this.timer);
    this.currentWordIndex = 0;
    this.correctWords = 0;
    this.incorrectWords = 0;
    this.timeLeft = 60;
    this.isActive = false;
    this.isFinished = false;
    
    this.elements.typingInput.value = '';
    this.elements.typingInput.disabled = false;
    this.elements.timerEl.textContent = '60s';
    this.elements.wpmEl.textContent = '0';
    this.elements.accuracyEl.textContent = '100%';
    this.elements.instructionEl.textContent = 'Start typing to begin the timer';
    this.elements.playerName.value = '';
    
    this.elements.testArea.classList.remove('hidden');
    this.elements.resultsScreen.classList.add('hidden');
    
    this.loadWords();
    this.elements.typingInput.focus();
  }
}

// Initialize app
new TypingTest();