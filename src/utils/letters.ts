/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LetterData, Point } from '../types';

/**
 * Interpolates intermediate points between defined nodes of a stroke to create a dense, smooth path.
 * Uses linear interpolation for straight lines (2 points) and Catmull-Rom spline interpolation for curves (3+ points)
 * to ensure a beautifully rounded, handwriting-like stroke representation.
 */
export function interpolateStroke(stroke: Point[], stepSize = 3): Point[] {
  if (stroke.length === 0) return [];
  if (stroke.length === 1) return stroke;

  // For straight lines (2 points), use simple linear interpolation
  if (stroke.length === 2) {
    const densePath: Point[] = [stroke[0]];
    const start = stroke[0];
    const end = stroke[1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const steps = Math.max(1, Math.floor(distance / stepSize));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        densePath.push({
          x: start.x + dx * t,
          y: start.y + dy * t,
        });
      }
    }
    return densePath;
  }

  // For curves (3 or more points), use beautiful Catmull-Rom spline interpolation
  const densePath: Point[] = [];
  const padded = [
    stroke[0], // P0 acts as virtual control point for start boundary
    ...stroke,
    stroke[stroke.length - 1] // PN acts as virtual control point for end boundary
  ];

  for (let i = 0; i < stroke.length - 1; i++) {
    const p0 = padded[i];
    const p1 = padded[i + 1];
    const p2 = padded[i + 2];
    const p3 = padded[i + 3];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) continue;

    const steps = Math.max(3, Math.floor(distance / stepSize));

    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      densePath.push(getCatmullRomPoint(p0, p1, p2, p3, t));
    }
  }

  densePath.push(stroke[stroke.length - 1]);
  return densePath;
}

function getCatmullRomPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;

  const f1 = -0.5 * t3 + t2 - 0.5 * t;
  const f2 = 1.5 * t3 - 2.5 * t2 + 1.0;
  const f3 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
  const f4 = 0.5 * t3 - 0.5 * t2;

  return {
    x: p0.x * f1 + p1.x * f2 + p2.x * f3 + p3.x * f4,
    y: p0.y * f1 + p1.y * f2 + p2.y * f3 + p3.y * f4,
  };
}

function smoothPath(points: Point[], passes = 2): Point[] {
  if (points.length < 3) return points;
  let current = [...points];
  for (let pass = 0; pass < passes; pass++) {
    const next: Point[] = [current[0]];
    for (let i = 1; i < current.length - 1; i++) {
      next.push({
        x: current[i - 1].x * 0.25 + current[i].x * 0.5 + current[i + 1].x * 0.25,
        y: current[i - 1].y * 0.25 + current[i].y * 0.5 + current[i + 1].y * 0.25,
      });
    }
    next.push(current[current.length - 1]);
    current = next;
  }
  return current;
}

// Letter definitions for English
export const englishLetters: LetterData[] = [
  {
    char: 'A',
    name: 'A',
    strokes: [
      [{ x: 50, y: 15 }, { x: 20, y: 85 }], // Left leg down
      [{ x: 50, y: 15 }, { x: 80, y: 85 }], // Right leg down
      [{ x: 32, y: 55 }, { x: 68, y: 55 }]  // Cross bar
    ],
    example: { word: 'Apple', translation: 'Ap-ple', emoji: '🍎' }
  },
  {
    char: 'B',
    name: 'B',
    strokes: [
      [{ x: 30, y: 15 }, { x: 30, y: 85 }], // Vertical spine
      [{ x: 30, y: 15 }, { x: 65, y: 15 }, { x: 65, y: 48 }, { x: 30, y: 48 }], // Top loop
      [{ x: 30, y: 48 }, { x: 72, y: 48 }, { x: 72, y: 85 }, { x: 30, y: 85 }]  // Bottom loop
    ],
    example: { word: 'Butterfly', translation: 'But-ter-fly', emoji: '🦋' }
  },
  {
    char: 'C',
    name: 'C',
    strokes: [
      [{ x: 75, y: 25 }, { x: 50, y: 15 }, { x: 25, y: 50 }, { x: 50, y: 85 }, { x: 75, y: 75 }] // Curve
    ],
    example: { word: 'Cat', translation: 'Cat', emoji: '🐱' }
  },
  {
    char: 'D',
    name: 'D',
    strokes: [
      [{ x: 30, y: 15 }, { x: 30, y: 85 }], // Spine
      [{ x: 30, y: 15 }, { x: 75, y: 15 }, { x: 75, y: 50 }, { x: 75, y: 85 }, { x: 30, y: 85 }] // Arch
    ],
    example: { word: 'Dinosaur', translation: 'Di-no-saur', emoji: '🦖' }
  },
  {
    char: 'E',
    name: 'E',
    strokes: [
      [{ x: 30, y: 15 }, { x: 30, y: 85 }], // Spine
      [{ x: 30, y: 15 }, { x: 70, y: 15 }], // Top horizontal
      [{ x: 30, y: 50 }, { x: 60, y: 50 }], // Middle horizontal
      [{ x: 30, y: 85 }, { x: 70, y: 85 }]  // Bottom horizontal
    ],
    example: { word: 'Elephant', translation: 'El-e-phant', emoji: '🐘' }
  },
  {
    char: 'F',
    name: 'F',
    strokes: [
      [{ x: 30, y: 15 }, { x: 30, y: 85 }], // Spine
      [{ x: 30, y: 15 }, { x: 70, y: 15 }], // Top bar
      [{ x: 30, y: 50 }, { x: 60, y: 50 }]  // Middle bar
    ],
    example: { word: 'Flower', translation: 'Flow-er', emoji: '🌸' }
  },
  {
    char: 'G',
    name: 'G',
    strokes: [
      [{ x: 75, y: 25 }, { x: 50, y: 15 }, { x: 25, y: 50 }, { x: 50, y: 85 }, { x: 70, y: 85 }, { x: 70, y: 55 }, { x: 50, y: 55 }] // C-curve with horizontal hook
    ],
    example: { word: 'Giraffe', translation: 'Gi-raffe', emoji: '🦒' }
  },
  {
    char: 'H',
    name: 'H',
    strokes: [
      [{ x: 25, y: 15 }, { x: 25, y: 85 }], // Left spine
      [{ x: 75, y: 15 }, { x: 75, y: 85 }], // Right spine
      [{ x: 25, y: 50 }, { x: 75, y: 50 }]  // Middle cross
    ],
    example: { word: 'House', translation: 'House', emoji: '🏠' }
  },
  {
    char: 'I',
    name: 'I',
    strokes: [
      [{ x: 35, y: 15 }, { x: 65, y: 15 }], // Top bar
      [{ x: 50, y: 15 }, { x: 50, y: 85 }], // Center vertical
      [{ x: 35, y: 85 }, { x: 65, y: 85 }]  // Bottom bar
    ],
    example: { word: 'Ice Cream', translation: 'Ice Cream', emoji: '🍦' }
  },
  {
    char: 'J',
    name: 'J',
    strokes: [
      [{ x: 35, y: 15 }, { x: 65, y: 15 }], // Top bar
      [{ x: 50, y: 15 }, { x: 50, y: 70 }, { x: 45, y: 85 }, { x: 30, y: 80 }] // Hook down
    ],
    example: { word: 'Jellyfish', translation: 'Jel-ly-fish', emoji: '🪼' }
  },
  {
    char: 'K',
    name: 'K',
    strokes: [
      [{ x: 30, y: 15 }, { x: 30, y: 85 }], // Spine
      [{ x: 65, y: 15 }, { x: 30, y: 50 }, { x: 65, y: 85 }] // Branches
    ],
    example: { word: 'Koala', translation: 'Ko-a-la', emoji: '🐨' }
  },
  {
    char: 'L',
    name: 'L',
    strokes: [
      [{ x: 35, y: 15 }, { x: 35, y: 85 }, { x: 65, y: 85 }] // Spine and base
    ],
    example: { word: 'Lion', translation: 'Li-on', emoji: '🦁' }
  },
  {
    char: 'M',
    name: 'M',
    strokes: [
      [{ x: 25, y: 85 }, { x: 25, y: 15 }], // Left post
      [{ x: 25, y: 15 }, { x: 50, y: 55 }, { x: 75, y: 15 }], // V-center
      [{ x: 75, y: 15 }, { x: 75, y: 85 }] // Right post
    ],
    example: { word: 'Monkey', translation: 'Mon-key', emoji: '🐒' }
  },
  {
    char: 'N',
    name: 'N',
    strokes: [
      [{ x: 25, y: 85 }, { x: 25, y: 15 }], // Left post
      [{ x: 25, y: 15 }, { x: 75, y: 85 }], // Slant
      [{ x: 75, y: 85 }, { x: 75, y: 15 }] // Right post
    ],
    example: { word: 'Nest', translation: 'Nest', emoji: '🪹' }
  },
  {
    char: 'O',
    name: 'O',
    strokes: [
      [{ x: 50, y: 15 }, { x: 25, y: 35 }, { x: 25, y: 65 }, { x: 50, y: 85 }, { x: 75, y: 65 }, { x: 75, y: 35 }, { x: 50, y: 15 }] // Circle
    ],
    example: { word: 'Owl', translation: 'Owl', emoji: '🦉' }
  },
  {
    char: 'P',
    name: 'P',
    strokes: [
      [{ x: 30, y: 15 }, { x: 30, y: 85 }], // Spine
      [{ x: 30, y: 15 }, { x: 65, y: 15 }, { x: 65, y: 50 }, { x: 30, y: 50 }] // Half loop
    ],
    example: { word: 'Panda', translation: 'Pan-da', emoji: '🐼' }
  },
  {
    char: 'Q',
    name: 'Q',
    strokes: [
      [{ x: 50, y: 15 }, { x: 25, y: 35 }, { x: 25, y: 65 }, { x: 50, y: 85 }, { x: 75, y: 65 }, { x: 75, y: 35 }, { x: 50, y: 15 }], // Circle
      [{ x: 60, y: 65 }, { x: 78, y: 85 }] // Little tail
    ],
    example: { word: 'Queen', translation: 'Queen', emoji: '👑' }
  },
  {
    char: 'R',
    name: 'R',
    strokes: [
      [{ x: 30, y: 15 }, { x: 30, y: 85 }], // Spine
      [{ x: 30, y: 15 }, { x: 65, y: 15 }, { x: 65, y: 50 }, { x: 30, y: 50 }], // Loop
      [{ x: 30, y: 50 }, { x: 65, y: 85 }] // Leg
    ],
    example: { word: 'Rabbit', translation: 'Rab-bit', emoji: '🐇' }
  },
  {
    char: 'S',
    name: 'S',
    strokes: [
      [{ x: 70, y: 22 }, { x: 50, y: 15 }, { x: 30, y: 32 }, { x: 50, y: 50 }, { x: 70, y: 68 }, { x: 50, y: 85 }, { x: 30, y: 78 }] // S-curve
    ],
    example: { word: 'Sun', translation: 'Sun', emoji: '☀️' }
  },
  {
    char: 'T',
    name: 'T',
    strokes: [
      [{ x: 25, y: 15 }, { x: 75, y: 15 }], // Top hat
      [{ x: 50, y: 15 }, { x: 50, y: 85 }] // Stem
    ],
    example: { word: 'Tiger', translation: 'Ti-ger', emoji: '🐯' }
  },
  {
    char: 'U',
    name: 'U',
    strokes: [
      [{ x: 25, y: 15 }, { x: 25, y: 65 }, { x: 50, y: 85 }, { x: 75, y: 65 }, { x: 75, y: 15 }] // Cup
    ],
    example: { word: 'Umbrella', translation: 'Um-brel-la', emoji: '☂️' }
  },
  {
    char: 'V',
    name: 'V',
    strokes: [
      [{ x: 25, y: 15 }, { x: 50, y: 85 }, { x: 75, y: 15 }] // V-point
    ],
    example: { word: 'Violin', translation: 'Vi-o-lin', emoji: '🎻' }
  },
  {
    char: 'W',
    name: 'W',
    strokes: [
      [{ x: 20, y: 15 }, { x: 35, y: 85 }, { x: 50, y: 45 }, { x: 65, y: 85 }, { x: 80, y: 15 }] // W-wave
    ],
    example: { word: 'Watermelon', translation: 'Wa-ter-mel-on', emoji: '🍉' }
  },
  {
    char: 'X',
    name: 'X',
    strokes: [
      [{ x: 25, y: 15 }, { x: 75, y: 85 }], // Backslash
      [{ x: 75, y: 15 }, { x: 25, y: 85 }] // Slash
    ],
    example: { word: 'Xylophone', translation: 'Xy-lo-phone', emoji: '🪘' }
  },
  {
    char: 'Y',
    name: 'Y',
    strokes: [
      [{ x: 25, y: 15 }, { x: 50, y: 50 }, { x: 75, y: 15 }], // Top V
      [{ x: 50, y: 50 }, { x: 50, y: 85 }] // Bottom stem
    ],
    example: { word: 'Yo-yo', translation: 'Yo-yo', emoji: '🪀' }
  },
  {
    char: 'Z',
    name: 'Z',
    strokes: [
      [{ x: 25, y: 15 }, { x: 75, y: 15 }, { x: 25, y: 85 }, { x: 75, y: 85 }] // Zigzag
    ],
    example: { word: 'Zebra', translation: 'Ze-bra', emoji: '🦓' }
  }
];

// Arabic letter database with manual coordinates for proper tracing
export const arabicLetters: LetterData[] = [
  {
    char: 'أ',
    name: 'ألف',
    strokes: [
      [{ x: 50, y: 35 }, { x: 50, y: 85 }], // Alef line
      [{ x: 60, y: 15 }, { x: 40, y: 15 }, { x: 40, y: 24 }, { x: 60, y: 24 }, { x: 42, y: 31 }] // Hamza
    ],
    example: { word: 'أرنب', translation: 'Arnab (Rabbit)', emoji: '🐇' }
  },
  {
    char: 'ب',
    name: 'باء',
    strokes: [
      [{ x: 80, y: 45 }, { x: 80, y: 65 }, { x: 70, y: 75 }, { x: 30, y: 75 }, { x: 20, y: 65 }, { x: 20, y: 45 }], // Bowl
      [{ x: 50, y: 88 }] // Dot below
    ],
    example: { word: 'بيت', translation: 'Bayt (House)', emoji: '🏠' }
  },
  {
    char: 'ت',
    name: 'تاء',
    strokes: [
      [{ x: 80, y: 45 }, { x: 80, y: 65 }, { x: 70, y: 75 }, { x: 30, y: 75 }, { x: 20, y: 65 }, { x: 20, y: 45 }], // Bowl
      [{ x: 44, y: 32 }], // Dot 1
      [{ x: 56, y: 32 }]  // Dot 2
    ],
    example: { word: 'تفاح', translation: 'Tuffah (Apple)', emoji: '🍎' }
  },
  {
    char: 'ث',
    name: 'ثاء',
    strokes: [
      [{ x: 80, y: 45 }, { x: 80, y: 65 }, { x: 70, y: 75 }, { x: 30, y: 75 }, { x: 20, y: 65 }, { x: 20, y: 45 }], // Bowl
      [{ x: 44, y: 35 }], // Dot 1
      [{ x: 56, y: 35 }], // Dot 2
      [{ x: 50, y: 24 }]  // Dot 3 (Top)
    ],
    example: { word: 'ثعلب', translation: 'Tha\'lab (Fox)', emoji: '🦊' }
  },
  {
    char: 'ج',
    name: 'جيم',
    strokes: [
      [{ x: 35, y: 25 }, { x: 75, y: 25 }], // Top horizontal lid
      [{ x: 75, y: 25 }, { x: 30, y: 55 }, { x: 45, y: 85 }, { x: 75, y: 75 }], // Big belly
      [{ x: 52, y: 52 }] // Center dot
    ],
    example: { word: 'جمل', translation: 'Jamal (Camel)', emoji: '🐫' }
  },
  {
    char: 'ح',
    name: 'حاء',
    strokes: [
      [{ x: 35, y: 25 }, { x: 75, y: 25 }], // Top horizontal lid
      [{ x: 75, y: 25 }, { x: 30, y: 55 }, { x: 45, y: 85 }, { x: 75, y: 75 }]  // Big belly (No dot)
    ],
    example: { word: 'حلوى', translation: 'Halwa (Candy)', emoji: '🍬' }
  },
  {
    char: 'خ',
    name: 'خاء',
    strokes: [
      [{ x: 35, y: 25 }, { x: 75, y: 25 }], // Top lid
      [{ x: 75, y: 25 }, { x: 30, y: 55 }, { x: 45, y: 85 }, { x: 75, y: 75 }], // Big belly
      [{ x: 55, y: 13 }] // Top dot
    ],
    example: { word: 'خروف', translation: 'Kharoof (Sheep)', emoji: '🐑' }
  },
  {
    char: 'د',
    name: 'دال',
    strokes: [
      [{ x: 45, y: 35 }, { x: 65, y: 55 }, { x: 35, y: 65 }] // Standard Dal shape, opens to the left
    ],
    example: { word: 'دب', translation: 'Dub (Bear)', emoji: '🐻' }
  },
  {
    char: 'ذ',
    name: 'ذال',
    strokes: [
      [{ x: 45, y: 35 }, { x: 65, y: 55 }, { x: 35, y: 65 }], // Standard Dal shape, opens to the left
      [{ x: 50, y: 22 }] // Top dot
    ],
    example: { word: 'ذرة', translation: 'Thurah (Corn)', emoji: '🌽' }
  },
  {
    char: 'ر',
    name: 'راء',
    strokes: [
      [{ x: 65, y: 35 }, { x: 55, y: 55 }, { x: 30, y: 80 }] // Sweep down-left
    ],
    example: { word: 'رجل آلي', translation: 'Robot', emoji: '🤖' }
  },
  {
    char: 'ز',
    name: 'زاي',
    strokes: [
      [{ x: 65, y: 35 }, { x: 55, y: 55 }, { x: 30, y: 80 }], // Sweep down-left
      [{ x: 50, y: 22 }] // Dot
    ],
    example: { word: 'زرافة', translation: 'Zarafah (Giraffe)', emoji: '🦒' }
  },
  {
    char: 'س',
    name: 'سين',
    strokes: [
      [{ x: 75, y: 40 }, { x: 75, y: 55 }, { x: 65, y: 55 }, { x: 65, y: 40 }, { x: 65, y: 55 }, { x: 55, y: 55 }, { x: 55, y: 40 }], // Teeth
      [{ x: 55, y: 55 }, { x: 45, y: 75 }, { x: 25, y: 75 }, { x: 15, y: 55 }] // Bowl
    ],
    example: { word: 'سمكة', translation: 'Samakah (Fish)', emoji: '🐟' }
  },
  {
    char: 'ش',
    name: 'شين',
    strokes: [
      [{ x: 75, y: 40 }, { x: 75, y: 55 }, { x: 65, y: 55 }, { x: 65, y: 40 }, { x: 65, y: 55 }, { x: 55, y: 55 }, { x: 55, y: 40 }], // Teeth
      [{ x: 55, y: 55 }, { x: 45, y: 75 }, { x: 25, y: 75 }, { x: 15, y: 55 }], // Bowl
      [{ x: 55, y: 24 }], [{ x: 65, y: 24 }], [{ x: 60, y: 15 }] // Three dots
    ],
    example: { word: 'شمس', translation: 'Shams (Sun)', emoji: '☀️' }
  },
  {
    char: 'ص',
    name: 'صاد',
    strokes: [
      [{ x: 45, y: 60 }, { x: 65, y: 45 }, { x: 75, y: 60 }, { x: 45, y: 60 }], // Oval loop
      [{ x: 45, y: 60 }, { x: 35, y: 75 }, { x: 15, y: 75 }, { x: 10, y: 55 }] // Bowl
    ],
    example: { word: 'صقر', translation: 'Saqr (Falcon)', emoji: '🦅' }
  },
  {
    char: 'ض',
    name: 'ضاد',
    strokes: [
      [{ x: 45, y: 60 }, { x: 65, y: 45 }, { x: 75, y: 60 }, { x: 45, y: 60 }], // Oval loop
      [{ x: 45, y: 60 }, { x: 35, y: 75 }, { x: 15, y: 75 }, { x: 10, y: 55 }], // Bowl
      [{ x: 60, y: 28 }] // Dot
    ],
    example: { word: 'ضفدع', translation: 'Difda\' (Frog)', emoji: '🐸' }
  },
  {
    char: 'ط',
    name: 'طاء',
    strokes: [
      [{ x: 40, y: 65 }, { x: 60, y: 50 }, { x: 75, y: 65 }, { x: 30, y: 65 }], // Oval loop
      [{ x: 55, y: 25 }, { x: 55, y: 65 }] // Vertical stem
    ],
    example: { word: 'طائرة', translation: 'Ta\'irah (Plane)', emoji: '✈️' }
  },
  {
    char: 'ظ',
    name: 'ظاء',
    strokes: [
      [{ x: 40, y: 65 }, { x: 60, y: 50 }, { x: 75, y: 65 }, { x: 30, y: 65 }], // Oval loop
      [{ x: 55, y: 25 }, { x: 55, y: 65 }], // Vertical stem
      [{ x: 70, y: 40 }] // Dot
    ],
    example: { word: 'ظرف', translation: 'Zarf (Envelope)', emoji: '✉️' }
  },
  {
    char: 'ع',
    name: 'عين',
    strokes: [
      [{ x: 70, y: 30 }, { x: 50, y: 20 }, { x: 40, y: 35 }, { x: 55, y: 50 }], // Small C
      [{ x: 55, y: 50 }, { x: 30, y: 60 }, { x: 40, y: 85 }, { x: 75, y: 75 }] // Big C
    ],
    example: { word: 'عصفور', translation: 'Usfoor (Bird)', emoji: '🐦' }
  },
  {
    char: 'غ',
    name: 'غين',
    strokes: [
      [{ x: 70, y: 30 }, { x: 50, y: 20 }, { x: 40, y: 35 }, { x: 55, y: 50 }], // Small C
      [{ x: 55, y: 50 }, { x: 30, y: 60 }, { x: 40, y: 85 }, { x: 75, y: 75 }], // Big C
      [{ x: 55, y: 12 }] // Dot
    ],
    example: { word: 'غيمة', translation: 'Ghaymah (Cloud)', emoji: '☁️' }
  },
  {
    char: 'ف',
    name: 'فاء',
    strokes: [
      [{ x: 60, y: 45 }, { x: 75, y: 45 }, { x: 75, y: 55 }, { x: 60, y: 55 }, { x: 60, y: 45 }], // Loop
      [{ x: 60, y: 55 }, { x: 55, y: 70 }, { x: 25, y: 70 }, { x: 15, y: 55 }], // Bowl
      [{ x: 67, y: 30 }] // Dot
    ],
    example: { word: 'فيل', translation: 'Feel (Elephant)', emoji: '🐘' }
  },
  {
    char: 'ق',
    name: 'قاف',
    strokes: [
      [{ x: 60, y: 45 }, { x: 75, y: 45 }, { x: 75, y: 55 }, { x: 60, y: 55 }, { x: 60, y: 45 }], // Loop
      [{ x: 60, y: 55 }, { x: 50, y: 75 }, { x: 25, y: 75 }, { x: 15, y: 50 }], // Deep bowl
      [{ x: 62, y: 30 }], [{ x: 72, y: 30 }] // Two dots
    ],
    example: { word: 'قرد', translation: 'Qird (Monkey)', emoji: '🐒' }
  },
  {
    char: 'ك',
    name: 'كاف',
    strokes: [
      [{ x: 70, y: 25 }, { x: 70, y: 70 }, { x: 30, y: 70 }, { x: 20, y: 55 }], // L-shape
      [{ x: 52, y: 42 }, { x: 42, y: 42 }, { x: 42, y: 48 }, { x: 52, y: 48 }, { x: 44, y: 54 }] // Hamza
    ],
    example: { word: 'كلب', translation: 'Kalb (Dog)', emoji: '🐕' }
  },
  {
    char: 'ل',
    name: 'لام',
    strokes: [
      [{ x: 65, y: 20 }, { x: 65, y: 70 }, { x: 50, y: 85 }, { x: 30, y: 80 }] // J-hook
    ],
    example: { word: 'ليمون', translation: 'Laymoon (Lemon)', emoji: '🍋' }
  },
  {
    char: 'م',
    name: 'ميم',
    strokes: [
      [{ x: 65, y: 45 }, { x: 50, y: 45 }, { x: 50, y: 55 }, { x: 65, y: 55 }, { x: 65, y: 85 }] // Circle tail
    ],
    example: { word: 'موز', translation: 'Mawz (Banana)', emoji: '🍌' }
  },
  {
    char: 'ن',
    name: 'نون',
    strokes: [
      [{ x: 75, y: 45 }, { x: 70, y: 75 }, { x: 30, y: 75 }, { x: 25, y: 45 }], // Bowl
      [{ x: 50, y: 55 }] // Dot
    ],
    example: { word: 'نحلة', translation: 'Nahlah (Bee)', emoji: '🐝' }
  },
  {
    char: 'هـ',
    name: 'هاء',
    strokes: [
      [{ x: 70, y: 65 }, { x: 50, y: 35 }, { x: 30, y: 65 }, { x: 70, y: 65 }], // Outer loop
      [{ x: 50, y: 65 }, { x: 40, y: 50 }, { x: 50, y: 35 }] // Inner loop
    ],
    example: { word: 'هلال', translation: 'Hilal (Crescent)', emoji: '🌙' }
  },
  {
    char: 'و',
    name: 'واو',
    strokes: [
      [{ x: 60, y: 45 }, { x: 70, y: 45 }, { x: 70, y: 55 }, { x: 60, y: 55 }, { x: 60, y: 45 }], // Loop
      [{ x: 60, y: 55 }, { x: 50, y: 75 }, { x: 30, y: 80 }] // Tail Sweep
    ],
    example: { word: 'وردة', translation: 'Wardah (Flower)', emoji: '🌹' }
  },
  {
    char: 'ي',
    name: 'ياء',
    strokes: [
      [{ x: 75, y: 35 }, { x: 65, y: 25 }, { x: 50, y: 35 }, { x: 55, y: 55 }, { x: 40, y: 75 }, { x: 20, y: 65 }], // S-duck
      [{ x: 42, y: 85 }], [{ x: 52, y: 85 }] // Two dots below
    ],
    example: { word: 'يد', translation: 'Yad (Hand)', emoji: '✋' }
  }
];

// French letter database (reuses English letter shapes but overrides metadata and example words)
export const frenchLetters: LetterData[] = [
  {
    char: 'A',
    name: 'A',
    strokes: englishLetters[0].strokes,
    example: { word: 'Abeille', translation: 'Bee', emoji: '🐝' }
  },
  {
    char: 'B',
    name: 'B',
    strokes: englishLetters[1].strokes,
    example: { word: 'Ballon', translation: 'Balloon', emoji: '🎈' }
  },
  {
    char: 'C',
    name: 'C',
    strokes: englishLetters[2].strokes,
    example: { word: 'Canard', translation: 'Duck', emoji: '🦆' }
  },
  {
    char: 'D',
    name: 'D',
    strokes: englishLetters[3].strokes,
    example: { word: 'Dauphin', translation: 'Dolphin', emoji: '🐬' }
  },
  {
    char: 'E',
    name: 'E',
    strokes: englishLetters[4].strokes,
    example: { word: 'Étoile', translation: 'Star', emoji: '⭐' }
  },
  {
    char: 'F',
    name: 'F',
    strokes: englishLetters[5].strokes,
    example: { word: 'Fraise', translation: 'Strawberry', emoji: '🍓' }
  },
  {
    char: 'G',
    name: 'G',
    strokes: englishLetters[6].strokes,
    example: { word: 'Gâteau', translation: 'Cake', emoji: '🍰' }
  },
  {
    char: 'H',
    name: 'H',
    strokes: englishLetters[7].strokes,
    example: { word: 'Hibou', translation: 'Owl', emoji: '🦉' }
  },
  {
    char: 'I',
    name: 'I',
    strokes: englishLetters[8].strokes,
    example: { word: 'Île', translation: 'Island', emoji: '🏝️' }
  },
  {
    char: 'J',
    name: 'J',
    strokes: englishLetters[9].strokes,
    example: { word: 'Jardin', translation: 'Garden', emoji: '🏡' }
  },
  {
    char: 'K',
    name: 'K',
    strokes: englishLetters[10].strokes,
    example: { word: 'Kangourou', translation: 'Kangaroo', emoji: '🦘' }
  },
  {
    char: 'L',
    name: 'L',
    strokes: englishLetters[11].strokes,
    example: { word: 'Lion', translation: 'Lion', emoji: '🦁' }
  },
  {
    char: 'M',
    name: 'M',
    strokes: englishLetters[12].strokes,
    example: { word: 'Mouton', translation: 'Sheep', emoji: '🐑' }
  },
  {
    char: 'N',
    name: 'N',
    strokes: englishLetters[13].strokes,
    example: { word: 'Nid', translation: 'Nest', emoji: '🪹' }
  },
  {
    char: 'O',
    name: 'O',
    strokes: englishLetters[14].strokes,
    example: { word: 'Ours', translation: 'Bear', emoji: '🐻' }
  },
  {
    char: 'P',
    name: 'P',
    strokes: englishLetters[15].strokes,
    example: { word: 'Papillon', translation: 'Butterfly', emoji: '🦋' }
  },
  {
    char: 'Q',
    name: 'Q',
    strokes: englishLetters[16].strokes,
    example: { word: 'Quatre', translation: 'Four', emoji: '4️⃣' }
  },
  {
    char: 'R',
    name: 'R',
    strokes: englishLetters[17].strokes,
    example: { word: 'Renard', translation: 'Fox', emoji: '🦊' }
  },
  {
    char: 'S',
    name: 'S',
    strokes: englishLetters[18].strokes,
    example: { word: 'Soleil', translation: 'Sun', emoji: '☀️' }
  },
  {
    char: 'T',
    name: 'T',
    strokes: englishLetters[19].strokes,
    example: { word: 'Tortue', translation: 'Turtle', emoji: '🐢' }
  },
  {
    char: 'U',
    name: 'U',
    strokes: englishLetters[20].strokes,
    example: { word: 'Unicorne', translation: 'Unicorn', emoji: '🦄' }
  },
  {
    char: 'V',
    name: 'V',
    strokes: englishLetters[21].strokes,
    example: { word: 'Vélo', translation: 'Bicycle', emoji: '🚲' }
  },
  {
    char: 'W',
    name: 'W',
    strokes: englishLetters[22].strokes,
    example: { word: 'Wagon', translation: 'Wagon', emoji: '🚃' }
  },
  {
    char: 'X',
    name: 'X',
    strokes: englishLetters[23].strokes,
    example: { word: 'Xylophone', translation: 'Xylophone', emoji: '🪘' }
  },
  {
    char: 'Y',
    name: 'Y',
    strokes: englishLetters[24].strokes,
    example: { word: 'Yaourt', translation: 'Yogurt', emoji: '🥛' }
  },
  {
    char: 'Z',
    name: 'Z',
    strokes: englishLetters[25].strokes,
    example: { word: 'Zèbre', translation: 'Zebra', emoji: '🦓' }
  }
];

// German letter database
export const germanLetters: LetterData[] = [
  {
    char: 'A',
    name: 'A',
    strokes: englishLetters[0].strokes,
    example: { word: 'Apfel', translation: 'Apple', emoji: '🍎' }
  },
  {
    char: 'B',
    name: 'B',
    strokes: englishLetters[1].strokes,
    example: { word: 'Biene', translation: 'Bee', emoji: '🐝' }
  },
  {
    char: 'C',
    name: 'C',
    strokes: englishLetters[2].strokes,
    example: { word: 'Clown', translation: 'Clown', emoji: '🤡' }
  },
  {
    char: 'D',
    name: 'D',
    strokes: englishLetters[3].strokes,
    example: { word: 'Drache', translation: 'Dragon', emoji: '🐉' }
  },
  {
    char: 'E',
    name: 'E',
    strokes: englishLetters[4].strokes,
    example: { word: 'Erdbeere', translation: 'Strawberry', emoji: '🍓' }
  },
  {
    char: 'F',
    name: 'F',
    strokes: englishLetters[5].strokes,
    example: { word: 'Fisch', translation: 'Fish', emoji: '🐟' }
  },
  {
    char: 'G',
    name: 'G',
    strokes: englishLetters[6].strokes,
    example: { word: 'Gitarre', translation: 'Guitar', emoji: '🎸' }
  },
  {
    char: 'H',
    name: 'H',
    strokes: englishLetters[7].strokes,
    example: { word: 'Hase', translation: 'Rabbit', emoji: '🐇' }
  },
  {
    char: 'I',
    name: 'I',
    strokes: englishLetters[8].strokes,
    example: { word: 'Igel', translation: 'Hedgehog', emoji: '🦔' }
  },
  {
    char: 'J',
    name: 'J',
    strokes: englishLetters[9].strokes,
    example: { word: 'Jaguar', translation: 'Jaguar', emoji: '🐆' }
  },
  {
    char: 'K',
    name: 'K',
    strokes: englishLetters[10].strokes,
    example: { word: 'Koala', translation: 'Koala', emoji: '🐨' }
  },
  {
    char: 'L',
    name: 'L',
    strokes: englishLetters[11].strokes,
    example: { word: 'Löwe', translation: 'Lion', emoji: '🦁' }
  },
  {
    char: 'M',
    name: 'M',
    strokes: englishLetters[12].strokes,
    example: { word: 'Maus', translation: 'Mouse', emoji: '🐭' }
  },
  {
    char: 'N',
    name: 'N',
    strokes: englishLetters[13].strokes,
    example: { word: 'Nest', translation: 'Nest', emoji: '🪹' }
  },
  {
    char: 'O',
    name: 'O',
    strokes: englishLetters[14].strokes,
    example: { word: 'Obst', translation: 'Fruit', emoji: '🍎' }
  },
  {
    char: 'P',
    name: 'P',
    strokes: englishLetters[15].strokes,
    example: { word: 'Pinguin', translation: 'Penguin', emoji: '🐧' }
  },
  {
    char: 'Q',
    name: 'Q',
    strokes: englishLetters[16].strokes,
    example: { word: 'Qualle', translation: 'Jellyfish', emoji: '🪼' }
  },
  {
    char: 'R',
    name: 'R',
    strokes: englishLetters[17].strokes,
    example: { word: 'Roboter', translation: 'Robot', emoji: '🤖' }
  },
  {
    char: 'S',
    name: 'S',
    strokes: englishLetters[18].strokes,
    example: { word: 'Sonne', translation: 'Sun', emoji: '☀️' }
  },
  {
    char: 'T',
    name: 'T',
    strokes: englishLetters[19].strokes,
    example: { word: 'Tiger', translation: 'Tiger', emoji: '🐯' }
  },
  {
    char: 'U',
    name: 'U',
    strokes: englishLetters[20].strokes,
    example: { word: 'Uhr', translation: 'Clock', emoji: '⏰' }
  },
  {
    char: 'V',
    name: 'V',
    strokes: englishLetters[21].strokes,
    example: { word: 'Vogel', translation: 'Bird', emoji: '🐦' }
  },
  {
    char: 'W',
    name: 'W',
    strokes: englishLetters[22].strokes,
    example: { word: 'Wal', translation: 'Whale', emoji: '🐋' }
  },
  {
    char: 'X',
    name: 'X',
    strokes: englishLetters[23].strokes,
    example: { word: 'Xylophone', translation: 'Xylophone', emoji: '🪘' }
  },
  {
    char: 'Y',
    name: 'Y',
    strokes: englishLetters[24].strokes,
    example: { word: 'Yak', translation: 'Yak', emoji: '🐂' }
  },
  {
    char: 'Z',
    name: 'Z',
    strokes: englishLetters[25].strokes,
    example: { word: 'Zebra', translation: 'Zebra', emoji: '🦓' }
  }
];

export function getLettersForLanguage(lang: string): LetterData[] {
  switch (lang) {
    case 'ar':
      return arabicLetters;
    case 'fr':
      return frenchLetters;
    case 'de':
      return germanLetters;
    case 'en':
    default:
      return englishLetters;
  }
}
