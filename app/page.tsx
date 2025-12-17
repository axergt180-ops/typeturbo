'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface LeaderboardEntry {
  name: string;
  language: string;
  wpm: number;
  accuracy: number;
}

interface LanguageCardProps {
  code: string;
  name: string;
  native: string;
  flag: string;
  page: number;
}

export default function Homepage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  const totalPages = 3;

  const languageNames: Record<string, string> = {
    'indonesian': 'Indonesian',
    'english': 'English',
    'spanish': 'Spanish',
    'french': 'French',
    'german': 'German',
    'portuguese': 'Portuguese',
    'japanese': 'Japanese',
    'italian': 'Italian',
    'russian': 'Russian',
    'korean': 'Korean',
    'chinese': 'Chinese',
    'arabic': 'Arabic',
    'dutch': 'Dutch',
    'turkish': 'Turkish',
    'thai': 'Thai',
    'vietnamese': 'Vietnamese',
    'hindi': 'Hindi'
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_TYPEMETEOR_API_URL;
    const response = await fetch(`${apiUrl}/leaderboard?limit=8`);
    const data = await response.json() as { leaderboard?: any[] };
    setLeaderboard(data.leaderboard || []);
    setLoading(false);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    setLoading(false);
  }
};

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToLanguages = () => {
    const section = document.getElementById('languages');
    section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const selectLanguage = (lang: string) => {
    if (selectedLanguage === lang) {
      setSelectedLanguage(null);
    } else {
      setSelectedLanguage(lang);
    }
  };

  const LanguageCard: React.FC<LanguageCardProps> = ({ code, name, native, flag, page }) => {
    return (
      <div
        onClick={() => selectLanguage(code)}
        className={`rounded-2xl p-8 text-center cursor-pointer relative group transition-all duration-300
          ${selectedLanguage === code 
            ? 'bg-slate-800/80 border-2 border-white/40 shadow-2xl ring-4 ring-white/20 transform -translate-y-2 scale-105' 
            : 'bg-slate-900/40 border border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600 hover:-translate-y-1 hover:scale-102'
          }`}
      >
        <div className="mb-4 transform transition-transform group-hover:scale-110">
          <img src={flag} alt={`${name} Flag`} className="w-20 h-20 mx-auto object-contain" />
        </div>
        <h4 className="text-xl font-bold mb-2 group-hover:text-gray-300 transition-colors text-white">{name}</h4>
        <p className="text-sm text-gray-400">{native}</p>
        {selectedLanguage === code && (
          <div className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 font-bold shadow-xl animate-in zoom-in duration-300">
            <span className="text-xl">✓</span>
          </div>
        )}
      </div>
    );
  };

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
        <nav className="sticky top-0 z-40 px-4 md:px-6 pt-6">
          <div className="container mx-auto">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl px-4 md:px-6 py-3 flex justify-between items-center shadow-lg shadow-black/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 shadow-md">
                  <img src="/icon/meteoricon.png" alt="Typemeteor Icon" className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent tracking-tight">
                  TYPEMETEOR
                </h1>
              </div>
              <div className="hidden md:flex gap-8 items-center text-sm font-medium">
                <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-colors">
                  Features
                </button>
                <button onClick={() => scrollToSection('languages')} className="text-gray-300 hover:text-white transition-colors">
                  Languages
                </button>
                <button onClick={() => scrollToSection('leaderboard')} className="text-gray-300 hover:text-white transition-colors">
                  Leaderboard
                </button>
                <button onClick={scrollToLanguages} className="bg-slate-700 hover:bg-slate-600 px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all duration-300">
                  Start Test
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section 
          className="relative min-h-[92vh] flex items-end md:items-center justify-center px-4 md:px-6 pt-10 md:pt-16 pb-10 md:pb-20 -mt-6"
          style={{
            backgroundImage: "url('/herocarousel.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/90 to-slate-950/50" />
          
          <div className="relative z-10 w-full max-w-6xl flex flex-col gap-10">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="bg-slate-900/90 border border-slate-700/50 rounded-4xl px-10 py-6 md:px-16 md:py-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <img src="/icon/meteoricon.png" alt="Meteor Icon" className="w-12 h-12" />
                  <span className="text-3xl md:text-5xl font-black tracking-[0.2em] uppercase">
                    TYPE<span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">METEOR</span>
                  </span>
                </div>
                <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-gray-400 text-center">
                  Test your typing speed and compete with other users.
                </p>
              </div>
            </div>

            {/* Banner */}
            <div className="flex justify-center">
              <div className="bg-slate-700 px-8 md:px-16 py-3 md:py-4 rounded-none md:rounded-xl shadow-[0_18px_40px_rgba(0,0,0,0.4)]">
                <p className="text-sm md:text-xl font-black tracking-[0.35em] md:tracking-[0.5em] uppercase text-center">
                  Free Typing · typemeteor
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 max-w-3xl mx-auto">
              <button
                onClick={scrollToLanguages}
                className="flex-1 bg-slate-900/90 border border-slate-700/50 rounded-2xl px-6 md:px-10 py-4 md:py-6 flex items-center justify-between hover:border-slate-600 hover:bg-slate-800/90 transition-all duration-300 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                    <img src="/icon/meteoricon.png" alt="Restart Icon" className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-gray-400">
                      Start Typing
                    </p>
                    <p className="text-lg md:text-xl font-bold text-white">Start 1-Minute Test</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => scrollToSection('leaderboard')}
                className="flex-1 bg-slate-700 text-white rounded-2xl px-6 md:px-10 py-4 md:py-6 flex items-center justify-between hover:bg-slate-600 transition-all duration-300 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
                <div className="text-left">
                  <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-gray-300">
                    Ranking Area
                  </p>
                  <p className="text-lg md:text-xl font-black">Explore Leaderboard</p>
                </div>
                <div className="w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center">
                  <img src="/icon/rocket.png" alt="Arrow" className="w-6 h-6" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-black mb-4">
                Why Choose <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">Typemeteor?</span>
              </h3>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to improve your typing skills in one place
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '/icon/globe.png', title: 'Multi-Language', desc: 'Practice typing in 17 languages including Indonesian, English, Spanish, French, German, Portuguese, Japanese, and more' },
                { icon: '/icon/analytics.png', title: 'Real-Time Analytics', desc: 'Track your WPM, accuracy, and progress with detailed real-time statistics and performance insights' },
                { icon: '/icon/competition.png', title: 'Competition', desc: 'Compete with typists worldwide on our leaderboard and see how you rank among the best' }
              ].map((feature, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/50 hover:border-slate-600 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                    <img src={feature.icon} alt={feature.title} className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-white">{feature.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Language Selection */}
        <section id="languages" className="py-24 px-6 bg-linear-to-b from-transparent to-slate-900/50">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-black mb-4">
                Choose Your <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">Language</span>
              </h3>
              <p className="text-xl text-gray-400">
                Select from 17 languages and start improving your typing speed
              </p>
            </div>
            
            <div className="relative max-w-6xl mx-auto">
              {/* Navigation Arrows */}
              <button
                onClick={() => {
                  if (currentPage > 0) {
                    setSlideDirection('left');
                    setCurrentPage(currentPage - 1);
                  }
                }}
                disabled={currentPage === 0}
                className={`hidden lg:flex absolute -left-20 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-900/50 border-2 border-slate-700/50 items-center justify-center transition-all hover:bg-slate-800/50 hover:border-slate-600 hover:scale-110 shadow-lg z-10 ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>
                <img src="/icon/left-arrow.png" alt="Previous" className="w-6 h-6" />
              </button>

              {/* Language Grid Container */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentPage * 100}%)` }}
                >
                  {/* Page 0 */}
                  <div className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <LanguageCard code="indonesian" name="Indonesian" native="Bahasa Indonesia" flag="/flags/indonesia.png" page={0} />
                    <LanguageCard code="english" name="English" native="English" flag="/flags/english.png" page={0} />
                    <LanguageCard code="spanish" name="Spanish" native="Español" flag="/flags/espanol.png" page={0} />
                    <LanguageCard code="french" name="French" native="Français" flag="/flags/francais.png" page={0} />
                    <LanguageCard code="german" name="German" native="Deutsch" flag="/flags/deutsch.png" page={0} />
                    <LanguageCard code="portuguese" name="Portuguese" native="Português" flag="/flags/portugues.png" page={0} />
                    <LanguageCard code="japanese" name="Japanese" native="日本語" flag="/flags/japan.png" page={0} />
                    <LanguageCard code="italian" name="Italian" native="Italiano" flag="/flags/italian.png" page={0} />
                  </div>

                  {/* Page 1 */}
                  <div className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <LanguageCard code="russian" name="Russian" native="Русский" flag="/flags/russian.png" page={1} />
                    <LanguageCard code="korean" name="Korean" native="한국어" flag="/flags/korean.png" page={1} />
                    <LanguageCard code="chinese" name="Chinese" native="中文" flag="/flags/chinese.png" page={1} />
                    <LanguageCard code="arabic" name="Arabic" native="العربية" flag="/flags/arabic.png" page={1} />
                    <LanguageCard code="dutch" name="Dutch" native="Nederlands" flag="/flags/dutch.png" page={1} />
                    <LanguageCard code="turkish" name="Turkish" native="Türkçe" flag="/flags/turkish.png" page={1} />
                    <LanguageCard code="thai" name="Thai" native="ไทย" flag="/flags/thai.png" page={1} />
                    <LanguageCard code="vietnamese" name="Vietnamese" native="Tiếng Việt" flag="/flags/vietnamese.png" page={1} />
                  </div>

                  {/* Page 2 */}
                  <div className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
                    <LanguageCard code="hindi" name="Hindi" native="हिन्दी" flag="/flags/hindi.png" page={2} />
                    {/* Empty placeholders to maintain grid structure */}
                    <div className="hidden lg:block"></div>
                    <div className="hidden lg:block"></div>
                    <div className="hidden lg:block"></div>
                    <div className="hidden lg:block"></div>
                    <div className="hidden lg:block"></div>
                    <div className="hidden lg:block"></div>
                    <div className="hidden lg:block"></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentPage < totalPages - 1) {
                    setSlideDirection('right');
                    setCurrentPage(currentPage + 1);
                  }
                }}
                disabled={currentPage === totalPages - 1}
                className={`hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-900/50 border-2 border-slate-700/50 items-center justify-center transition-all hover:bg-slate-800/50 hover:border-slate-600 hover:scale-110 shadow-lg z-10 ${currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}>
                <img src="/icon/right-arrow.png" alt="Next" className="w-6 h-6" />
              </button>

              {/* Page Dots (Mobile) */}
              <div className="flex lg:hidden justify-center gap-3 mt-8">
                {[0, 1, 2].map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setSlideDirection(page > currentPage ? 'right' : 'left');
                      setCurrentPage(page);
                    }}
                    className={`h-3 rounded-full transition-all ${
                      currentPage === page 
                        ? 'w-8 bg-slate-600' 
                        : 'w-3 bg-slate-700/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Start Button */}
            {selectedLanguage && (
              <div className="text-center mt-12 animate-in slide-in-from-bottom duration-500">
                <Link 
                  href={`/language/${selectedLanguage}`}
                  className="bg-slate-700 hover:bg-slate-600 px-16 py-6 rounded-2xl font-bold text-2xl shadow-xl transition-all duration-300 inline-flex items-center gap-3 hover:scale-105"
                >
                  <span>Start 1-Minute Test</span>
                  <img src="/icon/right-arrow.png" alt="Arrow" className="w-6 h-6" />
                </Link>
                <p className="text-gray-400 mt-4 text-lg">
                  Click to begin your typing test in <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent font-bold">{languageNames[selectedLanguage]}</span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="py-24 px-6 bg-linear-to-b from-slate-900/50 to-transparent">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-black mb-4">
                Global <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">Leaderboard</span>
              </h3>
              <p className="text-xl text-gray-400">
                See how you rank against the world's fastest typists
              </p>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full mb-4" />
                  <p className="text-gray-400">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((score: LeaderboardEntry, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-800/30 border border-slate-700/30 rounded-2xl hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <span className={`text-3xl font-bold min-w-12 ${i < 3 ? 'bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent' : 'text-gray-500'}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                        </span>
                        <div>
                          <div className="font-bold text-lg text-white">{score.name}</div>
                          <div className="text-sm text-gray-400">{score.language}</div>
                        </div>
                      </div>
                      <div className="flex gap-8 items-center">
                        <div className="text-right">
                          <div className="text-2xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">{score.wpm}</div>
                          <div className="text-xs text-gray-400 font-medium flex items-center gap-1 justify-end">
                            <img src="/icon/wpm.png" alt="WPM" className="w-3 h-3 opacity-70" />
                            WPM
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-emerald-400">{score.accuracy}%</div>
                          <div className="text-xs text-gray-400 font-medium flex items-center gap-1 justify-end">
                            <img src="/icon/accuracy.png" alt="Accuracy" className="w-3 h-3 opacity-70" />
                            Accuracy
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">No scores available yet. Be the first to set a record!</p>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-slate-700/30">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/icon/meteoricon.png" alt="Meteor Icon" className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">TYPEMETEOR</h1>
            </div>
            <p className="text-gray-400 mb-2">© 2025 Typemeteor</p>
            <p className="text-gray-500 text-sm">Made with ❤️ for typists worldwide</p>
          </div>
        </footer>
      </div>
    </div>
  );
}