/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, Avatar } from '../types';
import { localization } from '../utils/localization';
import { sfx } from '../utils/audio';

// Avatars definitions
export const avatarsList: Avatar[] = [
  {
    id: 'lion',
    emoji: '🦁',
    name: {
      ar: 'شبل شجاع',
      en: 'Brave Cub',
      fr: 'Lionceau Brave',
      de: 'Mutiger Löwe'
    },
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'penguin',
    emoji: '🐧',
    name: {
      ar: 'بطريق لطيف',
      en: 'Sweet Penguin',
      fr: 'Manchot Doux',
      de: 'Süßer Pinguin'
    },
    color: 'from-sky-400 to-blue-500'
  },
  {
    id: 'bunny',
    emoji: '🐰',
    name: {
      ar: 'أرنب ذكي',
      en: 'Clever Bunny',
      fr: 'Lapin Malin',
      de: 'Schlaues Häschen'
    },
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'turtle',
    emoji: '🐢',
    name: {
      ar: 'سلحفاة هادئة',
      en: 'Calm Turtle',
      fr: 'Tortue Calme',
      de: 'Ruhige Schildkröte'
    },
    color: 'from-emerald-400 to-teal-500'
  }
];

interface AvatarSelectorProps {
  language: Language;
  selectedAvatar: string | null;
  onSelectAvatar: (avatarId: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  language,
  selectedAvatar,
  onSelectAvatar,
  onConfirm,
  onBack,
}) => {
  const t = localization[language];

  const handleSelect = (id: string) => {
    sfx.playClick();
    onSelectAvatar(id);
  };

  const handleConfirm = () => {
    sfx.playClick();
    onConfirm();
  };

  const handleBack = () => {
    sfx.playClick();
    onBack();
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center p-5 sm:p-8 bg-white/75 backdrop-blur-md border-2 border-white shadow-xl rounded-3xl animate-fade-in relative z-10">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 sm:top-6 left-4 sm:left-6 p-2 rounded-full bg-white/80 hover:bg-white text-emerald-800 border-2 border-white shadow-md cursor-pointer transition active:scale-90"
      >
        ⬅️
      </button>

      <h2 className="text-xl sm:text-3xl font-black text-emerald-800 font-display mb-1 mt-6 sm:mt-4">
        {t.selectAvatar}
      </h2>
      <p className="text-[10px] sm:text-xs text-slate-500 mb-4 sm:mb-8 max-w-md">
        {t.selectAvatarSub}
      </p>

      {/* Grid of Avatars */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mb-4 sm:mb-8">
        {avatarsList.map((av) => {
          const isSelected = selectedAvatar === av.id;
          return (
            <button
              key={av.id}
              onClick={() => handleSelect(av.id)}
              className={`p-3 sm:p-5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 cursor-pointer ${
                isSelected
                  ? `bg-emerald-50 border-emerald-500 scale-103 shadow-lg shadow-emerald-100/50`
                  : 'bg-white border-slate-100 hover:border-emerald-200/50 hover:scale-101'
              } bubble-btn`}
            >
              {/* Large Emoji Floating inside colored circle */}
              <div className={`w-12 h-12 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr ${av.color} flex items-center justify-center shadow-md mb-2 sm:mb-3`}>
                <span className="text-3xl sm:text-4xl animate-pulse">{av.emoji}</span>
              </div>

              <span className="text-xs sm:text-sm font-black text-slate-800 font-display">
                {av.name[language] || av.name['en']}
              </span>
            </button>
          );
        })}
      </div>

      {/* Confirmation Button */}
      <button
        onClick={handleConfirm}
        disabled={!selectedAvatar}
        className={`w-full py-3.5 sm:py-4 rounded-2xl text-white font-extrabold text-sm sm:text-lg shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
          selectedAvatar
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-100 hover:shadow-lg border-2 border-white/50'
            : 'bg-slate-300 opacity-50 cursor-not-allowed'
        }`}
      >
        <span>{t.confirmAvatar}</span>
      </button>
    </div>
  );
};
