'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Types
interface TypingStats {
  correctWords: number;
  incorrectWords: number;
  timeLeft: number;
  wpm: number;
  accuracy: number;
}

interface TypedWord {
  original: string;
  isCorrect: boolean;
  justCompleted?: boolean;
}

interface LanguageConfig {
  flag: string;
  name: string;
  display: string;
}

const languageConfig: Record<string, LanguageConfig> = {
  indonesian: { flag: '/flags/indonesia.png', name: 'Indonesian', display: 'Bahasa Indonesia' },
  english: { flag: '/flags/english.png', name: 'English', display: 'English' },
  spanish: { flag: '/flags/espanol.png', name: 'Spanish', display: 'Español' },
  french: { flag: '/flags/francais.png', name: 'French', display: 'Français' },
  german: { flag: '/flags/deutsch.png', name: 'German', display: 'Deutsch' },
  portuguese: { flag: '/flags/portugues.png', name: 'Portuguese', display: 'Português' },
  japanese: { flag: '/flags/japan.png', name: 'Japanese', display: '日本語' },
  italian: { flag: '/flags/italian.png', name: 'Italian', display: 'Italiano' },
  russian: { flag: '/flags/russian.png', name: 'Russian', display: 'Русский' },
  korean: { flag: '/flags/korean.png', name: 'Korean', display: '한국어' },
  chinese: { flag: '/flags/chinese.png', name: 'Chinese', display: '中文' },
  arabic: { flag: '/flags/arabic.png', name: 'Arabic', display: 'العربية' },
  dutch: { flag: '/flags/dutch.png', name: 'Dutch', display: 'Nederlands' },
  turkish: { flag: '/flags/turkish.png', name: 'Turkish', display: 'Türkçe' },
  thai: { flag: '/flags/thai.png', name: 'Thai', display: 'ไทย' },
  vietnamese: { flag: '/flags/vietnamese.png', name: 'Vietnamese', display: 'Tiếng Việt' },
  hindi: { flag: '/flags/hindi.png', name: 'Hindi', display: 'हिन्दी' }
};

export default function TypingTestPage() {
  const params = useParams();
  const router = useRouter();
  const language = params?.language as string || 'indonesian';
  
  // States
  const [words, setWords] = useState<string[]>([]);
  const [allWords, setAllWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [typedWords, setTypedWords] = useState<Record<number, TypedWord>>({});
  const [stats, setStats] = useState<TypingStats>({
    correctWords: 0,
    incorrectWords: 0,
    timeLeft: 60,
    wpm: 0,
    accuracy: 100
  });
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [currentVisibleRow, setCurrentVisibleRow] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const config = languageConfig[language];

  // Load words on mount
  useEffect(() => {
    if (!config) {
      router.push('/');
      return;
    }
    loadWords();
    loadLeaderboard();
  }, [language]);

  // Timer effect
  useEffect(() => {
    if (isActive && stats.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setStats(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            finishTest();
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, stats.timeLeft]);

  // Use local API for words, Cloudflare for leaderboard
  const wordsApiUrl = process.env.NEXT_PUBLIC_WORDS_API_URL || 'http://localhost:3000/api';
  const leaderboardApiUrl = process.env.NEXT_PUBLIC_TYPEMETEOR_API_URL || 'https://typemeteor.kikomik.workers.dev/api';

  const loadWords = async () => {
    try {
      const response = await fetch(`${wordsApiUrl}/words/${language}?count=500`);
      const data = await response.json();
      
      if (data.words && data.words.length > 0) {
        setAllWords(data.words);
        generateWords(data.words);
      }
    } catch (error) {
      console.error('Error loading words:', error);
    }
  };

  const generateWords = (sourceWords: string[]) => {
    const newWords: string[] = [];
    for (let i = 0; i < 200; i++) {
      const randomIndex = Math.floor(Math.random() * sourceWords.length);
      newWords.push(sourceWords[randomIndex]);
    }
    setWords(newWords);
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${leaderboardApiUrl}/leaderboard/${language}`);
      
      // Check if response is OK and is JSON
      if (!response.ok) {
        console.log('Leaderboard not available yet (404)');
        setLeaderboard([]);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('Leaderboard returned non-JSON response');
        setLeaderboard([]);
        return;
      }
      
      const data = await response.json();
      setLeaderboard(data.scores || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isActive && value.length > 0) {
      setIsActive(true);
    }

    setCurrentInput(value.replace(' ', ''));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === ' ' || e.key === 'Enter') && currentInput.length > 0) {
      e.preventDefault();
      submitWord();
    }
  };

  const submitWord = () => {
    const typedWord = currentInput.trim();
    const correctWord = words[currentWordIndex];
    const isCorrect = typedWord === correctWord;

    setTypedWords(prev => ({
      ...prev,
      [currentWordIndex]: {
        original: typedWord,
        isCorrect: isCorrect,
        justCompleted: true
      }
    }));

    setStats(prev => ({
      ...prev,
      correctWords: isCorrect ? prev.correctWords + 1 : prev.correctWords,
      incorrectWords: !isCorrect ? prev.incorrectWords + 1 : prev.incorrectWords
    }));

    setCurrentWordIndex(prev => prev + 1);
    setCurrentInput('');

    // Generate more words if needed
    if (currentWordIndex >= words.length - 50 && allWords.length > 0) {
      const newWords = [...words];
      for (let i = 0; i < 100; i++) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        newWords.push(allWords[randomIndex]);
      }
      setWords(newWords);
    }

    // Remove animation after 300ms
    setTimeout(() => {
      setTypedWords(prev => ({
        ...prev,
        [currentWordIndex]: {
          ...prev[currentWordIndex],
          justCompleted: false
        }
      }));
    }, 300);

    updateStats();
  };

  const updateStats = () => {
    const timeElapsed = 60 - stats.timeLeft;
    if (timeElapsed === 0) return;
    
    const minutes = timeElapsed / 60;
    const wpm = Math.round(stats.correctWords / minutes);
    const total = stats.correctWords + stats.incorrectWords;
    const accuracy = total === 0 ? 100 : Math.round((stats.correctWords / total) * 100);

    setStats(prev => ({ ...prev, wpm, accuracy }));
  };

  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetTest = () => {
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTypedWords({});
    setStats({
      correctWords: 0,
      incorrectWords: 0,
      timeLeft: 60,
      wpm: 0,
      accuracy: 100
    });
    setIsActive(false);
    setIsFinished(false);
    setCurrentVisibleRow(0);
    if (allWords.length > 0) {
      generateWords(allWords);
    }
    inputRef.current?.focus();
  };

  const saveScore = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    try {
      const response = await fetch(`${leaderboardApiUrl}/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          language: language
        })
      });

      if (response.ok) {
        alert('Score saved successfully! 🎉');
        loadLeaderboard();
        setPlayerName('');
      }
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Failed to save score. Please try again.');
    }
  };

  const renderWord = (word: string, index: number) => {
    const typedWord = typedWords[index];
    
    if (index === currentWordIndex) {
      return (
        <span key={index} className="inline-block mx-1 px-2 py-1 rounded-lg bg-slate-600/30 border-2 border-slate-500 text-white font-semibold transform scale-105">
          {renderCurrentWordChars(word)}
        </span>
      );
    } else if (typedWord) {
      if (typedWord.isCorrect) {
        return (
          <span key={index} className={`inline-block mx-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 font-semibold ${typedWord.justCompleted ? 'animate-pulse' : ''}`}>
            {word}
          </span>
        );
      } else {
        return (
          <span key={index} className={`inline-block mx-1 px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 font-semibold ${typedWord.justCompleted ? 'animate-bounce' : ''}`}>
            {renderIncorrectWord(word, typedWord.original)}
          </span>
        );
      }
    }
    
    return (
      <span key={index} className="inline-block mx-1 px-2 py-1 text-gray-400">
        {word}
      </span>
    );
  };

  const renderCurrentWordChars = (word: string) => {
    const input = currentInput;
    return (
      <>
        {Array.from({ length: Math.max(word.length, input.length) }).map((_, i) => {
          const char = word[i] || '';
          const typedChar = input[i] || '';
          
          if (i >= word.length) {
            return <span key={i} className="text-red-400">{typedChar}</span>;
          } else if (i >= input.length) {
            return i === input.length ? (
              <span key={i}>{char}<span className="inline-block w-0.5 h-5 bg-slate-500 animate-pulse ml-1"></span></span>
            ) : <span key={i}>{char}</span>;
          } else if (typedChar === char) {
            return <span key={i} className="text-green-400">{char}</span>;
          } else {
            return <span key={i} className="text-red-400 bg-red-500/20">{typedChar}</span>;
          }
        })}
      </>
    );
  };

  const renderIncorrectWord = (correctWord: string, typedWord: string) => {
    return (
      <>
        {Array.from({ length: correctWord.length }).map((_, i) => {
          const correctChar = correctWord[i];
          const typedChar = typedWord[i] || '';
          
          if (typedChar === correctChar) {
            return <span key={i} className="text-white">{typedChar}</span>;
          } else if (typedChar) {
            return <span key={i} className="text-red-400">{typedChar}</span>;
          } else {
            return <span key={i} className="text-white opacity-40">{correctChar}</span>;
          }
        })}
        {typedWord.length > correctWord.length && (
          <span className="text-red-400 line-through">{typedWord.slice(correctWord.length)}</span>
        )}
      </>
    );
  };

  const getPerformanceMessage = () => {
    const { wpm, accuracy } = stats;
    if (wpm >= 80 && accuracy >= 95) return { emoji: '🔥', text: 'LEGENDARY! You\'re a typing master!' };
    if (wpm >= 60 && accuracy >= 90) return { emoji: '⭐', text: 'Excellent work! Keep it up!' };
    if (wpm >= 40 && accuracy >= 85) return { emoji: '✨', text: 'Great job! You\'re improving!' };
    if (wpm >= 20) return { emoji: '💫', text: 'Good start! Practice makes perfect!' };
    return { emoji: '🌟', text: 'Keep practicing! You\'ll get better!' };
  };

  if (!config) return null;

  // Get visible words (show 30 words at a time)
  const visibleWords = words.slice(currentWordIndex, currentWordIndex + 30);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 bg-slate-700/10 rounded-full top-0 -left-48 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute w-96 h-96 bg-slate-600/10 rounded-full bottom-0 -right-48 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute w-96 h-96 bg-slate-800/10 rounded-full top-1/2 left-1/2 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '4s' }} />
      </div>

      <div className="relative">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 px-4 md:px-6 pt-6">
          <div className="container mx-auto">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl px-4 md:px-6 py-3 flex justify-between items-center shadow-lg">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800">
                  <img src="/icon/meteoricon.png" alt="Typemeteor" className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">
                  TYPEMETEOR
                </h1>
              </Link>
              <Link href="/" className="text-gray-300 hover:text-white transition flex items-center gap-2">
                <span className="hidden md:inline">Back to Home</span>
                <span className="md:hidden">Home</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-5xl">
          {/* Language Info */}
          <div className="text-center mb-6 md:mb-8">
            <div className="mb-3">
              <img src={config.flag} alt={`${config.name} Flag`} className="w-16 h-16 md:w-24 md:h-24 mx-auto object-contain" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-2">
              <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{config.name}</span> Typing Test
            </h2>
            <p className="text-base md:text-xl text-gray-400">1 minute test - Type as many words as you can!</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
              <div className="mb-2 text-4xl">⏱️</div>
              <div className="text-2xl md:text-4xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{stats.timeLeft}</div>
              <div className="text-xs md:text-sm text-gray-400 font-medium mt-1">Time Left</div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
              <div className="mb-2 text-4xl">⚡</div>
              <div className="text-2xl md:text-4xl font-black text-green-400">{stats.wpm}</div>
              <div className="text-xs md:text-sm text-gray-400 font-medium mt-1">WPM</div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
              <div className="mb-2 text-4xl">🎯</div>
              <div className="text-2xl md:text-4xl font-black text-yellow-400">{stats.accuracy}%</div>
              <div className="text-xs md:text-sm text-gray-400 font-medium mt-1">Accuracy</div>
            </div>
          </div>

          {!isFinished ? (
            // Test Area
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl md:rounded-3xl p-4 md:p-8">
              {/* Words Display */}
              <div className="mb-4 md:mb-6 p-4 md:p-6 bg-slate-800/50 rounded-xl md:rounded-2xl min-h-[160px] md:min-h-[200px]">
                <div className="text-xl md:text-2xl leading-relaxed flex flex-wrap gap-2">
                  {visibleWords.map((word, index) => renderWord(word, currentWordIndex + index))}
                </div>
              </div>
              
              {/* Input Area */}
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Start typing here..."
                className="w-full p-4 md:p-5 text-lg md:text-xl bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-400/20 transition-all text-white placeholder-gray-500"
                autoComplete="off"
                autoFocus
              />
              
              <div className="mt-3 md:mt-4 text-center text-gray-400 text-base md:text-lg">
                {isActive ? 'Keep typing! Press SPACE after each word 🚀' : 'Start typing to begin the timer ⏱️'}
              </div>
              
              <button
                onClick={resetTest}
                className="mt-4 md:mt-6 mx-auto flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-base md:text-lg rounded-xl shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>🔄</span>
                <span>Restart Test</span>
              </button>
            </div>
          ) : (
            // Results Screen
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-6 md:p-10 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-5xl">🎉</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">
                <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">Test Complete!</span>
              </h2>
              <p className="text-gray-400 mb-8 text-sm md:text-base">Here's how you performed</p>
              
              <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 md:mb-10 max-w-2xl mx-auto">
                <div className="p-4 md:p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                  <div className="mb-2 text-4xl">⚡</div>
                  <div className="text-4xl md:text-5xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent mb-2">{stats.wpm}</div>
                  <div className="text-gray-300 font-medium text-sm md:text-base">Words Per Minute</div>
                </div>
                
                <div className="p-4 md:p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                  <div className="mb-2 text-4xl">🎯</div>
                  <div className="text-4xl md:text-5xl font-black text-green-400 mb-2">{stats.accuracy}%</div>
                  <div className="text-gray-300 font-medium text-sm md:text-base">Accuracy</div>
                </div>
                
                <div className="p-4 md:p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                  <div className="mb-2 text-4xl">✅</div>
                  <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">{stats.correctWords}</div>
                  <div className="text-gray-300 font-medium text-sm md:text-base">Correct Words</div>
                </div>
                
                <div className="p-4 md:p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                  <div className="mb-2 text-4xl">❌</div>
                  <div className="text-4xl md:text-5xl font-black text-red-400 mb-2">{stats.incorrectWords}</div>
                  <div className="text-gray-300 font-medium text-sm md:text-base">Wrong Words</div>
                </div>
              </div>

              {/* Performance Message */}
              <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <p className="text-lg md:text-xl font-bold text-white">
                  {getPerformanceMessage().emoji} {getPerformanceMessage().text} {getPerformanceMessage().emoji}
                </p>
              </div>

              {/* Save Score */}
              <div className="mb-8 max-w-md mx-auto">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 md:p-4 mb-4 bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-slate-500 text-white placeholder-gray-400 text-base md:text-lg"
                />
                <button
                  onClick={saveScore}
                  className="w-full px-6 py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base md:text-lg rounded-xl shadow-xl transition-all duration-300 hover:scale-105"
                >
                  💾 Save Score to Leaderboard
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetTest}
                  className="px-8 md:px-10 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white text-base md:text-lg font-bold rounded-xl shadow-xl transition-all duration-300 hover:scale-105"
                >
                  🔄 Try Again
                </button>
                <Link
                  href="/"
                  className="px-8 md:px-10 py-3 md:py-4 bg-slate-800 border border-slate-700 text-white text-base md:text-lg font-bold rounded-xl hover:bg-slate-700 hover:scale-105 transition-all duration-300 inline-block text-center"
                >
                  🏠 Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="mt-8 md:mt-10 bg-slate-900/50 border border-slate-700/50 rounded-2xl md:rounded-3xl p-4 md:p-8">
            <h3 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-center flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <span className="text-3xl">🏆</span>
              <span className="text-sm md:text-base">Leaderboard - <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{config.name}</span></span>
            </h3>
            <div className="space-y-2 md:space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 10).map((score, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 md:p-4 ${
                      index < 3 ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-900/30 border-slate-700/30'
                    } border rounded-xl hover:scale-[1.02] transition-transform`}
                  >
                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-black text-lg md:text-2xl shrink-0">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm md:text-lg text-white truncate">{score.name}</div>
                        <div className="text-xs md:text-sm text-gray-400">{new Date(score.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 md:gap-6 items-center shrink-0">
                      <div className="text-center">
                        <div className="font-black text-lg md:text-2xl text-green-400">{score.wpm}</div>
                        <div className="text-xs text-gray-400 hidden sm:block">WPM</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-lg md:text-2xl text-yellow-400">{score.accuracy}%</div>
                        <div className="text-xs text-gray-400 hidden sm:block">Acc</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No scores yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}