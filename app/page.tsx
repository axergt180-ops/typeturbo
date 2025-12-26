'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface LeaderboardEntry {
  name: string;
  language: string;
  wpm: number;
  accuracy: number;
  timestamp: string;
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
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<string>('overall');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  
  const totalPages = 3;

  const languageNames: Record<string, string> = {
    'overall': 'Overall',
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

  // All 17 languages + overall
  const languageTabs = [
    'overall',
    'indonesian',
    'english',
    'spanish',
    'french',
    'german',
    'portuguese',
    'japanese',
    'italian',
    'russian',
    'korean',
    'chinese',
    'arabic',
    'dutch',
    'turkish',
    'thai',
    'vietnamese',
    'hindi'
  ];

  useEffect(() => {
    loadLeaderboard(activeLeaderboardTab);
  }, [activeLeaderboardTab]);

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showLanguageDropdown && !target.closest('.language-dropdown-container')) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageDropdown]);

  const loadLeaderboard = async (tab: string) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_TYPEMETEOR_API_URL || 'https://typemeteor.sbs/api';
      
      if (tab === 'overall') {
        // Fetch all language leaderboards and aggregate
        const languages = [
          'indonesian', 'english', 'spanish', 'french', 'german', 'portuguese',
          'japanese', 'italian', 'russian', 'korean', 'chinese', 'arabic',
          'dutch', 'turkish', 'thai', 'vietnamese', 'hindi'
        ];
        
        const allScores: { [key: string]: LeaderboardEntry[] } = {};
        
        // Fetch all language leaderboards
        for (const lang of languages) {
          try {
            const response = await fetch(`${apiUrl}/leaderboard/${lang}`);
            if (response.ok) {
              const data = await response.json() as { leaderboard?: LeaderboardEntry[], scores?: LeaderboardEntry[] };
              allScores[lang] = data.leaderboard || data.scores || [];
            }
          } catch (error) {
            console.error(`Error loading ${lang} leaderboard:`, error);
          }
        }
        
        // Aggregate scores by player name
        const playerTotals: { [key: string]: { name: string, totalWpm: number, count: number, bestAccuracy: number, languages: string[] } } = {};
        
        Object.entries(allScores).forEach(([lang, scores]) => {
          scores.forEach(score => {
            if (!playerTotals[score.name]) {
              playerTotals[score.name] = {
                name: score.name,
                totalWpm: 0,
                count: 0,
                bestAccuracy: 0,
                languages: []
              };
            }
            playerTotals[score.name].totalWpm += score.wpm;
            playerTotals[score.name].count += 1;
            playerTotals[score.name].bestAccuracy = Math.max(playerTotals[score.name].bestAccuracy, score.accuracy);
            if (!playerTotals[score.name].languages.includes(lang)) {
              playerTotals[score.name].languages.push(lang);
            }
          });
        });
        
        // Convert to leaderboard format and sort by total WPM
        const aggregatedLeaderboard: LeaderboardEntry[] = Object.values(playerTotals)
          .map(player => ({
            name: player.name,
            language: `${player.count} ${player.count === 1 ? 'language' : 'languages'}`,
            wpm: player.totalWpm,
            accuracy: player.bestAccuracy,
            timestamp: new Date().toISOString()
          }))
          .sort((a, b) => b.wpm - a.wpm)
          .slice(0, 10);
        
        setLeaderboard(aggregatedLeaderboard);
        setLoading(false);
        return;
      } else {
        const url = `${apiUrl}/leaderboard/${tab}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          setLeaderboard([]);
          setLoading(false);
          return;
        }
        
        const data = await response.json() as { leaderboard?: LeaderboardEntry[], scores?: LeaderboardEntry[] };
        setLeaderboard(data.leaderboard || data.scores || []);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
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
    // Always select on first click
    setSelectedLanguage(lang);
  };

  const LanguageCard: React.FC<LanguageCardProps> = ({ code, name, native, flag }) => {
    const isSelected = selectedLanguage === code;
    const isHovered = hoveredCard === code && !isSelected; // Don't hover if selected
    
    return (
      <div
        onClick={() => selectLanguage(code)}
        onMouseEnter={() => !isSelected && setHoveredCard(code)} // Only hover if not selected
        onMouseLeave={() => setHoveredCard(null)}
        className={`p-6 md:p-8 text-center cursor-pointer relative group transition-all duration-200 clip-corner overflow-hidden
          ${isSelected 
            ? 'bg-slate-800/90 border-2 border-slate-400 shadow-[0_0_40px_rgba(148,163,184,0.4)]' 
            : isHovered
            ? 'bg-slate-800/60 border border-slate-500 -translate-y-1'
            : 'bg-slate-900/40 border border-slate-700/50'
          }`}
      >
        {/* Scan line effect only on hover, not on selected */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-slate-400 to-transparent scan-line"></div>
          </div>
        )}
        
        {/* Static glow for selected */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 via-transparent to-slate-600/20 pointer-events-none"></div>
        )}
        
        <div className={`mb-3 md:mb-4 transform transition-all duration-200 ${isSelected ? 'scale-105' : isHovered ? 'scale-110' : 'scale-100'}`}>
          <img src={flag} alt={`${name} Flag`} className="w-16 h-16 md:w-20 md:h-20 mx-auto object-contain" />
        </div>
        
        <h4 className={`text-lg md:text-xl font-bold mb-1 md:mb-2 transition-colors duration-200 ${isSelected ? 'text-white' : isHovered ? 'text-white' : 'text-gray-200'}`}>
          {name}
        </h4>
        
        <p className={`text-xs md:text-sm uppercase tracking-wider transition-colors duration-200 ${isSelected ? 'text-gray-300' : isHovered ? 'text-gray-300' : 'text-gray-400'}`}>
          {native}
        </p>
        
        {isSelected && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 bg-white flex items-center justify-center text-slate-900 font-bold shadow-lg clip-corner-sm">
            <span className="text-lg md:text-xl">✓</span>
          </div>
        )}
        
        {/* Corner accent - only show on selected */}
        {isSelected && (
          <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-t-2 border-r-2 border-slate-400"></div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Animated Background with mouse-following effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-slate-700/10 blur-3xl animate-pulse transition-transform duration-1000" 
          style={{ 
            animationDuration: '8s',
            transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
            top: 0,
            left: '-12rem'
          }} 
        />
        <div 
          className="absolute w-96 h-96 bg-slate-600/10 blur-3xl animate-pulse transition-transform duration-1000" 
          style={{ 
            animationDuration: '8s', 
            animationDelay: '2s',
            transform: `translate(${-mousePosition.x / 50}px, ${-mousePosition.y / 50}px)`,
            bottom: 0,
            right: '-12rem'
          }} 
        />
        <div 
          className="absolute w-96 h-96 bg-slate-800/10 blur-3xl animate-pulse transition-transform duration-1000" 
          style={{ 
            animationDuration: '8s', 
            animationDelay: '4s',
            transform: `translate(${mousePosition.x / 100}px, ${mousePosition.y / 100}px)`,
            top: '50%',
            left: '50%'
          }} 
        />
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        .clip-corner {
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
        }
        .clip-corner-sm {
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
        }
        .clip-corner-lg {
          clip-path: polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%);
        }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(200%); opacity: 0; }
        }
        .scan-line {
          animation: scanline 2s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(148, 163, 184, 0.2); }
          50% { box-shadow: 0 0 40px rgba(148, 163, 184, 0.4); }
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .slide-in-left { animation: slideInLeft 0.6s ease-out; }
        .slide-in-right { animation: slideInRight 0.6s ease-out; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.6s ease-out; }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        .stagger-7 { animation-delay: 0.7s; }
        .stagger-8 { animation-delay: 0.8s; }
        .stagger-9 { animation-delay: 0.9s; }
        .stagger-10 { animation-delay: 1s; }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        
        .interactive-card {
          position: relative;
        }
        .interactive-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(148, 163, 184, 0.1), transparent 40%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .interactive-card:hover::before {
          opacity: 1;
        }
        
        @keyframes rotateIn {
          from { transform: rotate(-180deg) scale(0); opacity: 0; }
          to { transform: rotate(0) scale(1); opacity: 1; }
        }
        .rotate-in { animation: rotateIn 0.5s ease-out; }
        
        /* Number counter effect */
        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px) scale(0.5); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .count-up { animation: countUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        
        /* Glitch text effect */
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .glitch:hover { animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) both; }
      `}</style>

      <div className="relative">
        {/* Navigation - NO FLOAT ON LOGO */}
        <nav className="sticky top-0 z-50 px-4 md:px-6 pt-6 backdrop-blur-sm">
          <div className="container mx-auto">
            <div className="bg-slate-900/95 border-b-2 border-slate-700/50 px-4 md:px-6 py-3 flex justify-between items-center shadow-lg shadow-black/20 clip-corner pulse-glow">
              <div className="flex items-center gap-3 slide-in-left">
                <div className="w-10 h-10 flex items-center justify-center bg-slate-800 shadow-md clip-corner-sm">
                  <img src="/icon/meteoricon.png" alt="Typemeteor Icon" className="w-6 h-6" />
                </div>
                <h1 className="text-xl md:text-2xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent tracking-[0.2em] glitch">
                  TYPEMETEOR
                </h1>
              </div>
              <div className="hidden md:flex gap-8 items-center text-sm font-medium uppercase tracking-wider slide-in-right">
                <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 hover:tracking-widest">
                  Features
                </button>
                <button onClick={() => scrollToSection('languages')} className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 hover:tracking-widest">
                  Languages
                </button>
                <button onClick={() => scrollToSection('leaderboard')} className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 hover:tracking-widest">
                  Leaderboard
                </button>
                <button onClick={scrollToLanguages} className="bg-slate-700 hover:bg-slate-600 px-5 py-2.5 font-semibold shadow-md transition-all duration-300 clip-corner-sm hover:scale-110 hover:shadow-lg hover:shadow-slate-600/50">
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
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/90 to-slate-950/50" />
          
          <div className="relative z-10 w-full max-w-6xl flex flex-col gap-10">
            {/* Logo */}
            <div className="flex justify-center fade-in-up">
              <div className="bg-slate-900/90 border-l-4 border-slate-600 px-10 py-6 md:px-16 md:py-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col items-center gap-4 clip-corner-lg hover:border-slate-400 transition-all duration-300 hover:shadow-[0_35px_80px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-3 md:gap-4">
                  <img src="/icon/meteoricon.png" alt="Meteor Icon" className="w-12 h-12 rotate-in" />
                  <span className="text-3xl md:text-5xl font-black tracking-[0.2em] uppercase">
                    TYPE<span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">METEOR</span>
                  </span>
                </div>
                <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-gray-400 text-center shimmer">
                  Test your typing speed and compete with other users.
                </p>
              </div>
            </div>

            {/* Banner */}
            <div className="flex justify-center fade-in-up stagger-1">
              <div className="bg-slate-700 px-8 md:px-16 py-3 md:py-4 shadow-[0_18px_40px_rgba(0,0,0,0.4)] clip-corner hover:bg-slate-600 transition-all duration-300 hover:scale-105">
                <p className="text-sm md:text-xl font-black tracking-[0.35em] md:tracking-[0.5em] uppercase text-center">
                  Free Typing · typemeteor
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 max-w-3xl mx-auto w-full fade-in-up stagger-2">
              <button
                onClick={scrollToLanguages}
                className="flex-1 bg-slate-900/90 border-l-4 border-slate-600 px-6 md:px-10 py-4 md:py-6 flex items-center justify-between hover:border-slate-500 hover:bg-slate-800/90 transition-all duration-300 shadow-[0_18px_40px_rgba(0,0,0,0.3)] clip-corner group hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <img src="/icon/meteoricon.png" alt="Restart Icon" className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-gray-400 group-hover:text-gray-300 transition-colors">
                      Start Typing
                    </p>
                    <p className="text-lg md:text-xl font-bold text-white">Start 1-Minute Test</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => scrollToSection('leaderboard')}
                className="flex-1 bg-slate-700 text-white px-6 md:px-10 py-4 md:py-6 flex items-center justify-between hover:bg-slate-600 transition-all duration-300 shadow-[0_18px_40px_rgba(0,0,0,0.3)] clip-corner group hover:scale-105">
                <div className="text-left">
                  <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-gray-300 group-hover:text-white transition-colors">
                    Ranking Area
                  </p>
                  <p className="text-lg md:text-xl font-black">Explore Leaderboard</p>
                </div>
                <div className="w-10 h-10 border-2 border-white/30 flex items-center justify-center clip-corner-sm group-hover:border-white/50 group-hover:rotate-12 transition-all duration-300">
                  <img src="/icon/rocket.png" alt="Arrow" className="w-6 h-6" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 fade-in-up">
              <h3 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wider">
                Why Choose <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">Typemeteor?</span>
              </h3>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to improve your typing skills in one place
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '/icon/globe.png', title: 'Multi-Language', desc: 'Practice typing in 17 languages including Indonesian, English, Spanish, French, German, Portuguese, Japanese, and more', delay: '0s' },
                { icon: '/icon/analytics.png', title: 'Real-Time Analytics', desc: 'Track your WPM, accuracy, and progress with detailed real-time statistics and performance insights', delay: '0.2s' },
                { icon: '/icon/competition.png', title: 'Competition', desc: 'Compete with typists worldwide on our leaderboard and see how you rank among the best', delay: '0.4s' }
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="bg-slate-900/50 border-l-4 border-slate-700 p-8 hover:bg-slate-800/50 hover:border-slate-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer clip-corner interactive-card group fade-in-up"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="w-16 h-16 bg-slate-800 flex items-center justify-center mb-6 shadow-md clip-corner-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <img src={feature.icon} alt={feature.title} className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide group-hover:text-slate-200 transition-colors">{feature.title}</h4>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Language Selection */}
        <section id="languages" className="py-24 px-6 bg-linear-to-b from-transparent to-slate-900/50">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 fade-in-up">
              <h3 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wider">
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
                    setCurrentPage(currentPage - 1);
                  }
                }}
                disabled={currentPage === 0}
                className={`hidden lg:flex absolute -left-20 top-1/2 -translate-y-1/2 w-16 h-16 bg-slate-900/50 border-2 border-slate-700/50 items-center justify-center transition-all hover:bg-slate-800/50 hover:border-slate-600 hover:scale-110 shadow-lg z-10 clip-corner-sm ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-slate-600/50'}`}>
                <img src="/icon/left-arrow.png" alt="Previous" className="w-6 h-6" />
              </button>

              {/* Language Grid Container */}
              <div className="overflow-hidden py-2">
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
                    <div className="hidden lg:block"></div>
                    <div className="hidden lg:block"></div>
                    <div className="hidden lg:block"></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentPage < totalPages - 1) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                disabled={currentPage === totalPages - 1}
                className={`hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 w-16 h-16 bg-slate-900/50 border-2 border-slate-700/50 items-center justify-center transition-all hover:bg-slate-800/50 hover:border-slate-600 hover:scale-110 shadow-lg z-10 clip-corner-sm ${currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-slate-600/50'}`}>
                <img src="/icon/right-arrow.png" alt="Next" className="w-6 h-6" />
              </button>

              {/* Page Dots (Mobile) */}
              <div className="flex lg:hidden justify-center gap-3 mt-8">
                {[0, 1, 2].map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-3 transition-all duration-300 ${
                      currentPage === page 
                        ? 'w-8 bg-slate-500' 
                        : 'w-3 bg-slate-700/50 hover:bg-slate-600/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Start Button */}
            {selectedLanguage && (
              <div className="text-center mt-12 fade-in-up">
                <Link 
                  href={`/language/${selectedLanguage}`}
                  className="bg-slate-700 hover:bg-slate-600 px-16 py-6 font-bold text-2xl shadow-xl transition-all duration-300 inline-flex items-center gap-3 hover:scale-110 clip-corner uppercase tracking-wider pulse-glow"
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

        {/* Leaderboard Section with Dropdown */}
        <section id="leaderboard" className="py-24 px-6 bg-linear-to-b from-slate-900/50 to-transparent">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 fade-in-up">
              <h3 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wider">
                Global <span className="bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent">Leaderboard</span>
              </h3>
              <p className="text-xl text-gray-400">
                See how you rank against the world's fastest typists
              </p>
            </div>
            
            {/* Slide Navigation with Dropdown */}
            <div className="mb-8 relative">
              <div className="flex items-center gap-4 justify-center">
                <button
                  onClick={() => {
                    const currentIndex = languageTabs.indexOf(activeLeaderboardTab);
                    if (currentIndex > 0) {
                      setActiveLeaderboardTab(languageTabs[currentIndex - 1]);
                      setShowLanguageDropdown(false);
                    }
                  }}
                  disabled={languageTabs.indexOf(activeLeaderboardTab) === 0}
                  className={`w-12 h-12 flex items-center justify-center bg-slate-900/50 border-2 border-slate-700/50 transition-all hover:bg-slate-800/50 hover:border-slate-600 hover:scale-110 shadow-lg clip-corner-sm ${
                    languageTabs.indexOf(activeLeaderboardTab) === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-slate-600/50'
                  }`}
                >
                  <img src="/icon/left-arrow.png" alt="Previous" className="w-5 h-5" />
                </button>

                <div className="relative language-dropdown-container">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="bg-slate-900/50 px-8 py-3 font-bold uppercase tracking-wider clip-corner-sm min-w-[200px] text-center border-l-4 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 transition-all flex items-center justify-between gap-3"
                  >
                    <span className="text-white">{languageNames[activeLeaderboardTab]}</span>
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${showLanguageDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showLanguageDropdown && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[90vw] max-w-[600px] bg-slate-900/98 border-2 border-slate-700 shadow-xl z-50 clip-corner backdrop-blur-sm max-h-[400px] overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-2">
                        {languageTabs.map((tab) => (
                          <button
                            key={tab}
                            onClick={() => {
                              setActiveLeaderboardTab(tab);
                              setShowLanguageDropdown(false);
                            }}
                            className={`px-3 py-3 text-center hover:bg-slate-800/70 transition-all uppercase tracking-wider text-xs md:text-sm font-semibold border-l-4 bg-slate-900/95 clip-corner-sm ${
                              activeLeaderboardTab === tab 
                                ? 'border-slate-400 text-white bg-slate-800/50' 
                                : 'border-transparent text-gray-300 hover:border-slate-600'
                            }`}
                          >
                            {languageNames[tab]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const currentIndex = languageTabs.indexOf(activeLeaderboardTab);
                    if (currentIndex < languageTabs.length - 1) {
                      setActiveLeaderboardTab(languageTabs[currentIndex + 1]);
                      setShowLanguageDropdown(false);
                    }
                  }}
                  disabled={languageTabs.indexOf(activeLeaderboardTab) === languageTabs.length - 1}
                  className={`w-12 h-12 flex items-center justify-center bg-slate-900/50 border-2 border-slate-700/50 transition-all hover:bg-slate-800/50 hover:border-slate-600 hover:scale-110 shadow-lg clip-corner-sm ${
                    languageTabs.indexOf(activeLeaderboardTab) === languageTabs.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:shadow-slate-600/50'
                  }`}
                >
                  <img src="/icon/right-arrow.png" alt="Next" className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 border-l-4 border-slate-700 p-6 md:p-8 clip-corner-lg">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin inline-block w-12 h-12 border-4 border-slate-600 border-t-slate-400 mb-4"></div>
                  <p className="text-gray-400 uppercase tracking-wider">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((score: LeaderboardEntry, i: number) => (
                    <div
                      key={i}
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 border-l-4 transition-all duration-300 clip-corner interactive-card group fade-in-up stagger-${i + 1}
                        ${i < 3 ? 'bg-slate-800/60 border-slate-400' : 'bg-slate-900/30 border-slate-700/30'} 
                        hover:bg-slate-700/40 hover:border-slate-500 hover:-translate-y-1 hover:shadow-lg`}
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 w-full md:w-auto mb-3 md:mb-0">
                        <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-black text-xl md:text-2xl shrink-0 clip-corner-sm transition-all duration-300 count-up
                          ${i < 3 ? 'bg-slate-700 group-hover:scale-110 group-hover:rotate-6' : 'bg-slate-800 group-hover:scale-105'}`}
                        >
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-base md:text-lg text-white truncate uppercase tracking-wide group-hover:text-slate-200 transition-colors">
                            {score.name}
                          </div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">
                            {activeLeaderboardTab === 'overall' ? score.language : new Date(score.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-6 md:gap-8 items-center shrink-0 w-full md:w-auto justify-end">
                        <div className="text-center">
                          <div className="font-black text-xl md:text-2xl bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent count-up">
                            {score.wpm}
                          </div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">{activeLeaderboardTab === 'overall' ? 'Total' : 'WPM'}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-black text-lg md:text-xl text-emerald-400 count-up">{score.accuracy}%</div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider">ACC</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8 uppercase tracking-wider">No scores available yet. Be the first to set a record!</p>
              )}
            </div>
            
            {/* Stats Summary */}
            {!loading && leaderboard.length > 0 && (
              <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4 fade-in-up">
                <div className="bg-slate-900/50 border-l-4 border-slate-700 p-3 md:p-4 clip-corner hover:border-slate-600 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-xl md:text-2xl font-black text-white count-up">{leaderboard.length}</div>
                  <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Players</div>
                </div>
                <div className="bg-slate-900/50 border-l-4 border-slate-700 p-3 md:p-4 clip-corner hover:border-slate-600 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-xl md:text-2xl font-black text-emerald-400 count-up">
                    {leaderboard.length > 0 ? Math.max(...leaderboard.map(s => s.wpm)) : 0}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Top {activeLeaderboardTab === 'overall' ? 'Total' : 'WPM'}</div>
                </div>
                <div className="bg-slate-900/50 border-l-4 border-slate-700 p-3 md:p-4 clip-corner hover:border-slate-600 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-xl md:text-2xl font-black text-yellow-400 count-up">
                    {leaderboard.length > 0 ? Math.max(...leaderboard.map(s => s.accuracy)) : 0}%
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Best ACC</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t-2 border-slate-700/30">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4 fade-in-up">
              <div className="w-8 h-8 flex items-center justify-center clip-corner-sm">
                <img src="/icon/meteoricon.png" alt="Meteor Icon" className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black bg-linear-to-r from-slate-200 to-white bg-clip-text text-transparent tracking-[0.2em]">TYPEMETEOR</h1>
            </div>
            <p className="text-gray-400 mb-2 uppercase tracking-wider">© 2025 Typemeteor</p>
            <p className="text-gray-500 text-sm">Made with ❤️ for typists worldwide</p>
          </div>
        </footer>
      </div>
    </div>
  );
}