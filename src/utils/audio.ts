/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple, reliable Web Audio API Synthesizer for lag-free premium game sound effects
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled = true;
  private bgmInterval: any = null;
  private bgmIndex = 0;
  // A beautiful, sweet lullaby pentatonic loop (C5, D5, E5, G5, A5, C6...)
  private bgmNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99];

  constructor() {
    if (typeof window !== 'undefined') {
      const resumeContext = () => {
        this.init();
        if (this.ctx && this.ctx.state === 'running') {
          window.removeEventListener('click', resumeContext);
          window.removeEventListener('touchstart', resumeContext);
        }
      };
      window.addEventListener('click', resumeContext);
      window.addEventListener('touchstart', resumeContext);
    }
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startBgm() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.bgmInterval) return; // Prevent double intervals

    this.bgmInterval = setInterval(() => {
      if (!this.enabled || !this.ctx) return;
      if (this.ctx.state === 'suspended') return;

      const freq = this.bgmNotes[this.bgmIndex % this.bgmNotes.length];
      this.bgmIndex++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Extremely soft music-box sound envelope
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.012, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.5);
    }, 1600);
  }

  public stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playDraw(progress: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Soft twinkling wave
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    // Frequency increases with drawing progress (400Hz to 900Hz)
    const freq = 400 + (progress * 500);
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  public playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Beautiful pentatonic upward fan (C4, E4, G4, C5, E5)
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      
      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.6);
    });

    // Also trigger a metallic chime bell sound
    setTimeout(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime); // E6
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.9);
    }, 450);
  }

  public playWarn() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Gentle warning bubble sound (warm low frequency pop, non-punishing)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  public playStar(starIdx: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Rapid ascending twinkling sound for stars
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    const startFreq = 600 + starIdx * 200;
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.26);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
}

export const sfx = new SoundSynthesizer();

// Multilingual Speech Synthesis utilizing Web Speech API
const encouragements = {
  ar: [
    'ممتاز!',
    'رائع جداً!',
    'أنت مبدع!',
    'مذهل!',
    'خط جميل جداً!',
    'بطل الحروف!'
  ],
  en: [
    'Awesome!',
    'Spectacular!',
    'You are a superstar!',
    'Incredible job!',
    'Beautiful tracing!',
    'Perfect!'
  ],
  fr: [
    'Fantastique !',
    'Magnifique !',
    'Tu es un champion !',
    'Excellent travail !',
    'C\'est parfait !',
    'Superbe !'
  ],
  de: [
    'Fantastisch!',
    'Sehr gut gemacht!',
    'Du bist ein Star!',
    'Ganz toll gemacht!',
    'Wunderschön!',
    'Perfekt!'
  ]
};

const retryPhrases = {
  ar: [
    'حاول مرة أخرى، أنت تستطيع!',
    'خطوة بخطوة، هيا نجرب ثانية!',
    'شارفت على الانتهاء، واصل!'
  ],
  en: [
    'Try again, you can do it!',
    'Step by step, let\'s try again!',
    'Almost there, keep going!'
  ],
  fr: [
    'Essaye encore, tu peux le faire !',
    'Étape par étape, recommençons !',
    'Presque fini, continue !'
  ],
  de: [
    'Versuch\'s noch einmal, du schaffst das!',
    'Schritt für Schritt, nochmal!',
    'Fast geschafft, weiter so!'
  ]
};

const mapLangToVoiceCode = (lang: string): string => {
  switch (lang) {
    case 'ar': return 'ar-SA';
    case 'fr': return 'fr-FR';
    case 'de': return 'de-DE';
    case 'en':
    default:
      return 'en-US';
  }
};

class SpeechManager {
  public enabled = true;
  private activeAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          window.speechSynthesis.getVoices();
        });
      } else {
        // Fallback for older browsers
        (window.speechSynthesis as any).onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }

  private speak(text: string, lang: string) {
    if (!this.enabled) return;

    // Stop any currently playing audio speech to prevent overlaps
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch (err) {
        console.warn('Error pausing previous audio speech:', err);
      }
      this.activeAudio = null;
    }

    // Cancel any active speechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        // Ignore
      }
    }

    try {
      const voiceCode = mapLangToVoiceCode(lang);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${voiceCode}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      const audio = document.createElement('audio');
      // Set referrerpolicy to 'no-referrer' to bypass Google Translate TTS 403 blocks in iframes
      (audio as any).referrerPolicy = 'no-referrer';
      audio.setAttribute('referrerpolicy', 'no-referrer');
      audio.src = url;
      this.activeAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`Google TTS play failed for ${lang}, falling back to native SpeechSynthesis:`, err);
          this.speakNative(text, lang);
        });
      }
    } catch (e) {
      console.warn('Google TTS initialization failed, falling back to native SpeechSynthesis:', e);
      this.speakNative(text, lang);
    }
  }

  private speakNative(text: string, lang: string) {
    if (!('speechSynthesis' in window)) return;

    try {
      // Cancel any ongoing speech first to avoid overlapping
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voiceCode = mapLangToVoiceCode(lang);

      // Find best native voice matching the language code
      const voices = window.speechSynthesis.getVoices();
      let bestVoice = voices.find(v => {
        const vLang = v.lang.toLowerCase();
        const code = voiceCode.toLowerCase();
        return vLang.startsWith(code) || vLang.includes(code.replace('-', '_')) || vLang.replace('_', '-').startsWith(code);
      });

      // Special fallback for Arabic voices
      if (!bestVoice && lang === 'ar') {
        bestVoice = voices.find(v => v.lang.toLowerCase().startsWith('ar'));
      }

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang; // Match the physical voice's exact lang code!
      } else {
        utterance.lang = voiceCode;
      }
      
      utterance.rate = lang === 'ar' ? 0.75 : 0.85; // Slightly slower and friendlier for preschoolers
      utterance.pitch = 1.15; // Slightly higher pitch for playful children tone
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  // Pre-fetch voices so they are ready on iOS/Chrome
  public loadVoices() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }

  public speakLetter(char: string, name: string, lang: string, word?: string) {
    // Say the letter name and optionally the example word with child-friendly phrasing
    let text = lang === 'ar' ? `حرف ال${name}` : `${char}`;
    if (word) {
      if (lang === 'ar') {
        text = `حرف ${name}، مثل ${word}`;
      } else if (lang === 'fr') {
        text = `La lettre ${char}, comme ${word}`;
      } else if (lang === 'de') {
        text = `Buchstabe ${char}, wie ${word}`;
      } else {
        text = `Letter ${char}, as in ${word}`;
      }
    }
    this.speak(text, lang);
  }

  public speakWord(word: string, lang: string) {
    this.speak(word, lang);
  }

  public speakEncouragement(lang: 'ar' | 'en' | 'fr' | 'de') {
    const list = encouragements[lang];
    const phrase = list[Math.floor(Math.random() * list.length)];
    this.speak(phrase, lang);
  }

  public speakRetry(lang: 'ar' | 'en' | 'fr' | 'de') {
    const list = retryPhrases[lang];
    const phrase = list[Math.floor(Math.random() * list.length)];
    this.speak(phrase, lang);
  }
}

export const voice = new SpeechManager();
