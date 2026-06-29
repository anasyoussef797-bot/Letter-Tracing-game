/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export interface LocalizationStrings {
  title: string;
  subtitle: string;
  playButton: string;
  selectLanguage: string;
  selectAvatar: string;
  selectAvatarSub: string;
  confirmAvatar: string;
  back: string;
  mapTitle: string;
  mapSub: string;
  level: string;
  locked: string;
  score: string;
  stars: string;
  progress: string;
  congrats: string;
  wellDone: string;
  nextLevel: string;
  playAgain: string;
  pronounce: string;
  exampleWord: string;
  screenshotSuccess: string;
  downloadStandalone: string;
  sound: string;
  voice: string;
  home: string;
  restart: string;
  captured: string;
  close: string;
}

export const localization: Record<Language, LocalizationStrings> = {
  ar: {
    title: 'مغامرة رسم الحروف ثلاثية الأبعاد',
    subtitle: 'تعلم كتابة الحروف العربية والإنجليزية والمزيد بمرح وبطريقة تفاعلية رائعة!',
    playButton: 'ابدأ المغامرة 🎮',
    selectLanguage: 'اختر لغتك المفضلة',
    selectAvatar: 'اختر رفيق المغامرة 🐾',
    selectAvatarSub: 'سوف يرافقك رفيقك اللطيف في رحلتك لتعلم الحروف!',
    confirmAvatar: 'اختر هذا الرفيق ✅',
    back: 'رجوع',
    mapTitle: 'خريطة مغامرة الحروف',
    mapSub: 'اختر جزيرة الحروف العائمة لتبدأ الرسم!',
    level: 'مستوى',
    locked: 'مغلق 🔒',
    score: 'النقاط',
    stars: 'النجوم',
    progress: 'التقدم',
    congrats: 'مبارك! إنجاز رائع 🎉',
    wellDone: 'رسمت الحرف بخط جميل ومتقن!',
    nextLevel: 'الحرف التالي ➡️',
    playAgain: 'أعد الرسم 🔄',
    pronounce: 'نطق الحرف 🔊',
    exampleWord: 'مثال على الحرف',
    screenshotSuccess: 'تم التقاط صورة فنية لخطك الجميل! 📸',
    downloadStandalone: 'تحميل نسخة الويب المستقلة 💾',
    sound: 'المؤثرات الصوتية',
    voice: 'النطق الصوتي',
    home: 'الرئيسية',
    restart: 'إعادة',
    captured: 'صورتك التذكارية',
    close: 'إغلاق',
  },
  en: {
    title: '3D Letter Tracing Adventure',
    subtitle: 'Learn to write letters in multiple languages with beautiful interactive sparkles and stars!',
    playButton: 'Start Adventure 🎮',
    selectLanguage: 'Choose Your Language',
    selectAvatar: 'Pick Your Companion 🐾',
    selectAvatarSub: 'Your cute animal friend will celebrate and guide you along the way!',
    confirmAvatar: 'Select Companion ✅',
    back: 'Back',
    mapTitle: 'Adventure Map',
    mapSub: 'Select a floating letter island to start tracing!',
    level: 'Level',
    locked: 'Locked 🔒',
    score: 'Score',
    stars: 'Stars',
    progress: 'Progress',
    congrats: 'Congratulations! 🎉',
    wellDone: 'You traced the letter beautifully!',
    nextLevel: 'Next Letter ➡️',
    playAgain: 'Trace Again 🔄',
    pronounce: 'Pronounce 🔊',
    exampleWord: 'Example Word',
    screenshotSuccess: 'Captured a snapshot of your beautiful work! 📸',
    downloadStandalone: 'Download Standalone Game 💾',
    sound: 'SFX Sound',
    voice: 'Speech Pronounce',
    home: 'Home',
    restart: 'Restart',
    captured: 'Your Masterpiece',
    close: 'Close',
  },
  fr: {
    title: 'Aventure de Tracé de Lettres 3D',
    subtitle: 'Apprends à écrire les lettres avec de magnifiques étincelles et étoiles interactives !',
    playButton: 'Commencer l\'aventure 🎮',
    selectLanguage: 'Choisis ta langue',
    selectAvatar: 'Choisis ton compagnon 🐾',
    selectAvatarSub: 'Ton adorable ami animal t\'accompagnera et fêtera tes victoires !',
    confirmAvatar: 'Sélectionner ✅',
    back: 'Retour',
    mapTitle: 'Carte d\'aventure',
    mapSub: 'Choisis une île volante pour commencer à tracer !',
    level: 'Niveau',
    locked: 'Verrouillé 🔒',
    score: 'Score',
    stars: 'Étoiles',
    progress: 'Progrès',
    congrats: 'Félicitations ! 🎉',
    wellDone: 'Tu as tracé la lettre magnifiquement !',
    nextLevel: 'Lettre suivante ➡️',
    playAgain: 'Tracer à nouveau 🔄',
    pronounce: 'Prononcer 🔊',
    exampleWord: 'Mot d\'exemple',
    screenshotSuccess: 'Une capture d\'écran de ton magnifique travail a été prise ! 📸',
    downloadStandalone: 'Télécharger le jeu autonome 💾',
    sound: 'Sons SFX',
    voice: 'Prononciation vocale',
    home: 'Accueil',
    restart: 'Recommencer',
    captured: 'Ton chef-d\'œuvre',
    close: 'Fermer',
  },
  de: {
    title: '3D Buchstaben Schreib-Abenteuer',
    subtitle: 'Lerne das Schreiben von Buchstaben mit wunderschönen funkelnden Sternen und Glitzer!',
    playButton: 'Abenteuer Starten 🎮',
    selectLanguage: 'Wähle deine Sprache',
    selectAvatar: 'Wähle deinen Begleiter 🐾',
    selectAvatarSub: 'Dein niedlicher Tierfreund wird dich auf dem Weg begleiten und anfeuern!',
    confirmAvatar: 'Begleiter Wählen ✅',
    back: 'Zurück',
    mapTitle: 'Abenteuerkarte',
    mapSub: 'Wähle eine schwebende Buchstabeninsel, um mit dem Schreiben zu beginnen!',
    level: 'Stufe',
    locked: 'Gesperrt 🔒',
    score: 'Punkte',
    stars: 'Sterne',
    progress: 'Fortschritt',
    congrats: 'Herzlichen Glückwunsch! 🎉',
    wellDone: 'Du hast den Buchstaben wunderschön geschrieben!',
    nextLevel: 'Nächster Buchstabe ➡️',
    playAgain: 'Nochmal schreiben 🔄',
    pronounce: 'Aussprache 🔊',
    exampleWord: 'Beispielwort',
    screenshotSuccess: 'Dein tolles Kunstwerk wurde fotografiert! 📸',
    downloadStandalone: 'Eigenständiges Spiel herunterladen 💾',
    sound: 'SFX-Sound',
    voice: 'Aussprache-Stimme',
    home: 'Menü',
    restart: 'Neustart',
    captured: 'Dein Meisterwerk',
    close: 'Schließen',
  },
};
