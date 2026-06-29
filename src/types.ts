/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'ar' | 'en' | 'fr' | 'de';

export interface Point {
  x: number;
  y: number;
}

export interface ExampleWord {
  word: string;
  translation: string; // English translation or simple meaning
  emoji: string;       // Visual representation of the word (e.g., Apple, Rabbit)
}

export interface LetterData {
  char: string;
  name: string;
  strokes: Point[][]; // Array of strokes, each stroke is an array of points (0 to 100 coordinates)
  example: ExampleWord;
}

export type GameScreen = 'start' | 'avatar' | 'map' | 'play' | 'sandbox' | 'certificate';

export interface Avatar {
  id: string;
  emoji: string;
  name: {
    ar: string;
    en: string;
    fr: string;
    de: string;
  };
  color: string;
}

export interface GameState {
  language: Language;
  screen: GameScreen;
  selectedAvatar: string | null;
  score: number;
  stars: number;
  completedLetters: string[]; // Completed chars
  currentLetterIdx: number;
  soundEnabled: boolean;
  voiceEnabled: boolean;
}
