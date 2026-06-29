/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, LetterData } from '../types';
import { localization } from '../utils/localization';
import { sfx } from '../utils/audio';

interface ScreenshotModalProps {
  language: Language;
  letter?: LetterData;
  imageSrc: string;
  onClose: () => void;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({
  language,
  letter,
  imageSrc,
  onClose,
}) => {
  const t = localization[language];

  const handleClose = () => {
    sfx.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white/95 backdrop-blur-md border-2 border-white rounded-3xl p-6 max-w-md w-full flex flex-col items-center shadow-xl relative animate-bounce-in">
        
        <h3 className="text-xl font-black text-emerald-800 mb-1 font-display">
          {t.captured} 🎨
        </h3>
        <p className="text-xs text-slate-600 mb-5 text-center">
          {language === 'ar' 
            ? 'اضغط مطولاً على الصورة لحفظ خطك الجميل!' 
            : language === 'fr' 
            ? 'Appuyez longuement ou faites un clic droit pour enregistrer votre chef-d\'œuvre !' 
            : language === 'de' 
            ? 'Drücke lange oder klicke rechts, um dein Meisterwerk zu speichern!' 
            : 'Press and hold or right-click to save your drawing to your device!'}
        </p>

        {/* Polaroid Image Display Container */}
        <div className="bg-white/50 border-2 border-white/80 p-3 rounded-2xl shadow-inner mb-6 w-full flex justify-center">
          <img
            src={imageSrc}
            alt="My Tracing Masterpiece"
            className="rounded-xl border border-white shadow-md max-h-[360px] object-contain w-full select-all"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-sm rounded-2xl transition-all active:scale-98 cursor-pointer"
        >
          {t.close} ❌
        </button>
      </div>
    </div>
  );
};
