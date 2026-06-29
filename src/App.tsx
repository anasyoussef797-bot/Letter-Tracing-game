/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Language, GameState, LetterData } from './types';
import { getLettersForLanguage } from './utils/letters';
import { sfx, voice } from './utils/audio';
import { localization } from './utils/localization';
import { LanguageSelector } from './components/LanguageSelector';
import { AvatarSelector, avatarsList } from './components/AvatarSelector';
import { AdventureMap } from './components/AdventureMap';
import { TracingCanvas } from './components/TracingCanvas';
import { CelebrationModal } from './components/CelebrationModal';
import { ScreenshotModal } from './components/ScreenshotModal';
import { CertificateView } from './components/CertificateView';
import { Volume2, VolumeX, Mic, MicOff, Share2, Award, Sparkles, LogOut, ArrowLeft } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    language: 'en',
    screen: 'start',
    selectedAvatar: 'bunny',
    score: 0,
    stars: 0,
    completedLetters: [],
    currentLetterIdx: 0,
    soundEnabled: true,
    voiceEnabled: true,
  });

  const [drawProgress, setDrawProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);

  // Initialize Speech synthesis voice preloading on startup
  useEffect(() => {
    voice.loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        voice.loadVoices();
      };
    }
  }, []);

  // Synchronize audio configuration settings with sfx and voice managers
  useEffect(() => {
    sfx.enabled = gameState.soundEnabled;
    voice.enabled = gameState.voiceEnabled;
    if (gameState.soundEnabled && gameState.screen !== 'start') {
      sfx.startBgm();
    } else {
      sfx.stopBgm();
    }
  }, [gameState.soundEnabled, gameState.voiceEnabled, gameState.screen]);

  const activeLetters = getLettersForLanguage(gameState.language);
  const activeLetter: LetterData = activeLetters[gameState.currentLetterIdx] || activeLetters[0];
  const t = localization[gameState.language];
  const avatar = avatarsList.find(a => a.id === gameState.selectedAvatar) || avatarsList[2];

  // Language adjustment callback
  const handleSelectLanguage = (lang: Language) => {
    setGameState(prev => ({
      ...prev,
      language: lang,
      // Reset progress lists when changing language to let them explore anew
      completedLetters: [],
      currentLetterIdx: 0,
    }));
  };

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, screen: 'avatar' }));
  };

  const handleConfirmAvatar = () => {
    setGameState(prev => ({ ...prev, screen: 'map' }));
  };

  const handleSelectLetter = (index: number) => {
    setDrawProgress(0);
    setGameState(prev => ({
      ...prev,
      currentLetterIdx: index,
      screen: 'play',
    }));
    
    // Pronounce initial level introduction letter name
    const letter = activeLetters[index];
    if (letter) {
      setTimeout(() => {
        voice.speakLetter(letter.char, letter.name, gameState.language, letter.example.word);
      }, 500);
    }
  };

  const handleStrokeComplete = (strokeIdx: number) => {
    // Award little points per stroke completed
    setGameState(prev => ({
      ...prev,
      score: prev.score + 25,
    }));
  };

  const handleLetterComplete = () => {
    sfx.playSuccess(); // Trigger the beautiful, premium celebration audio fanfare!
    setShowCelebration(true);
    setGameState(prev => {
      const nextCompleted = [...prev.completedLetters];
      if (!nextCompleted.includes(activeLetter.char)) {
        nextCompleted.push(activeLetter.char);
      }
      return {
        ...prev,
        completedLetters: nextCompleted,
        stars: Math.min(nextCompleted.length * 3, activeLetters.length * 3),
        score: prev.score + 100, // Large completion bonus
      };
    });
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    const nextIdx = gameState.currentLetterIdx + 1;
    if (nextIdx < activeLetters.length) {
      handleSelectLetter(nextIdx);
    } else {
      setGameState(prev => ({ ...prev, screen: 'map' }));
    }
  };

  const handleRetryLevel = () => {
    setShowCelebration(false);
    setDrawProgress(0);
    voice.speakLetter(activeLetter.char, activeLetter.name, gameState.language, activeLetter.example.word);
  };

  const handleWarningTrigger = () => {
    // Speak soft verbal retry tip
    voice.speakRetry(gameState.language);
  };

  // Polaroid camera capture generator
  const handleCaptureScreenshot = () => {
    const drawingCanvas = document.getElementById('tracing-board-canvas') as HTMLCanvasElement;
    if (!drawingCanvas) return;

    // Build a beautiful physical Polaroid card composition onto a canvas
    const captureCanvas = document.createElement('canvas');
    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;

    captureCanvas.width = 500;
    captureCanvas.height = 620;

    // Card white plastic background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 500, 620);

    // Dynamic linear sky gradient background in camera lens window
    const grad = ctx.createLinearGradient(0, 20, 0, 460);
    grad.addColorStop(0, '#7dd3fc');
    grad.addColorStop(0.5, '#bae6fd');
    grad.addColorStop(1, '#fef08a');
    ctx.fillStyle = grad;
    ctx.fillRect(20, 20, 460, 440);

    // Draw child's actual canvas work overlayed inside Polaroid lens
    ctx.drawImage(drawingCanvas, 20, 20, 460, 440);

    // Polaroid Bottom Text Box
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`My Drawing of "${activeLetter.char}"`, 250, 520);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 16px "Inter", sans-serif';
    ctx.fillText(`${activeLetter.example.emoji} ${activeLetter.example.word} • 3D Tracing Adventure`, 250, 560);

    // Show Lightbox Modal
    setScreenshotSrc(captureCanvas.toDataURL('image/png'));
  };

  // Download of the standalone HTML deliverable for immediate offline use anywhere!
  const handleDownloadStandalone = () => {
    sfx.playClick();
    window.open('/standalone_tracing_adventure.html', '_blank');
  };

  const isRtl = gameState.language === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="text-slate-800 min-h-screen relative w-full font-sans flex flex-col justify-between"
      style={{ background: 'linear-gradient(180deg, #A3E4F7 0%, #D1F5FF 100%)' }}
    >
      {/* PERSISTENT BRANDING HEADER */}
      <div className="relative z-30 w-full bg-gradient-to-r from-sky-100/90 via-white/85 to-teal-100/90 backdrop-blur-md text-emerald-800 py-2.5 px-6 flex items-center justify-center text-center shadow-sm border-b border-white/60 text-xs sm:text-sm font-black font-display tracking-wide select-none">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-sm">🚀</span>
          <span>{gameState.language === 'ar' ? 'مغامرة الحروف ثلاثية الأبعاد' : '3D Letter Tracing Adventure'}</span>
          <span className="opacity-40 px-1">|</span>
          <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs shadow-inner">Impact Hub Egypt 🌟</span>
        </div>
      </div>
      {/* 3D FLOATING SCENIC CLOUDS BACKDROP */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-32 h-16 bg-white opacity-80 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-[15%] right-[10%] w-48 h-24 bg-white opacity-60 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-[40%] left-[80%] w-24 h-12 bg-white opacity-70 rounded-full blur-lg"></div>
      </div>

      {/* NATURAL GRASSY HILL BASE AT THE BOTTOM */}
      <div 
        className="absolute bottom-[-180px] left-1/2 -translate-x-1/2 w-[1300px] sm:w-[1600px] h-[360px] md:h-[400px] rounded-[100%] pointer-events-none z-0 transition-all duration-300"
        style={{ 
          background: 'radial-gradient(circle, #92D050 0%, #4CAF50 70%)', 
          boxShadow: 'inset 0 20px 50px rgba(0,0,0,0.15)', 
          borderTop: '5px solid #B7E18B' 
        }}
      ></div>

      {/* TOP HEADER STATUS CONTROL GRID (Always visible except start screen) */}
      {gameState.screen !== 'start' && (
        <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              sfx.playClick();
              setGameState(prev => ({
                ...prev,
                screen: prev.screen === 'play' ? 'map' : 'start',
              }));
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md hover:bg-white text-emerald-800 font-bold text-sm shadow-md transition-all border-2 border-white active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{t.back}</span>
          </button>

          {/* Quick Audio Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className={`p-2.5 rounded-2xl transition-all shadow-md active:scale-90 border-2 cursor-pointer ${
                gameState.soundEnabled 
                  ? 'bg-white/90 text-emerald-600 border-white' 
                  : 'bg-white/40 text-slate-400 border-white/60 backdrop-blur-sm'
              }`}
            >
              {gameState.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={() => setGameState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
              className={`p-2.5 rounded-2xl transition-all shadow-md active:scale-90 border-2 cursor-pointer ${
                gameState.voiceEnabled 
                  ? 'bg-white/90 text-orange-500 border-white' 
                  : 'bg-white/40 text-slate-400 border-white/60 backdrop-blur-sm'
              }`}
            >
              {gameState.voiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
          </div>
        </header>
      )}

      {/* MAIN SCREEN ROUTER PORTAL */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 z-10 relative">
        
        {gameState.screen === 'start' && (
          <div className="flex flex-col items-center gap-6">
            <LanguageSelector
              currentLanguage={gameState.language}
              onSelectLanguage={handleSelectLanguage}
              onStart={handleStartGame}
              soundEnabled={gameState.soundEnabled}
              voiceEnabled={gameState.voiceEnabled}
              onToggleSound={() => setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              onToggleVoice={() => setGameState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
            />

            {/* Offline standalone direct play feature button */}
            <button
              onClick={handleDownloadStandalone}
              className="py-3 px-6 rounded-full bg-white/40 backdrop-blur-sm border-2 border-white/60 hover:bg-white/60 text-emerald-900 text-xs font-black shadow-md flex items-center gap-2 bubble-btn cursor-pointer animate-pulse"
            >
              💾 <span>{t.downloadStandalone}</span>
            </button>
          </div>
        )}

        {gameState.screen === 'avatar' && (
          <AvatarSelector
            language={gameState.language}
            selectedAvatar={gameState.selectedAvatar}
            onSelectAvatar={(id) => setGameState(prev => ({ ...prev, selectedAvatar: id }))}
            onConfirm={handleConfirmAvatar}
            onBack={() => setGameState(prev => ({ ...prev, screen: 'start' }))}
          />
        )}

        {gameState.screen === 'map' && (
          <AdventureMap
            language={gameState.language}
            stars={gameState.stars}
            completedLetters={gameState.completedLetters}
            onSelectLetter={handleSelectLetter}
            onHome={() => setGameState(prev => ({ ...prev, screen: 'start' }))}
            onViewCertificate={() => setGameState(prev => ({ ...prev, screen: 'certificate' }))}
          />
        )}

        {gameState.screen === 'certificate' && (
          <CertificateView
            language={gameState.language}
            stars={gameState.stars}
            score={gameState.score}
            completedCount={gameState.completedLetters.length}
            totalCount={activeLetters.length}
            avatar={avatar}
            onRestart={() => {
              setGameState(prev => ({
                ...prev,
                screen: 'start',
                score: 0,
                stars: 0,
                completedLetters: [],
                currentLetterIdx: 0,
              }));
            }}
            onBackToMap={() => {
              setGameState(prev => ({ ...prev, screen: 'map' }));
            }}
            onShowScreenshot={(src) => {
              setScreenshotSrc(src);
            }}
          />
        )}

        {gameState.screen === 'play' && (
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 md:gap-6 items-stretch justify-between overflow-hidden">
            
            {/* CANVAS CONTAINER */}
            <div className="flex-1 flex flex-col justify-between items-center bg-white/70 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-2 border-white shadow-xl relative min-h-[260px] sm:min-h-[380px] md:min-h-[460px]">
              
              {/* Internal Gameplay Top Header */}
              <div className="w-full flex items-center justify-between mb-3 sm:mb-4">
                <button
                  onClick={() => { sfx.playClick(); setGameState(prev => ({ ...prev, screen: 'map' })); }}
                  className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/80 hover:bg-white text-emerald-800 shadow-md border-2 border-white font-extrabold text-xs flex items-center gap-1 bubble-btn cursor-pointer"
                >
                  🗺️ <span>{t.mapTitle.split(' ')[0]}</span>
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="bg-white/95 border-2 border-white text-amber-500 font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-md text-[10px] sm:text-xs flex items-center gap-1 animate-pulse">
                    <span>⭐</span>
                    <span>{gameState.stars}</span>
                  </div>
                  <div className="bg-white/95 border-2 border-white text-emerald-600 font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-md text-[10px] sm:text-xs flex items-center gap-1">
                    <span>💎</span>
                    <span>{gameState.score}</span>
                  </div>
                </div>

                <button
                  onClick={() => { sfx.playClick(); handleRetryLevel(); }}
                  className="p-2 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-white text-slate-500 shadow-md border-2 border-white bubble-btn cursor-pointer text-xs"
                >
                  🔄
                </button>
              </div>

              {/* Tracing Board Area */}
              <div className="flex-1 w-full flex items-center justify-center">
                <TracingCanvas
                  letter={activeLetter}
                  onComplete={handleLetterComplete}
                  onStrokeComplete={handleStrokeComplete}
                  onDrawProgress={(p) => setDrawProgress(p)}
                  onWarning={handleWarningTrigger}
                  lang={gameState.language}
                  avatarEmoji={avatar.emoji}
                />
              </div>

              {/* Smooth dynamic tracer progress fill */}
              <div className="w-full mt-3 sm:mt-5 bg-white/50 h-2.5 sm:h-3 rounded-full overflow-hidden shadow-inner relative border border-white/50">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-200 shadow-md"
                  style={{ width: `${drawProgress * 100}%` }}
                />
              </div>

            </div>

            {/* LETTER CARD & COMPANION MASCOT PANEL */}
            <div className="w-full md:w-80 flex flex-row md:flex-col justify-between gap-3 sm:gap-4 bg-white/70 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-2 border-white shadow-xl relative items-center md:items-stretch">
              
              {/* Mascot Bubble */}
              <div className="flex items-center gap-2 sm:gap-3 bg-white/60 p-2 sm:p-3 rounded-2xl border-2 border-white shadow-sm flex-1 md:flex-none">
                <span className="text-2xl sm:text-4xl animate-bounce">{avatar.emoji}</span>
                <div className="text-left">
                  <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-widest font-black leading-none mb-1">{t.labelMascot}</p>
                  <p className="text-xs sm:text-sm font-black text-slate-800 font-display leading-none">
                    {avatar.name[gameState.language] || avatar.name['en']}
                  </p>
                </div>
              </div>

              {/* Central Letter Display */}
              <div className="flex-1 md:flex-initial flex flex-row md:flex-col items-center justify-around md:justify-center py-1 md:py-6 text-center select-none gap-2 sm:gap-4">
                <div className="flex items-center gap-2 md:gap-3 md:flex-col">
                  <span className="text-3xl sm:text-5xl md:text-9xl font-black text-emerald-800 font-display drop-shadow-md scale-105 animate-pulse">
                    {activeLetter.char}
                  </span>

                  <button
                    onClick={() => { sfx.playClick(); voice.speakLetter(activeLetter.char, activeLetter.name, gameState.language, activeLetter.example.word); }}
                    className="py-1.5 px-3 md:py-3 md:px-6 rounded-full bg-orange-400 text-white font-extrabold text-[10px] sm:text-xs shadow-md shadow-orange-200/50 hover:bg-orange-500 hover:shadow-lg transition-all duration-200 flex items-center gap-1 bubble-btn cursor-pointer border border-white/50"
                  >
                    🔊 <span className="hidden md:inline">{t.pronounce}</span>
                  </button>
                </div>

                <div className="hidden md:block w-full border-t-2 border-white/40 my-2" />

                <div className="flex items-center md:flex-col gap-2 md:mt-3 animate-fade-in">
                  <span className="font-emoji text-3xl sm:text-5xl md:text-7xl animate-bounce-slow">{activeLetter.example.emoji}</span>
                  <div className="text-left md:text-center">
                    <p className="text-sm sm:text-lg md:text-2xl font-black text-slate-800 font-display tracking-wide uppercase leading-tight">
                      {activeLetter.example.word}
                    </p>
                    <p className="text-[9px] sm:text-xs md:text-sm text-slate-500 italic font-medium leading-none mt-1">
                      {activeLetter.example.translation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo snap trigger */}
              <button
                onClick={handleCaptureScreenshot}
                className="py-2 px-3 md:py-3.5 md:px-4 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-black text-[10px] sm:text-sm shadow-md hover:shadow-lg hover:scale-101 active:scale-98 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-2 border-white/50"
              >
                📸 <span className="hidden sm:inline">{t.screenshotSuccess.split('!')[0]}</span>
              </button>

            </div>

          </div>
        )}

      </main>

      {/* OVERLAY MODAL ELEMENTS */}
      {showCelebration && (
        <CelebrationModal
          language={gameState.language}
          letter={activeLetter}
          avatarId={gameState.selectedAvatar}
          onNext={handleNextLevel}
          onRetry={handleRetryLevel}
          onCaptureScreenshot={handleCaptureScreenshot}
        />
      )}

      {screenshotSrc && (
        <ScreenshotModal
          language={gameState.language}
          letter={activeLetter}
          imageSrc={screenshotSrc}
          onClose={() => setScreenshotSrc(null)}
        />
      )}

      {/* FOOTER FOOTPRINT credit */}
      <footer className="relative z-10 w-full text-center py-4 text-[10px] text-emerald-900/80 font-extrabold tracking-wider select-none">
        3D LETTER TRACING ADVENTURE • DEVELOPED BY IMPACT HUB EGYPT • © 2026 ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
