/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Language, LetterData, Avatar } from '../types';
import { localization } from '../utils/localization';
import { avatarsList } from './AvatarSelector';
import { sfx, voice } from '../utils/audio';

interface CelebrationModalProps {
  language: Language;
  letter: LetterData;
  avatarId: string | null;
  onNext: () => void;
  onRetry: () => void;
  onCaptureScreenshot?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  language,
  letter,
  avatarId,
  onNext,
  onRetry,
  onCaptureScreenshot,
}) => {
  const t = localization[language];
  const avatar = avatarsList.find(a => a.id === avatarId) || avatarsList[2];

  const [starCount, setStarCount] = useState(0);

  // Trigger audio encouragements and play star-appearance twinkling chimes in sequence
  useEffect(() => {
    // Say native encouragement voice
    setTimeout(() => {
      voice.speakEncouragement(language);
    }, 250);

    // Stagger the star-burst audio sounds
    const timers = [
      setTimeout(() => { setStarCount(1); sfx.playStar(0); }, 600),
      setTimeout(() => { setStarCount(2); sfx.playStar(1); }, 1050),
      setTimeout(() => { setStarCount(3); sfx.playStar(2); }, 1500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [language]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white/95 backdrop-blur-md border-2 border-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-xl relative">
        
        {/* Confetti-like explosive accent header */}
        <div className="text-7xl mb-4 animate-bounce">
          🎉{avatar.emoji}🎉
        </div>

        <h3 className="text-3xl font-black text-emerald-800 font-display mb-1">
          {t.congrats}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {t.wellDone}
        </p>

        {/* 3 Twinkling Celebratory Stars */}
        <div className="flex gap-4 mb-8 justify-center items-center">
          <span
            className={`text-4xl filter drop-shadow transition-all duration-300 transform ${
              starCount >= 1 ? 'scale-125 text-amber-400 rotate-12' : 'scale-50 text-slate-200'
            }`}
          >
            ⭐
          </span>
          <span
            className={`text-5xl filter drop-shadow transition-all duration-300 transform -translate-y-2 ${
              starCount >= 2 ? 'scale-150 text-amber-400 rotate-0' : 'scale-50 text-slate-200'
            }`}
          >
            ⭐
          </span>
          <span
            className={`text-4xl filter drop-shadow transition-all duration-300 transform ${
              starCount >= 3 ? 'scale-125 text-amber-400 -rotate-12' : 'scale-50 text-slate-200'
            }`}
          >
            ⭐
          </span>
        </div>

        {/* Action button triggers */}
        <div className="w-full space-y-3">
          <button
            onClick={() => { sfx.playClick(); onNext(); }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-600 text-white font-extrabold text-lg shadow-lg shadow-emerald-100 hover:shadow-xl hover:shadow-emerald-200 hover:scale-101 transition-all active:scale-98 cursor-pointer border-2 border-white/50"
          >
            {t.nextLevel}
          </button>

          {onCaptureScreenshot && (
            <button
              onClick={() => { sfx.playClick(); onCaptureScreenshot(); }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg hover:scale-101 transition-all active:scale-98 cursor-pointer border-2 border-white/50 flex items-center justify-center gap-1.5"
            >
              📸 {language === 'ar' ? 'التقاط صورة لإنجازك!' : language === 'fr' ? 'Prendre une photo !' : language === 'de' ? 'Foto machen!' : 'Take a Snapshot!'}
            </button>
          )}
          
          <button
            onClick={() => { sfx.playClick(); onRetry(); }}
            className="w-full py-3 rounded-2xl bg-white/95 hover:bg-white text-slate-700 font-extrabold text-sm border-2 border-slate-100 shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            {t.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
};
