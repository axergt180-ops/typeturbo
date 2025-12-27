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
  const [isSaving, setIsSaving] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const config = languageConfig[language];
  const wordsPerRow = 10;

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

  const leaderboardApiUrl = process.env.NEXT_PUBLIC_TYPEMETEOR_API_URL || 'https://typemeteor.sbs/api';

  const loadWords = async () => {
    try {
      setWordsLoading(true);
      
      const response = await fetch('https://gist.githubusercontent.com/axergt180-ops/e7272f017482486efca9c86ad72b7909/raw/words-data.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
      const response = await fetch(`${leaderboardApiUrl}/leaderboard/${language}`);
      
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

    if (isSaving) {
      return; // Prevent double submission
    }

    setIsSaving(true);

    try {
      console.log('Saving score to:', `${leaderboardApiUrl}/leaderboard`);
      console.log('Payload:', {
        name: playerName.trim(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        language: language
      });

      const response = await fetch(`${leaderboardApiUrl}/leaderboard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: playerName.trim(),
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          language: language
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.log('Response is not JSON, but request was successful');
        }
        
        alert('Score saved successfully! 🎉');
        await loadLeaderboard();
        setPlayerName('');
      } else {
        let errorMessage = 'Server error';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || 'Unknown error';
        } catch (e) {
          errorMessage = responseText || `HTTP ${response.status}`;
        }
        
        console.error('Save error:', errorMessage);
        alert(`Failed to save score: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
      }
    } catch (error) {
      console.error('Error saving score:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Network error: Unable to connect to server.\n\nPlease check:\n- Your internet connection\n- Server is running\n- API URL is correct\n\nCurrent API: ' + leaderboardApiUrl);
      } else {
        alert(`Failed to save score: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderWord = (word: string, index: number) => {
    const typedWord = typedWords[index];
    
    if (index === currentWordIndex) {
      return (
        <span 
          key={index} 
          className="inline-block px-0.5 sm:px-1 md:px-2 py-0.5 bg-slate-600/30 border border-slate-500 md:border-2 text-white font-semibold transform scale-105 clip-corner-sm"
        >
          {renderCurrentWordChars(word)}
        </span>
      );
    } else if (typedWord) {
      if (typedWord.isCorrect) {
        return (
          <span 
            key={index} 
            className="inline-block px-0.5 sm:px-1 md:px-2 py-0.5 bg-green-500/20 text-green-400 font-semibold clip-corner-sm"
          >
            {word}
          </span>
        );
      } else {
        return (
          <span 
            key={index} 
            className="inline-block px-0.5 sm:px-1 md:px-2 py-0.5 bg-red-500/20 border border-red-500/30 font-semibold clip-corner-sm"
          >
            {renderIncorrectWord(word, typedWord.original)}
          </span>
        );
      }
    }
    
    return (
      <span key={index} className="inline-block px-0.5 sm:px-1 md:px-2 py-0.5 text-gray-400 opacity-60">
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
            return <span key={i} className="text-red-400 bg-red-500/20">{typedChar}</span>;
          } else if (i >= input.length) {
            if (i === input.length) {
              return <span key={i}>{char}<span className="inline-block w-0.5 h-5 bg-slate-500 animate-pulse ml-0.5"></span></span>;
            }
            return <span key={i}>{char}</span>;
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
            return <span key={i} className="text-white font-bold">{typedChar}</span>;
          } else if (typedChar) {
            return <span key={i} className="text-red-400 bg-red-500/30 px-0.5 font-bold">{typedChar}</span>;
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
        <div className="absolute w-96 h-96 bg-slate-700/10 blur-3xl animate-pulse" style={{ animationDuration: '8s', top: 0, left: '-12rem' }} />
        <div className="absolute w-96 h-96 bg-slate-600/10 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s', bottom: 0, right: '-12rem' }} />
        <div className="absolute w-96 h-96 bg-slate-800/10 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '4s', top: '50%', left: '50%' }} />
      </div>

      {/* Custom CSS */}
      <style jsx global>{`
        .clip-corner {
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
        }
        .clip-corner-sm {
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
        }
        .clip-corner-lg {
          clip-path: polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%);
        }
      `}</style>

      <div className="relative">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 px-4 md:px-6 pt-6 backdrop-blur-sm">
          <div className="container mx-auto">
            <div className="bg-slate-900/95 border-b-2 border-slate-700/50 px-4 md:px-6 py-3 flex justify-between items-center shadow-lg shadow-black/20 clip-corner">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="w-10 h-10 flex items-center justify-center bg-slate-800 shadow-md clip-corner-sm">
                  <img src="/icon/meteoricon.png" alt="Typemeteor" className="w-6 h-6" />
                </div>
                <h1 className="text-xl md:text-2xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent tracking-[0.2em]">
                  TYPEMETEOR
                </h1>
              </Link>
              <Link href="/" className="text-gray-300 hover:text-white transition uppercase tracking-wider text-sm font-semibold">
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
            <h2 className="text-2xl md:text-4xl font-black mb-2 uppercase tracking-wider break-words px-4">
              <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{config.name}</span> Typing Test
            </h2>
            <p className="text-base md:text-xl text-gray-400 uppercase tracking-wide px-4 break-words">1 minute test - Type as many words as you can!</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
            <div className="bg-slate-900/50 border-l-4 border-slate-700 p-3 md:p-6 text-center hover:border-slate-600 hover:-translate-y-1 transition-all clip-corner">
              <div className="mb-2">
                <img src="/icon/clock.png" alt="Time" className="w-8 h-8 md:w-12 md:h-12 mx-auto" />
              </div>
              <div className="text-xl md:text-4xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{stats.timeLeft}</div>
              <div className="text-[10px] md:text-sm text-gray-400 font-medium mt-1 uppercase tracking-wider break-words">Time</div>
            </div>
            
            <div className="bg-slate-900/50 border-l-4 border-slate-700 p-3 md:p-6 text-center hover:border-slate-600 hover:-translate-y-1 transition-all clip-corner">
              <div className="mb-2">
                <img src="/icon/wpm.png" alt="WPM" className="w-8 h-8 md:w-12 md:h-12 mx-auto" />
              </div>
              <div className="text-xl md:text-4xl font-black text-green-400">{stats.wpm}</div>
              <div className="text-[10px] md:text-sm text-gray-400 font-medium mt-1 uppercase tracking-wider">WPM</div>
            </div>
            
            <div className="bg-slate-900/50 border-l-4 border-slate-700 p-3 md:p-6 text-center hover:border-slate-600 hover:-translate-y-1 transition-all clip-corner">
              <div className="mb-2">
                <img src="/icon/accuracy.png" alt="Accuracy" className="w-8 h-8 md:w-12 md:h-12 mx-auto" />
              </div>
              <div className="text-xl md:text-4xl font-black text-yellow-400">{stats.accuracy}%</div>
              <div className="text-[10px] md:text-sm text-gray-400 font-medium mt-1 uppercase tracking-wider break-words">ACC</div>
            </div>
          </div>

          {!isFinished ? (
            // Test Area
            <div className="bg-slate-900/50 border-l-4 border-slate-700 p-3 md:p-8 clip-corner-lg">
              {/* Words Display - Desktop unchanged, Mobile optimized */}
              <div className="mb-4 md:mb-6 p-3 md:p-6 lg:p-8 bg-slate-800/50 min-h-[200px] md:min-h-[280px] lg:min-h-[320px] flex items-center justify-center overflow-hidden clip-corner">
                {wordsLoading ? (
                  <div className="text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-transparent mb-4" />
                    <p className="text-gray-400 uppercase tracking-wider text-sm">Loading...</p>
                  </div>
                ) : visibleRows.length > 0 ? (
                  <div className="w-full space-y-2 md:space-y-4 lg:space-y-5">
                    {visibleRows.map((rowIndices, rowIdx) => (
                      <div 
                        key={startRow + rowIdx} 
                        className="flex justify-between items-center text-xs sm:text-sm md:text-xl lg:text-2xl font-medium leading-relaxed"
                      >
                        {rowIndices.map((wordIndex, idx) => (
                          <React.Fragment key={wordIndex}>
                            {renderWord(words[wordIndex], wordIndex)}
                            {idx < rowIndices.length - 1 && <span className="flex-grow min-w-[0.1rem] sm:min-w-[0.15rem] md:min-w-[0.25rem]" />}
                          </React.Fragment>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center max-w-md mx-auto px-4">
                    <div className="mb-4">
                      <img src="/icon/analytics.png" alt="Error" className="w-16 h-16 mx-auto opacity-50" />
                    </div>
                    <p className="text-red-400 mb-2 font-semibold text-base md:text-lg uppercase tracking-wider break-words">Failed to load words</p>
                    <p className="text-gray-400 text-xs md:text-sm mb-6 break-words">Please check your connection</p>
                    <button 
                      onClick={loadWords}
                      className="px-6 py-2.5 md:px-8 md:py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm md:text-base transition-all hover:scale-105 flex items-center gap-2 mx-auto shadow-lg clip-corner-sm uppercase tracking-wider"
                    >
                      <img src="/icon/restart.png" alt="Retry" className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Retry</span>
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
                placeholder="Start typing..."
                disabled={wordsLoading || words.length === 0}
                className="w-full p-3 md:p-5 text-base md:text-xl bg-slate-800 border-2 border-slate-600 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed clip-corner"
                autoComplete="off"
                autoFocus
              />
              
              <div className="mt-3 md:mt-4 text-center text-gray-400 text-xs md:text-lg flex flex-wrap items-center justify-center gap-2 uppercase tracking-wider px-4">
                {wordsLoading ? (
                  'Loading...'
                ) : isActive ? (
                  <>
                    <span className="break-words">Keep typing! Press SPACE</span>
                    <img src="/icon/rocket.png" alt="Rocket" className="w-4 h-4 md:w-5 md:h-5 inline-block shrink-0" />
                  </>
                ) : (
                  <>
                    <span className="break-words">Start typing to begin</span>
                    <img src="/icon/clock.png" alt="Clock" className="w-4 h-4 md:w-5 md:h-5 inline-block shrink-0" />
                  </>
                )}
              </div>
              
              <button
                onClick={resetTest}
                disabled={wordsLoading}
                className="mt-4 md:mt-6 mx-auto flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm md:text-lg shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed clip-corner-sm uppercase tracking-wider"
              >
                <img src="/icon/restart.png" alt="Restart" className="w-4 h-4 md:w-5 md:h-5" />
                <span>Restart</span>
              </button>
            </div>
          ) : (
            // Results Screen - Same as before but with break-words
            <div className="bg-slate-900/50 border-l-4 border-slate-700 p-4 md:p-10 text-center clip-corner-lg">
              <div className="mb-6">
                <img src="/icon/meteoricon.png" alt="Complete" className="w-16 h-16 md:w-24 md:h-24 mx-auto" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black mb-2 uppercase tracking-wider break-words px-4">
                <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">Test Complete!</span>
              </h2>
              <p className="text-gray-400 mb-6 md:mb-8 text-xs md:text-base uppercase tracking-wider px-4 break-words">Here's how you performed</p>
              
              <div className="grid grid-cols-2 gap-2 md:gap-6 mb-6 md:mb-10 max-w-2xl mx-auto">
                <div className="p-3 md:p-6 bg-slate-800/30 border-l-4 border-slate-700 hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300 clip-corner">
                  <img src="/icon/wpm.png" alt="WPM" className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3" />
                  <div className="text-3xl md:text-5xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent mb-1 md:mb-2">{stats.wpm}</div>
                  <div className="text-gray-300 font-medium text-xs md:text-base uppercase tracking-wider break-words">WPM</div>
                </div>
                
                <div className="p-3 md:p-6 bg-slate-800/30 border-l-4 border-slate-700 hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300 clip-corner">
                  <img src="/icon/accuracy.png" alt="Accuracy" className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3" />
                  <div className="text-3xl md:text-5xl font-black text-green-400 mb-1 md:mb-2">{stats.accuracy}%</div>
                  <div className="text-gray-300 font-medium text-xs md:text-base uppercase tracking-wider break-words">Accuracy</div>
                </div>
                
                <div className="p-3 md:p-6 bg-slate-800/30 border-l-4 border-slate-700 hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300 clip-corner">
                  <img src="/icon/competition.png" alt="Correct" className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3" />
                  <div className="text-3xl md:text-5xl font-black text-yellow-400 mb-1 md:mb-2">{stats.correctWords}</div>
                  <div className="text-gray-300 font-medium text-xs md:text-base uppercase tracking-wider break-words">Correct</div>
                </div>
                
                <div className="p-3 md:p-6 bg-slate-800/30 border-l-4 border-slate-700 hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300 clip-corner">
                  <img src="/icon/analytics.png" alt="Wrong" className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3" />
                  <div className="text-3xl md:text-5xl font-black text-red-400 mb-1 md:mb-2">{stats.incorrectWords}</div>
                  <div className="text-gray-300 font-medium text-xs md:text-base uppercase tracking-wider break-words">Wrong</div>
                </div>
              </div>

              {/* Performance Message */}
              <div className="mb-6 p-3 md:p-4 bg-slate-800/50 border-l-4 border-slate-600 flex flex-wrap items-center justify-center gap-2 clip-corner">
                <img src="/icon/competition.png" alt="Performance" className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <p className="text-sm md:text-xl font-bold text-white uppercase tracking-wide break-words">{getPerformanceMessage()}</p>
                <img src="/icon/competition.png" alt="Performance" className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              </div>

              {/* Save Score */}
              <div className="mb-6 md:mb-8 max-w-md mx-auto px-4">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isSaving}
                  className="w-full p-2.5 md:p-4 mb-3 md:mb-4 bg-slate-800 border-2 border-slate-600 focus:outline-none focus:border-slate-500 text-white placeholder-gray-400 text-sm md:text-lg clip-corner uppercase disabled:opacity-50"
                />
                <button
                  onClick={saveScore}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 md:px-6 md:py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm md:text-lg shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto clip-corner uppercase tracking-wider"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin inline-block w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <img src="/icon/leaderboard.png" alt="Save" className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Save Score</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                <button
                  onClick={resetTest}
                  className="px-6 md:px-10 py-2.5 md:py-4 bg-slate-700 hover:bg-slate-600 text-white text-sm md:text-lg font-bold shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 clip-corner uppercase tracking-wider"
                >
                  <img src="/icon/restart.png" alt="Restart" className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Try Again</span>
                </button>
                <Link
                  href="/"
                  className="px-6 md:px-10 py-2.5 md:py-4 bg-slate-800 border-l-4 border-slate-700 text-white text-sm md:text-lg font-bold hover:bg-slate-700 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2 clip-corner uppercase tracking-wider"
                >
                  <img src="/icon/meteoricon.png" alt="Home" className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Home</span>
                </Link>
              </div>
            </div>
          )}

          {/* Leaderboard - Same as before but with break-words */}
          <div className="mt-6 md:mt-10 bg-slate-900/50 border-l-4 border-slate-700 p-3 md:p-8 clip-corner-lg">
            <h3 className="text-xl md:text-3xl font-black mb-3 md:mb-6 text-center flex flex-wrap items-center justify-center gap-2 uppercase tracking-wider px-4">
              <img src="/icon/leaderboard.png" alt="Leaderboard" className="w-6 h-6 md:w-10 md:h-10 shrink-0" />
              <span className="text-xs md:text-base break-words">Leaderboard - <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{config.name}</span></span>
            </h3>
            <div className="space-y-2 md:space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 10).map((score, index) => (
                  <div
                    key={index}
                    className={`flex flex-col md:flex-row items-start md:items-center justify-between p-2.5 md:p-4 ${
                      index < 3 ? 'bg-slate-800/50 border-l-4 border-slate-400' : 'bg-slate-900/30 border-l-4 border-slate-700/30'
                    } hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300 clip-corner`}
                  >
                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 w-full md:w-auto mb-2 md:mb-0">
                      <div className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center font-black text-lg md:text-2xl shrink-0 clip-corner-sm ${
                        index < 3 ? 'bg-slate-700' : 'bg-slate-800'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs md:text-lg text-white truncate uppercase tracking-wide">{score.name}</div>
                        <div className="text-[10px] md:text-sm text-gray-400">{new Date(score.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 md:gap-6 items-center shrink-0 w-full md:w-auto justify-end">
                      <div className="text-center">
                        <div className="font-black text-base md:text-2xl text-green-400">{score.wpm}</div>
                        <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">WPM</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-base md:text-2xl text-yellow-400">{score.accuracy}%</div>
                        <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">ACC</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 uppercase tracking-wider text-xs md:text-base py-4 break-words px-4">No scores yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}