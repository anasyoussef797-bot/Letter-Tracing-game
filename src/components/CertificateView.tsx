/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Language, Avatar } from '../types';
import { sfx } from '../utils/audio';

interface CertificateViewProps {
  language: Language;
  stars: number;
  score: number;
  completedCount: number;
  totalCount: number;
  avatar: Avatar;
  onRestart: () => void;
  onBackToMap: () => void;
  onShowScreenshot: (src: string) => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  language,
  stars,
  score,
  completedCount,
  totalCount,
  avatar,
  onRestart,
  onBackToMap,
  onShowScreenshot,
}) => {
  const [childName, setChildName] = useState('');
  const [capturing, setCapturing] = useState(false);

  const isRtl = language === 'ar';

  const t = {
    title: isRtl ? 'شهادة التفوق والنجاح 🏆' : 'Certificate of Achievement 🏆',
    sub: isRtl ? 'مقدمة بكل حب من حاضنة إمباكت هب مصر لتعليم الأطفال' : 'Presented with love from Impact Hub Egypt for early childhood learning',
    awardText: isRtl ? 'تُمنح هذه الشهادة بفخر للبطل الصغير الرائع' : 'This certificate is proudly awarded to the amazing little hero',
    defaultName: isRtl ? 'بطل المغامرة' : 'Adventure Hero',
    details: isRtl 
      ? `لإتمامه بنجاح مغامرة رسم الحروف وتحدي الكتابة التفاعلية` 
      : `for successfully completing the 3D letter tracing adventure and interactive writing challenge`,
    statsTitle: isRtl ? 'تقرير الإنجاز الدراسي (الواجب المنزلي)' : 'Homework Achievement Report',
    score: isRtl ? 'النقاط الإجمالية' : 'Total Score',
    stars: isRtl ? 'النجوم المجمعة' : 'Stars Collected',
    progress: isRtl ? 'الحروف المكتملة' : 'Letters Completed',
    placeholderName: isRtl ? 'اكتب اسم الطفل هنا للشهادة...' : 'Enter child\'s name here...',
    captureBtn: isRtl ? '📸 التقاط صورة للشهادة لتسليم الواجب!' : '📸 Take Screenshot to Submit Homework!',
    playAgain: isRtl ? '🎮 العب مرة أخرى' : '🎮 Play Again',
    mapBtn: isRtl ? '🗺️ العودة لخريطة المغامرة' : '🗺️ Back to Adventure Map',
    branding: 'Impact Hub Egypt 🌟',
    badgeText: isRtl ? 'رسم الحروف' : 'Super Tracer',
  };

  const handleCapture = () => {
    sfx.playClick();
    setCapturing(true);

    setTimeout(() => {
      // Build certificate on HTML Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCapturing(false);
        return;
      }

      // Certificate layout dimensions
      canvas.width = 800;
      canvas.height = 600;

      // 1. Solid warm cream paper background
      ctx.fillStyle = '#fdfbf7';
      ctx.fillRect(0, 0, 800, 600);

      // 2. Draw fancy double borders (outer thin, inner thick gold)
      // Outer border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 786, 586);

      // Inner elegant golden border
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 6;
      ctx.strokeRect(22, 22, 756, 556);

      // 3. Golden corner flourishes
      ctx.fillStyle = '#eab308';
      const corners = [
        { x: 22, y: 22 },
        { x: 778, y: 22 },
        { x: 22, y: 578 },
        { x: 778, y: 578 },
      ];
      corners.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Header branding
      ctx.fillStyle = '#065f46'; // Emerald 800
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.branding, 400, 75);

      // 5. Main Certificate Title
      ctx.fillStyle = '#b45309'; // Amber 700
      ctx.font = '900 38px sans-serif';
      ctx.fillText(t.title.replace('🏆', ''), 400, 130);

      // Subtitle
      ctx.fillStyle = '#475569';
      ctx.font = '500 15px sans-serif';
      ctx.fillText(t.sub, 400, 165);

      // Divider line
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(250, 185);
      ctx.lineTo(550, 185);
      ctx.stroke();

      // 6. Award Text
      ctx.fillStyle = '#1e293b';
      ctx.font = '600 18px sans-serif';
      ctx.fillText(t.awardText, 400, 225);

      // 7. Child's Name (Enlarged in beautiful green color)
      const displayName = childName.trim() || t.defaultName;
      ctx.fillStyle = '#047857'; // Emerald 700
      ctx.font = '900 44px sans-serif';
      ctx.fillText(displayName, 400, 285);

      // Underline for the name
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(200, 305);
      ctx.lineTo(600, 305);
      ctx.stroke();

      // 8. Description text
      ctx.fillStyle = '#334155';
      ctx.font = '500 16px sans-serif';
      // simple word wrap or direct line
      ctx.fillText(t.details, 400, 345);

      // 9. Stats / Homework Report Box at the bottom center
      const boxY = 385;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(150, boxY, 500, 110);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(150, boxY, 500, 110);

      // Homework report header
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 14px sans-serif';
      ctx.fillText(t.statsTitle, 400, boxY + 25);

      // Stats Columns
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#475569';
      
      // Stars column
      ctx.fillText(`${t.stars}: ⭐ ${stars}`, 250, boxY + 65);
      
      // Score column
      ctx.fillText(`${t.score}: 💎 ${score}`, 400, boxY + 65);

      // Progress column
      ctx.fillText(`${t.progress}: ${completedCount} / ${totalCount}`, 550, boxY + 65);

      // 10. Large golden badge stamp in lower left corner with avatar
      ctx.save();
      const bX = 110;
      const bY = 510;
      
      // Starry ribbon backing
      ctx.beginPath();
      ctx.arc(bX, bY, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; // Amber 500
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Center gold inner circle
      ctx.beginPath();
      ctx.arc(bX, bY, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#eab308'; // Yellow 500
      ctx.fill();

      // Draw avatar emoji inside the stamp
      ctx.font = '36px serif';
      ctx.fillText(avatar.emoji, bX, bY + 10);

      ctx.restore();

      // Stamp text label
      ctx.fillStyle = '#b45309';
      ctx.font = '900 11px sans-serif';
      ctx.fillText(t.badgeText, 110, 568);

      // 11. Signature in the lower right corner
      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic 16px cursive, sans-serif';
      ctx.fillText('Impact Hub Egypt', 680, 520);
      
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(600, 532);
      ctx.lineTo(740, 532);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('OFFICIAL PARTNER 🌟', 670, 550);

      // Convert and send to ScreenshotModal
      const imageSrc = canvas.toDataURL('image/png');
      onShowScreenshot(imageSrc);
      setCapturing(false);
    }, 400);
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="w-full max-w-2xl mx-auto flex flex-col p-4 sm:p-6 bg-white/85 backdrop-blur-md border-2 border-white shadow-xl rounded-3xl animate-fade-in relative z-10 text-center select-none max-h-[85vh] overflow-y-auto"
    >
      {/* Decorative Ribbon Header */}
      <div className="flex flex-col items-center mb-4">
        <span className="text-5xl sm:text-6xl animate-bounce mb-2">🎓</span>
        <h2 className="text-xl sm:text-2xl font-black text-amber-700 font-display">
          {t.title}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          {t.sub}
        </p>
      </div>

      {/* Name Input Bar for Homework customisation */}
      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 shadow-sm mb-4">
        <label className="block text-xs sm:text-sm font-black text-emerald-800 mb-2">
          {isRtl ? '✍️ اكتب اسم البطل هنا لتسجيله بالشهادة:' : '✍️ Type child\'s name to write on certificate:'}
        </label>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder={t.placeholderName}
          maxLength={30}
          className="w-full px-4 py-2 sm:py-2.5 rounded-xl border-2 border-emerald-200 bg-white text-slate-800 placeholder-slate-400 text-sm font-bold text-center outline-none focus:border-emerald-500 transition-all shadow-inner"
        />
      </div>

      {/* Visual representation of the Certificate */}
      <div className="border-4 border-double border-amber-400 bg-amber-50/30 p-4 sm:p-6 rounded-2xl relative mb-6 overflow-hidden flex flex-col items-center">
        {/* Decorative elements */}
        <div className="absolute top-2 left-2 text-lg text-amber-500">✨</div>
        <div className="absolute top-2 right-2 text-lg text-amber-500">✨</div>
        <div className="absolute bottom-2 left-2 text-lg text-amber-500">✨</div>
        <div className="absolute bottom-2 right-2 text-lg text-amber-500">✨</div>

        <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1">{t.branding}</p>
        <h4 className="text-lg sm:text-xl font-black text-amber-800 font-display mb-3">{isRtl ? 'شهادة إنجاز' : 'Certificate of Excellence'}</h4>
        
        <p className="text-xs text-slate-500 mb-2">{t.awardText}</p>
        
        {/* Child's Name display */}
        <div className="text-lg sm:text-2xl font-black text-emerald-700 font-display px-6 py-1 border-b-2 border-emerald-500/30 mb-2 min-h-[36px] max-w-xs truncate">
          {childName.trim() || t.defaultName}
        </div>

        <p className="text-xs text-slate-600 max-w-md mb-4 leading-relaxed">
          {t.details}
        </p>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-2 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-amber-100 w-full max-w-md text-slate-700">
          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-slate-500 font-black">{t.score}</span>
            <span className="text-sm sm:text-base font-black text-amber-600">💎 {score}</span>
          </div>
          <div className="flex flex-col items-center border-x border-amber-100">
            <span className="text-[10px] sm:text-xs text-slate-500 font-black">{t.stars}</span>
            <span className="text-sm sm:text-base font-black text-yellow-500">⭐ {stars}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs text-slate-500 font-black">{t.progress}</span>
            <span className="text-sm sm:text-base font-black text-emerald-600">✅ {completedCount}/{totalCount}</span>
          </div>
        </div>

        {/* Mascot Medallion floating overlay */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-3xl p-1.5 bg-white rounded-full border border-amber-300 shadow-sm animate-pulse">{avatar.emoji}</span>
          <span className="text-xs font-black text-amber-800 uppercase tracking-wider">{avatar.name[language] || avatar.name['en']}</span>
        </div>
      </div>

      {/* Button Layout */}
      <div className="flex flex-col gap-3">
        {/* Screenshot / Print Homework Button */}
        <button
          onClick={handleCapture}
          disabled={capturing}
          className={`w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-100 border-2 border-white/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer bubble-btn ${
            capturing ? 'opacity-70 cursor-wait' : 'hover:scale-101 hover:shadow-xl'
          }`}
        >
          {capturing ? (
            <span>⌛ {isRtl ? 'جاري التحضير...' : 'Preparing...'}</span>
          ) : (
            <span>{t.captureBtn}</span>
          )}
        </button>

        <div className="grid grid-cols-2 gap-3 mt-1">
          {/* Back to map */}
          <button
            onClick={() => { sfx.playClick(); onBackToMap(); }}
            className="py-2.5 px-3 rounded-xl bg-white text-slate-700 border border-slate-200 font-extrabold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer hover:bg-slate-50"
          >
            {t.mapBtn}
          </button>

          {/* Restart game */}
          <button
            onClick={() => { sfx.playClick(); onRestart(); }}
            className="py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer hover:bg-emerald-100/50"
          >
            {t.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
};
