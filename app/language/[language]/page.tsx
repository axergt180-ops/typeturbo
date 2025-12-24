'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export const runtime = 'edge';

// Types
interface TypingStats {
  correctWords: number;
  incorrectWords: number;
  timeLeft: number;
  wpm: number;
  accuracy: number;
}

interface LeaderboardAPIResponse {
  scores: any[];
  language: string;
  total: number;
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
  const [rows, setRows] = useState<number[][]>([]);
  const [currentVisibleRow, setCurrentVisibleRow] = useState(0);
  const [wordsLoading, setWordsLoading] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const config = languageConfig[language];
  const wordsPerRow = 10; // 10 words per row

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

  const leaderboardApiUrl = process.env.NEXT_PUBLIC_TYPEMETEOR_API_URL || 'https://typemeteor.com/api';

  const loadWords = async () => {
    try {
      setWordsLoading(true);
      
      const response = await fetch('https://gist.githubusercontent.com/axergt180-ops/e7272f017482486efca9c86ad72b7909/raw/words-data.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Try to parse as JSON directly (GitHub raw doesn't always set content-type header)
      let data: Record<string, string[]>;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error('Invalid JSON response from server');
      }
      
      const languageWords = data[language];
      
      if (languageWords && Array.isArray(languageWords) && languageWords.length > 0) {
        console.log(`Loaded ${languageWords.length} words for ${language}`);
        setAllWords(languageWords);
        generateWords(languageWords);
        setWordsLoading(false);
      } else {
        console.error('No words found for language:', language);
        throw new Error(`No words available for ${language}`);
      }
    } catch (error) {
      console.error('Error loading words:', error);
      setWordsLoading(false);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          alert('Failed to load word database. The data format is invalid. Please contact support.');
        } else if (error.message.includes('HTTP')) {
          alert('Failed to connect to word database. Please check your internet connection.');
        } else {
          alert(`Failed to load words: ${error.message}`);
        }
      } else {
        alert('Failed to load words. Please refresh the page and try again.');
      }
    }
  };

  const generateWords = (sourceWords: string[]) => {
    const newWords: string[] = [];
    for (let i = 0; i < 200; i++) {
      const randomIndex = Math.floor(Math.random() * sourceWords.length);
      newWords.push(sourceWords[randomIndex]);
    }
    setWords(newWords);
    organizeIntoRows(newWords);
  };

  const organizeIntoRows = (wordsList: string[]) => {
    const newRows: number[][] = [];
    let currentRow: number[] = [];
    
    for (let i = 0; i < wordsList.length; i++) {
      currentRow.push(i);
      
      if (currentRow.length === wordsPerRow) {
        newRows.push([...currentRow]);
        currentRow = [];
      }
    }
    
    if (currentRow.length > 0) {
      while (currentRow.length < wordsPerRow) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        wordsList.push(allWords[randomIndex]);
        currentRow.push(wordsList.length - 1);
      }
      newRows.push(currentRow);
    }
    
    setRows(newRows);
  };

  const loadLeaderboard = async () => {
    try {
      // Use production API URL in development if needed
      const apiUrl = leaderboardApiUrl.includes('localhost') 
        ? 'https://typemeteor.com/api' 
        : leaderboardApiUrl;

      const response = await fetch(`${apiUrl}/leaderboard/${language}`);
      
      if (!response.ok) {
        console.log('Leaderboard not available yet');
        setLeaderboard([]);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('Leaderboard returned non-JSON response');
        setLeaderboard([]);
        return;
      }
      
      const data = await response.json() as LeaderboardAPIResponse;
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

    const currentRowIndex = Math.floor(currentWordIndex / wordsPerRow);
    
    setCurrentWordIndex(prev => prev + 1);
    setCurrentInput('');

    const newRowIndex = Math.floor((currentWordIndex + 1) / wordsPerRow);
    
    if (newRowIndex > currentRowIndex && newRowIndex > currentVisibleRow) {
      setCurrentVisibleRow(newRowIndex);
    }

    if (currentWordIndex >= words.length - 50 && allWords.length > 0) {
      const newWords = [...words];
      for (let i = 0; i < 100; i++) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        newWords.push(allWords[randomIndex]);
      }
      setWords(newWords);
      organizeIntoRows(newWords);
    }

    setTimeout(() => {
      setTypedWords(prev => {
        const updated = { ...prev };
        if (updated[currentWordIndex]) {
          updated[currentWordIndex] = {
            ...updated[currentWordIndex],
            justCompleted: false
          };
        }
        return updated;
      });
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
      // Use production API URL in development if needed
      const apiUrl = leaderboardApiUrl.includes('localhost') 
        ? 'https://typemeteor.com/api' 
        : leaderboardApiUrl;

      const response = await fetch(`${apiUrl}/leaderboard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName.trim(),
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          language: language
        })
      });

      if (response.ok) {
        alert('Score saved successfully! 🎉');
        await loadLeaderboard();
        setPlayerName('');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
        console.error('Save error:', errorData);
        alert(`Failed to save score: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error saving score:', error);
      
      // More helpful error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Network error: Unable to connect to leaderboard server. Please check your internet connection and try again.');
      } else {
        alert('Failed to save score. Please try again later.');
      }
    }
  };

  const renderWord = (word: string, index: number) => {
    const typedWord = typedWords[index];
    
    if (index === currentWordIndex) {
      // Current word being typed
      return (
        <span 
          key={index} 
          className="inline-block px-2 py-0.5 rounded bg-slate-600/30 border-2 border-slate-500 text-white font-semibold transform scale-105"
        >
          {renderCurrentWordChars(word)}
        </span>
      );
    } else if (typedWord) {
      // Word has been typed
      if (typedWord.isCorrect) {
        // CORRECT WORD - GREEN (no animation)
        return (
          <span 
            key={index} 
            className="inline-block px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-semibold"
          >
            {word}
          </span>
        );
      } else {
        // INCORRECT WORD - RED with character details (no animation)
        return (
          <span 
            key={index} 
            className="inline-block px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 font-semibold"
          >
            {renderIncorrectWord(word, typedWord.original)}
          </span>
        );
      }
    }
    
    // Not yet typed - GRAY
    return (
      <span key={index} className="inline-block px-2 py-0.5 text-gray-400 opacity-60">
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
            // Extra characters typed
            return <span key={i} className="text-red-400 bg-red-500/20">{typedChar}</span>;
          } else if (i >= input.length) {
            // Not yet typed
            if (i === input.length) {
              return <span key={i}>{char}<span className="inline-block w-0.5 h-5 bg-slate-500 animate-pulse ml-0.5"></span></span>;
            }
            return <span key={i}>{char}</span>;
          } else if (typedChar === char) {
            // Correct character
            return <span key={i} className="text-green-400">{char}</span>;
          } else {
            // Wrong character
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
            return <span key={i} className="text-white font-bold">{typedChar}</span>;
          } else if (typedChar) {
            return <span key={i} className="text-red-400 bg-red-500/30 px-0.5 rounded font-bold">{typedChar}</span>;
          } else {
            return <span key={i} className="text-white opacity-40 font-bold">{correctChar}</span>;
          }
        })}
        {typedWord.length > correctWord.length && (
          <span className="text-red-400 line-through decoration-2 font-bold">{typedWord.slice(correctWord.length)}</span>
        )}
      </>
    );
  };

  const getPerformanceMessage = () => {
    const { wpm, accuracy } = stats;
    if (wpm >= 80 && accuracy >= 95) return 'LEGENDARY! You\'re a typing master!';
    if (wpm >= 60 && accuracy >= 90) return 'Excellent work! Keep it up!';
    if (wpm >= 40 && accuracy >= 85) return 'Great job! You\'re improving!';
    if (wpm >= 20) return 'Good start! Practice makes perfect!';
    return 'Keep practicing! You\'ll get better!';
  };

  if (!config) return null;

  const startRow = currentVisibleRow;
  const endRow = Math.min(startRow + 3, rows.length);
  const visibleRows = rows.slice(startRow, endRow);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full top-0 -left-48 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full bottom-0 -right-48 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full top-1/2 left-1/2 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '4s' }} />
      </div>

      <div className="relative">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 px-4 md:px-6 pt-6">
          <div className="container mx-auto">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl px-4 md:px-6 py-3 flex justify-between items-center shadow-lg shadow-black/20">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 shadow-md">
                  <img src="/icon/meteoricon.png" alt="Typemeteor" className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent tracking-tight">
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

        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-6xl">
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
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center hover:border-slate-600 hover:-translate-y-1 transition-all">
              <div className="mb-2">
                <img src="/icon/clock.png" alt="Time" className="w-10 h-10 md:w-12 md:h-12 mx-auto" />
              </div>
              <div className="text-2xl md:text-4xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{stats.timeLeft}</div>
              <div className="text-xs md:text-sm text-gray-400 font-medium mt-1">Time Left</div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center hover:border-slate-600 hover:-translate-y-1 transition-all">
              <div className="mb-2">
                <img src="/icon/wpm.png" alt="WPM" className="w-10 h-10 md:w-12 md:h-12 mx-auto" />
              </div>
              <div className="text-2xl md:text-4xl font-black text-green-400">{stats.wpm}</div>
              <div className="text-xs md:text-sm text-gray-400 font-medium mt-1">WPM</div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center hover:border-slate-600 hover:-translate-y-1 transition-all">
              <div className="mb-2">
                <img src="/icon/accuracy.png" alt="Accuracy" className="w-10 h-10 md:w-12 md:h-12 mx-auto" />
              </div>
              <div className="text-2xl md:text-4xl font-black text-yellow-400">{stats.accuracy}%</div>
              <div className="text-xs md:text-sm text-gray-400 font-medium mt-1">Accuracy</div>
            </div>
          </div>

          {!isFinished ? (
            // Test Area
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl md:rounded-3xl p-4 md:p-8">
              {/* Words Display with JUSTIFIED LAYOUT */}
              <div className="mb-4 md:mb-6 p-6 md:p-8 bg-slate-800/50 rounded-xl md:rounded-2xl min-h-[280px] md:min-h-[320px] flex items-center justify-center overflow-hidden">
                {wordsLoading ? (
                  <div className="text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full mb-4" />
                    <p className="text-gray-400">Loading words...</p>
                  </div>
                ) : visibleRows.length > 0 ? (
                  <div className="w-full space-y-5">
                    {visibleRows.map((rowIndices, rowIdx) => (
                      <div 
                        key={startRow + rowIdx} 
                        className="flex justify-between items-center text-xl md:text-2xl font-medium leading-relaxed"
                        style={{
                          textAlign: 'justify',
                          textJustify: 'inter-word'
                        }}
                      >
                        {rowIndices.map((wordIndex, idx) => (
                          <React.Fragment key={wordIndex}>
                            {renderWord(words[wordIndex], wordIndex)}
                            {idx < rowIndices.length - 1 && <span className="flex-grow min-w-[0.25rem]" />}
                          </React.Fragment>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center max-w-md mx-auto">
                    <div className="mb-4">
                      <img src="/icon/analytics.png" alt="Error" className="w-16 h-16 mx-auto opacity-50" />
                    </div>
                    <p className="text-red-400 mb-2 font-semibold text-lg">Failed to load words</p>
                    <p className="text-gray-400 text-sm mb-6">Please check your internet connection and try again</p>
                    <button 
                      onClick={loadWords}
                      className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto shadow-lg"
                    >
                      <img src="/icon/restart.png" alt="Retry" className="w-5 h-5" />
                      <span>Retry Loading</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Start typing here..."
                disabled={wordsLoading || words.length === 0}
                className="w-full p-4 md:p-5 text-lg md:text-xl bg-slate-800 border-2 border-purple-500 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="off"
                autoFocus
              />
              
              <div className="mt-3 md:mt-4 text-center text-gray-400 text-base md:text-lg flex items-center justify-center gap-2">
                {wordsLoading ? (
                  'Loading words...'
                ) : isActive ? (
                  <>
                    Keep typing! Press SPACE after each word 
                    <img src="/icon/rocket.png" alt="Rocket" className="w-5 h-5 inline-block" />
                  </>
                ) : (
                  <>
                    Start typing to begin the timer 
                    <img src="/icon/clock.png" alt="Clock" className="w-5 h-5 inline-block" />
                  </>
                )}
              </div>
              
              <button
                onClick={resetTest}
                disabled={wordsLoading}
                className="mt-4 md:mt-6 mx-auto flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-base md:text-lg rounded-xl shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="/icon/restart.png" alt="Restart" className="w-5 h-5" />
                <span>Restart Test</span>
              </button>
            </div>
          ) : (
            // Results Screen
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-6 md:p-10 text-center">
              <div className="mb-6">
                <img src="/icon/meteoricon.png" alt="Complete" className="w-20 h-20 md:w-24 md:h-24 mx-auto animate-bounce" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">
                <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">Test Complete!</span>
              </h2>
              <p className="text-gray-400 mb-8 text-sm md:text-base">Here's how you performed</p>
              
              <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 md:mb-10 max-w-2xl mx-auto">
                <div className="p-4 md:p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300">
                  <img src="/icon/wpm.png" alt="WPM" className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-4xl md:text-5xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent mb-2">{stats.wpm}</div>
                  <div className="text-gray-300 font-medium text-sm md:text-base">Words Per Minute</div>
                </div>
                
                <div className="p-4 md:p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300">
                  <img src="/icon/accuracy.png" alt="Accuracy" className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-4xl md:text-5xl font-black text-green-400 mb-2">{stats.accuracy}%</div>
                  <div className="text-gray-300 font-medium text-sm md:text-base">Accuracy</div>
                </div>
                
                <div className="p-4 md:p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300">
                  <img src="/icon/competition.png" alt="Correct" className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">{stats.correctWords}</div>
                  <div className="text-gray-300 font-medium text-sm md:text-base">Correct Words</div>
                </div>
                
                <div className="p-4 md:p-6 bg-slate-800/30 border border-slate-700/30 rounded-2xl hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300">
                  <img src="/icon/analytics.png" alt="Wrong" className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-4xl md:text-5xl font-black text-red-400 mb-2">{stats.incorrectWords}</div>
                  <div className="text-gray-300 font-medium text-sm md:text-base">Wrong Words</div>
                </div>
              </div>

              {/* Performance Message */}
              <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center gap-2">
                <img src="/icon/competition.png" alt="Performance" className="w-5 h-5" />
                <p className="text-lg md:text-xl font-bold text-white">{getPerformanceMessage()}</p>
                <img src="/icon/competition.png" alt="Performance" className="w-5 h-5" />
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
                  className="w-full px-6 py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base md:text-lg rounded-xl shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                >
                  <img src="/icon/leaderboard.png" alt="Save" className="w-5 h-5" />
                  Save Score to Leaderboard
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetTest}
                  className="px-8 md:px-10 py-3 md:py-4 bg-slate-700 hover:bg-slate-600 text-white text-base md:text-lg font-bold rounded-xl shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <img src="/icon/restart.png" alt="Restart" className="w-5 h-5" />
                  Try Again
                </button>
                <Link
                  href="/"
                  className="px-8 md:px-10 py-3 md:py-4 bg-slate-800 border border-slate-700 text-white text-base md:text-lg font-bold rounded-xl hover:bg-slate-700 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <img src="/icon/meteoricon.png" alt="Home" className="w-5 h-5" />
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="mt-8 md:mt-10 bg-slate-900/50 border border-slate-700/50 rounded-2xl md:rounded-3xl p-4 md:p-8">
            <h3 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-center flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <img src="/icon/leaderboard.png" alt="Leaderboard" className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-base">Leaderboard - <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{config.name}</span></span>
            </h3>
            <div className="space-y-2 md:space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 10).map((score, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 md:p-4 ${
                      index < 3 ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-900/30 border-slate-700/30'
                    } border rounded-xl hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300`}
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