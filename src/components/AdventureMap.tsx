/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, LetterData } from '../types';
import { localization } from '../utils/localization';
import { getLettersForLanguage } from '../utils/letters';
import { sfx } from '../utils/audio';
import { Trophy, Home, HelpCircle } from 'lucide-react';

interface AdventureMapProps {
  language: Language;
  stars: number;
  completedLetters: string[];
  onSelectLetter: (index: number) => void;
  onHome: () => void;
  onViewCertificate?: () => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  language,
  stars,
  completedLetters,
  onSelectLetter,
  onHome,
  onViewCertificate,
}) => {
  const t = localization[language];
  const letters = getLettersForLanguage(language);

  // A level is unlocked if it's the first level OR the previous level is completed
  const isLevelUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLetter = letters[index - 1].char;
    return completedLetters.includes(prevLetter);
  };

  const handleLevelSelect = (index: number) => {
    if (isLevelUnlocked(index)) {
      sfx.playClick();
      onSelectLetter(index);
    } else {
      sfx.playWarn();
    }
  };

  const handleHome = () => {
    sfx.playClick();
    onHome();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[80vh] justify-between p-4 sm:p-6 bg-white/75 backdrop-blur-md border-2 border-white shadow-xl rounded-3xl animate-fade-in relative z-10">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
        <div className="flex gap-2">
          <button
            onClick={handleHome}
            className="p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white text-emerald-800 border-2 border-white shadow-md cursor-pointer transition active:scale-90"
            title={language === 'ar' ? 'الرئيسية' : 'Home'}
          >
            <Home size={15} />
          </button>
          
          {onViewCertificate && (
            <button
              onClick={() => { sfx.playClick(); onViewCertificate(); }}
              className="p-2 sm:p-3 px-3 sm:px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-white border-2 border-white shadow-md cursor-pointer transition active:scale-90 flex items-center gap-1 font-bold text-xs"
              title={language === 'ar' ? 'عرض الشهادة والنتيجة' : 'View Certificate'}
            >
              <Trophy size={14} />
              <span>{language === 'ar' ? 'الشهادة' : 'Award'}</span>
            </button>
          )}
        </div>

        <h2 className="text-lg sm:text-2xl font-black text-emerald-800 font-display">
          {t.mapTitle}
        </h2>

        {/* Global Stars Counter */}
        <div className="flex items-center gap-1 bg-white/95 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border-2 border-white shadow-md text-amber-500 font-black text-xs sm:text-sm animate-pulse">
          <span>⭐</span>
          <span>{stars}</span>
        </div>
      </div>

      <p className="text-[10px] sm:text-xs text-slate-600 text-center mb-2 sm:mb-4">
        {t.mapSub}
      </p>

      {/* Grid of letters as floating cloud islands */}
      <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 py-1.5 select-none">
        {letters.map((letData, idx) => {
          const unlocked = isLevelUnlocked(idx);
          const completed = completedLetters.includes(letData.char);
          
          return (
            <button
              key={letData.char}
              onClick={() => handleLevelSelect(idx)}
              disabled={!unlocked}
              className={`aspect-square p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-between border-2 transition-all duration-300 relative cursor-pointer ${
                unlocked
                  ? completed
                    ? 'bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-600 text-white shadow-lg border-white/60 scale-100 shadow-emerald-100/40'
                    : 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md border-white/60 hover:scale-102 hover:shadow-lg hover:shadow-orange-100/30'
                  : 'bg-white/40 text-slate-400 border-white/40 opacity-60 cursor-not-allowed'
              } bubble-btn`}
            >
              {/* Star Rating Badge */}
              <div className="text-[8px] sm:text-[9px] text-amber-300 font-extrabold tracking-widest min-h-[10px] sm:min-h-[12px]">
                {completed ? '⭐⭐⭐' : ''}
              </div>

              {/* Character */}
              <span className="text-2xl sm:text-4xl font-black font-display tracking-tight leading-none text-white drop-shadow-sm">
                {unlocked ? letData.char : '🔒'}
              </span>

              {/* Name */}
              <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${unlocked ? 'text-white/90' : 'text-slate-400'}`}>
                {unlocked ? letData.name : `${t.level} ${idx + 1}`}
              </span>

              {/* Glowing ring around active progress island */}
              {unlocked && !completed && (
                <div className="absolute inset-0 border-2 border-dashed border-white/60 rounded-2xl sm:rounded-3xl animate-spin-slow pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Backside credit */}
      <div className="text-[9px] sm:text-[10px] text-slate-500 text-center mt-2 sm:mt-4 font-bold uppercase">
        {completedLetters.length} / {letters.length} {t.progress} completed
      </div>
    </div>
  );
};
