/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types';
import { localization } from '../utils/localization';
import { sfx } from '../utils/audio';
import { Sparkles, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onStart: () => void;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onToggleSound: () => void;
  onToggleVoice: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  onStart,
  soundEnabled,
  voiceEnabled,
  onToggleSound,
  onToggleVoice,
}) => {
  const t = localization[currentLanguage];

  const handleLangBtn = (lang: Language) => {
    sfx.playClick();
    onSelectLanguage(lang);
  };

  const handleStart = () => {
    sfx.playClick();
    onStart();
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center p-4 sm:p-6 bg-white/75 backdrop-blur-md border-2 border-white shadow-xl rounded-3xl relative z-10 animate-fade-in">
      {/* Decorative Floating Top Accent */}
      <div className="absolute top-[-20px] text-3xl sm:text-4xl animate-bounce">🏝️✨</div>

      <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-emerald-800 font-display mb-1 sm:mb-2 leading-tight">
        {t.title}
      </h1>
      <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 mb-3 sm:mb-5 max-w-md">
        {t.subtitle}
      </p>

      {/* Language Buttons Row */}
      <div className="w-full space-y-1.5 sm:space-y-2 mb-3 sm:mb-5">
        <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest text-left mb-1 px-1">
          {t.selectLanguage}
        </p>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            id="lang-ar-btn"
            onClick={() => handleLangBtn('ar')}
            className={`py-2.5 sm:py-4 px-3 sm:px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-between border-2 transition-all active:scale-95 cursor-pointer ${
              currentLanguage === 'ar'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-white shadow-lg shadow-teal-100 scale-102'
                : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200'
            }`}
          >
            <span>العربية</span>
            <span className="text-lg sm:text-xl">🇸🇦</span>
          </button>

          <button
            id="lang-en-btn"
            onClick={() => handleLangBtn('en')}
            className={`py-2.5 sm:py-4 px-3 sm:px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-between border-2 transition-all active:scale-95 cursor-pointer ${
              currentLanguage === 'en'
                ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white border-white shadow-lg shadow-blue-100 scale-102'
                : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200'
            }`}
          >
            <span>English</span>
            <span className="text-lg sm:text-xl">🇬🇧</span>
          </button>

          <button
            id="lang-fr-btn"
            onClick={() => handleLangBtn('fr')}
            className={`py-2.5 sm:py-4 px-3 sm:px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-between border-2 transition-all active:scale-95 cursor-pointer ${
              currentLanguage === 'fr'
                ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white border-white shadow-lg shadow-orange-100 scale-102'
                : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200'
            }`}
          >
            <span>Français</span>
            <span className="text-lg sm:text-xl">🇫🇷</span>
          </button>

          <button
            id="lang-de-btn"
            onClick={() => handleLangBtn('de')}
            className={`py-2.5 sm:py-4 px-3 sm:px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-between border-2 transition-all active:scale-95 cursor-pointer ${
              currentLanguage === 'de'
                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white border-white shadow-lg shadow-yellow-100 scale-102'
                : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200'
            }`}
          >
            <span>Deutsch</span>
            <span className="text-lg sm:text-xl">🇩🇪</span>
          </button>
        </div>
      </div>

      {/* Auxiliary Settings Panel (SFX / Voice) */}
      <div className="w-full flex justify-center gap-3 bg-white/40 border-2 border-white/60 p-2 rounded-2xl mb-3 sm:mb-5">
        <button
          id="toggle-sfx-btn"
          onClick={() => { sfx.playClick(); onToggleSound(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
            soundEnabled 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
              : 'bg-white/50 text-slate-400 border border-slate-200'
          }`}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>{soundEnabled ? 'SFX ON' : 'SFX OFF'}</span>
        </button>

        <button
          id="toggle-voice-btn"
          onClick={() => { sfx.playClick(); onToggleVoice(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
            voiceEnabled 
              ? 'bg-orange-50 text-orange-600 border border-orange-100' 
              : 'bg-white/50 text-slate-400 border border-slate-200'
          }`}
        >
          {voiceEnabled ? <Mic size={13} /> : <MicOff size={13} />}
          <span>{voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}</span>
        </button>
      </div>

      {/* Giant CTA Play button */}
      <button
        id="play-adventure-btn"
        onClick={handleStart}
        className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 text-white font-black text-lg shadow-xl shadow-teal-200/50 hover:shadow-2xl transition-all duration-300 transform active:scale-98 hover:scale-101 flex items-center justify-center gap-2 group cursor-pointer border-2 border-white/50"
      >
        <Sparkles size={20} className="animate-spin-slow group-hover:rotate-12 duration-300" />
        <span>{t.playButton}</span>
      </button>

      <p className="text-[9px] text-emerald-900/80 mt-4 tracking-wide uppercase font-extrabold">
        Premium Preschool Learning Studio
      </p>
    </div>
  );
};
