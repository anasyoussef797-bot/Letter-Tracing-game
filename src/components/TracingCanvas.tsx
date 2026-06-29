/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { LetterData, Point } from '../types';
import { interpolateStroke, getLettersForLanguage } from '../utils/letters';
import { sfx } from '../utils/audio';

interface TracingCanvasProps {
  letter: LetterData;
  onComplete: () => void;
  onStrokeComplete: (strokeIdx: number) => void;
  onDrawProgress: (progress: number) => void;
  onWarning: () => void;
  lang: string;
  avatarEmoji?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  spin?: number;
  angle?: number;
  isConfetti?: boolean;
}

export const TracingCanvas: React.FC<TracingCanvasProps> = ({
  letter,
  onComplete,
  onStrokeComplete,
  onDrawProgress,
  onWarning,
  lang,
  avatarEmoji = '🦁',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeStrokeIdx, setActiveStrokeIdx] = useState(0);
  const [lastReachedIdx, setLastReachedIdx] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [warningActive, setWarningActive] = useState(false);
  const [guideT, setGuideT] = useState(0); // Animated guide star position (0..1)
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });

  // Keep tracking references to avoid stale closures in requestAnimationFrame loops
  const activeStrokeRef = useRef(activeStrokeIdx);
  const lastReachedRef = useRef(lastReachedIdx);
  const isDrawingRef = useRef(isDrawing);
  const particlesRef = useRef<Particle[]>([]);
  const userDrawnPointsRef = useRef<Point[]>([]);

  // Reset tracing state when letter or language changes
  useEffect(() => {
    setActiveStrokeIdx(0);
    setLastReachedIdx(-1);
    setIsDrawing(false);
    setWarningActive(false);
    userDrawnPointsRef.current = [];
    particlesRef.current = [];
    activeStrokeRef.current = 0;
    lastReachedRef.current = -1;
    isDrawingRef.current = false;
  }, [letter]);

  // Sync state values with refs for frame-accurate access
  useEffect(() => {
    activeStrokeRef.current = activeStrokeIdx;
  }, [activeStrokeIdx]);

  useEffect(() => {
    lastReachedRef.current = lastReachedIdx;
  }, [lastReachedIdx]);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  // Generate guide star pulse animation
  useEffect(() => {
    let animationId: number;
    const startTime = performance.now();
    const animateGuide = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      // Stars slides along the stroke every 3 seconds
      const t = (elapsed % 2.5) / 2.5;
      setGuideT(t);
      animationId = requestAnimationFrame(animateGuide);
    };
    animationId = requestAnimationFrame(animateGuide);
    return () => cancelAnimationFrame(animationId);
  }, [letter, activeStrokeIdx]);

  // Multi-resolution canvas setup and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 600;
    let height = 600;

    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        // Square fitting
        const size = Math.min(rect.width, rect.height, 600);
        width = size;
        height = size;
        canvas.width = size * window.devicePixelRatio;
        canvas.height = size * window.devicePixelRatio;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(resize);
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Pre-calculate interpolated paths for all strokes of this letter
    const interpolatedStrokes = letter.strokes.map(st => interpolateStroke(st, 2.5));

    // Particle color generation helper
    const getRainbowColor = (factor: number) => {
      const hue = (factor * 360) % 360;
      return `hsla(${hue}, 95%, 65%, 1)`;
    };

    const addParticlesAt = (cx: number, cy: number, count = 3, forceConfetti = false) => {
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = forceConfetti ? (Math.random() * 6 + 4) : (Math.random() * 2 + 1);
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (forceConfetti ? 2 : 0.5), // upwards drift
          color: colors[Math.floor(Math.random() * colors.length)],
          size: forceConfetti ? (Math.random() * 8 + 6) : (Math.random() * 4 + 3),
          alpha: 1.0,
          decay: forceConfetti ? 0.015 : 0.03,
          spin: (Math.random() - 0.5) * 0.2,
          angle: Math.random() * Math.PI * 2,
          isConfetti: forceConfetti,
        });
      }
    };

    const render = () => {
      // Clear canvas with a transparent slate background for soft glassmorphism overlay
      ctx.clearRect(0, 0, width, height);

      // Draw shadow glow for active path
      ctx.shadowBlur = 0;

      // 1. Draw ALL strokes as light background guide templates
      letter.strokes.forEach((stroke, idx) => {
        if (stroke.length < 2) {
          // Draw dot guide
          const p = stroke[0];
          const px = (p.x / 100) * width;
          const py = (p.y / 100) * height;
          ctx.beginPath();
          ctx.arc(px, py, 18, 0, Math.PI * 2);
          ctx.fillStyle = idx === activeStrokeRef.current ? 'rgba(239, 68, 68, 0.15)' : 'rgba(203, 213, 225, 0.2)';
          ctx.fill();
          ctx.strokeStyle = idx === activeStrokeRef.current ? '#ef4444' : '#cbd5e1';
          ctx.lineWidth = 3;
          ctx.stroke();
          return;
        }

        ctx.beginPath();
        stroke.forEach((p, pIdx) => {
          const px = (p.x / 100) * width;
          const py = (p.y / 100) * height;
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw deep shadow/background curve guide
        ctx.lineWidth = 42;
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
        ctx.stroke();

        // Innermost guidance channel
        ctx.lineWidth = 34;
        ctx.strokeStyle = idx === activeStrokeRef.current 
          ? 'rgba(254, 243, 199, 0.9)' // Pulsing soft gold for active
          : 'rgba(255, 255, 255, 0.6)'; // Static clean white for others
        ctx.stroke();

        // Dotted direction tracking line in center
        ctx.lineWidth = 2;
        ctx.strokeStyle = idx === activeStrokeRef.current ? '#d97706' : '#94a3b8';
        ctx.setLineDash([6, 8]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // Draw dynamic guiding arrows/chevrons along the active stroke to direct the child logically
        if (idx === activeStrokeRef.current && interpolatedStrokes[idx]) {
          const interp = interpolatedStrokes[idx];
          if (interp.length > 8) {
            // Draw guiding chevrons along the path at 25%, 50%, and 75% of progress
            const indices = [
              Math.floor(interp.length * 0.25),
              Math.floor(interp.length * 0.50),
              Math.floor(interp.length * 0.75)
            ];
            indices.forEach(cIdx => {
              const pt = interp[cIdx];
              const nextPt = interp[Math.min(cIdx + 2, interp.length - 1)];
              if (pt && nextPt) {
                const cx = (pt.x / 100) * width;
                const cy = (pt.y / 100) * height;
                const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x);

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);

                ctx.beginPath();
                ctx.moveTo(-5, -5);
                ctx.lineTo(2, 0);
                ctx.lineTo(-5, 5);
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();

                ctx.restore();
              }
            });
          }
        }
      });

      // 2. Draw COMPLETED strokes in vibrant rainbow candy style
      for (let s = 0; s < activeStrokeRef.current; s++) {
        const stroke = letter.strokes[s];
        if (stroke.length < 2) {
          // Completed dot
          const p = stroke[0];
          const px = (p.x / 100) * width;
          const py = (p.y / 100) * height;
          ctx.beginPath();
          ctx.arc(px, py, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.fill();
          continue;
        }

        ctx.beginPath();
        stroke.forEach((p, pIdx) => {
          const px = (p.x / 100) * width;
          const py = (p.y / 100) * height;
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 34;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)'; // Completed green
        ctx.stroke();

        // Inner highlight
        ctx.lineWidth = 26;
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
        ctx.stroke();
      }

      // 3. Draw CURRENT ACTIVE stroke progress (the user's glowing trace)
      const curStrokeIdx = activeStrokeRef.current;
      const activeInterp = interpolatedStrokes[curStrokeIdx];
      const reachedIdx = lastReachedRef.current;

      if (activeInterp && activeInterp.length > 0 && reachedIdx >= 0) {
        // Draw the glowing progress trail along the ideal path
        ctx.beginPath();
        for (let i = 0; i <= reachedIdx; i++) {
          const p = activeInterp[i];
          const px = (p.x / 100) * width;
          const py = (p.y / 100) * height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 34;
        
        // Beautiful vibrant orange-to-purple gradient or active neon turquoise glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.85)'; // Active drawing blue
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // Inner glowing core
        ctx.lineWidth = 26;
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.9)';
        ctx.stroke();
      }

      // 4. Render User Free-drawn scribbles for tactile visual feedback
      if (isDrawingRef.current && userDrawnPointsRef.current.length > 1) {
        ctx.beginPath();
        userDrawnPointsRef.current.forEach((p, pIdx) => {
          const px = (p.x / 100) * width;
          const py = (p.y / 100) * height;
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 14;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'; // Playful amber trailing scribble
        ctx.stroke();
      }

      // 5. Draw START and END target visual icons for the active stroke
      if (curStrokeIdx < letter.strokes.length) {
        const stroke = letter.strokes[curStrokeIdx];
        if (stroke.length >= 2) {
          const startPt = stroke[0];
          const endPt = stroke[stroke.length - 1];

          const sX = (startPt.x / 100) * width;
          const sY = (startPt.y / 100) * height;
          const eX = (endPt.x / 100) * width;
          const eY = (endPt.y / 100) * height;

          // Soft Green Pulsing Start Guide Ring
          const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.12;
          ctx.beginPath();
          ctx.arc(sX, sY, 22 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Determine current position of the animal (mascot) along the path
          const activeInterp = interpolatedStrokes[curStrokeIdx];
          const mascotPt = (reachedIdx >= 0 && activeInterp) ? activeInterp[reachedIdx] : startPt;
          const mX = (mascotPt.x / 100) * width;
          const mY = (mascotPt.y / 100) * height;

          // Draw a beautifully styled circular coin bubble for the mascot
          const mPulse = reachedIdx >= 0 ? 1.05 : (1 + Math.sin(performance.now() * 0.01) * 0.06);
          ctx.save();
          
          // Draw soft drop shadow for the mascot coin
          ctx.shadowBlur = reachedIdx >= 0 ? 12 : 6;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.35)';
          ctx.shadowOffsetY = reachedIdx >= 0 ? 6 : 3;

          ctx.beginPath();
          ctx.arc(mX, mY, 26 * mPulse, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          
          ctx.restore(); // reset shadow before stroking

          ctx.beginPath();
          ctx.arc(mX, mY, 26 * mPulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Draw mascot emoji inside the coin bubble
          ctx.font = '34px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(avatarEmoji, mX, mY + 2.5); // visual vertical alignment offset

          // Draw the guiding arrow attached to the mascot coin pointing in the tracing direction
          let nextPt = null;
          if (activeInterp && activeInterp.length > 0) {
            const nextIdx = reachedIdx < 0 ? 1 : reachedIdx + 1;
            if (nextIdx < activeInterp.length) {
              nextPt = activeInterp[nextIdx];
            } else {
              nextPt = endPt;
            }
          } else {
            nextPt = endPt;
          }

          if (nextPt) {
            const nX = (nextPt.x / 100) * width;
            const nY = (nextPt.y / 100) * height;
            const dx = nX - mX;
            const dy = nY - mY;
            if (Math.hypot(dx, dy) > 1) {
              const angle = Math.atan2(dy, dx);
              ctx.save();
              ctx.translate(mX, mY);
              ctx.rotate(angle);

              // Draw a prominent cute guide arrow sitting right on/around the edge of the animal mascot circle
              const r = 26 * mPulse;
              ctx.beginPath();
              ctx.moveTo(r - 4, -9);
              ctx.lineTo(r + 15, 0);
              ctx.lineTo(r - 4, 9);
              ctx.lineTo(r, 0);
              ctx.closePath();

              ctx.fillStyle = '#f97316'; // Vivid orange arrow
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 3;
              ctx.shadowBlur = 4;
              ctx.shadowColor = 'rgba(249, 115, 22, 0.5)';
              ctx.fill();
              ctx.stroke();

              ctx.restore();
            }
          }

          // End Indicator (Red target/star circle)
          ctx.beginPath();
          ctx.arc(eX, eY, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Star shape inside end target
          ctx.beginPath();
          const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
            let rot = (Math.PI / 2) * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
              x = cx + Math.cos(rot) * outerRadius;
              y = cy + Math.sin(rot) * outerRadius;
              ctx.lineTo(x, y);
              rot += step;

              x = cx + Math.cos(rot) * innerRadius;
              y = cy + Math.sin(rot) * innerRadius;
              ctx.lineTo(x, y);
              rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
          };
          drawStar(eX, eY, 5, 8, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }

      // 6. Draw Animated Guidance Star gliding along the uncompleted path
      if (curStrokeIdx < letter.strokes.length && reachedIdx < activeInterp.length - 1) {
        const startIndex = Math.max(0, reachedIdx);
        const remainingLength = activeInterp.length - startIndex;
        const targetIndex = startIndex + Math.floor(guideT * remainingLength);
        const guidePt = activeInterp[Math.min(targetIndex, activeInterp.length - 1)];

        if (guidePt) {
          const gX = (guidePt.x / 100) * width;
          const gY = (guidePt.y / 100) * height;

          // Glowing star halo
          const glowRad = 15 + Math.sin(performance.now() * 0.012) * 6;
          const grad = ctx.createRadialGradient(gX, gY, 2, gX, gY, glowRad);
          grad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
          grad.addColorStop(0.5, 'rgba(251, 191, 36, 0.3)');
          grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
          ctx.beginPath();
          ctx.arc(gX, gY, glowRad, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Golden sparkle star core
          ctx.beginPath();
          ctx.arc(gX, gY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Add continuous tiny visual ambient trail particles at guide star
          if (Math.random() < 0.25) {
            addParticlesAt(gX, gY, 1);
          }
        }
      }

      // 7. Update and Draw ALL Particles (Trails, sparkles and confetti)
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        // Ensure alpha is in a valid range [0, 1] before drawing to avoid negative radius
        const safeAlpha = Math.max(0, Math.min(1, p.alpha));

        if (p.isConfetti) {
          p.vy += 0.15; // confetti gravity
          p.angle = (p.angle || 0) + (p.spin || 0);
          
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = safeAlpha;
          // Draw rectangle ribbons or stars
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
          ctx.restore();
        } else {
          // Normal round sparkle trails
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0, p.size * safeAlpha), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = safeAlpha;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0; // Reset alpha

      // Clean up dead particles
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [letter, activeStrokeIdx, lastReachedIdx, guideT]);

  // Tracing coordinate translation and validation
  const handlePointerStart = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const strokes = letter.strokes;
    if (activeStrokeIdx >= strokes.length) return;

    const activeStroke = strokes[activeStrokeIdx];
    
    // For Dot strokes (1-point strokes like i dots or Arabic dots)
    if (activeStroke.length === 1) {
      const dot = activeStroke[0];
      const dist = Math.sqrt(Math.pow(dot.x - x, 2) + Math.pow(dot.y - y, 2));
      if (dist < 14) {
        // Tapped the dot successfully!
        sfx.playSuccess();
        const canvasSize = rect.width;
        // Explode sparkles
        const pX = (dot.x / 100) * canvasSize;
        const pY = (dot.y / 100) * canvasSize;
        for (let i = 0; i < 15; i++) {
          particlesRef.current.push({
            x: pX,
            y: pY,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 1,
            color: '#10b981',
            size: Math.random() * 5 + 3,
            alpha: 1.0,
            decay: 0.025,
          });
        }
        
        onStrokeComplete(activeStrokeIdx);
        if (activeStrokeIdx + 1 >= strokes.length) {
          onComplete();
        } else {
          setActiveStrokeIdx(activeStrokeIdx + 1);
          setLastReachedIdx(-1);
        }
      } else {
        sfx.playWarn();
        onWarning();
        triggerShake();
      }
      return;
    }

    // Normal multi-point stroke
    const startPt = activeStroke[0];
    const distToStart = Math.sqrt(Math.pow(startPt.x - x, 2) + Math.pow(startPt.y - y, 2));

    // Tolerance check to begin tracing (preschoolers are clumsy, we give 16% canvas space tolerance!)
    if (distToStart < 16) {
      setIsDrawing(true);
      setLastReachedIdx(0);
      userDrawnPointsRef.current = [{ x, y }];
      sfx.playDraw(0.01);
      
      const canvasSize = rect.width;
      const pX = (startPt.x / 100) * canvasSize;
      const pY = (startPt.y / 100) * canvasSize;
      // Start sparkles
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particlesRef.current.push({
          x: pX,
          y: pY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: '#3b82f6',
          size: Math.random() * 4 + 3,
          alpha: 1.0,
          decay: 0.03,
        });
      }
    } else {
      // Gentle feedback that they must start near the green starting circle
      sfx.playWarn();
      onWarning();
      triggerShake();
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    userDrawnPointsRef.current.push({ x, y });
    if (userDrawnPointsRef.current.length > 25) {
      userDrawnPointsRef.current.shift(); // Keep visual trails short and clean
    }

    const strokes = letter.strokes;
    const activeStroke = strokes[activeStrokeIdx];
    const interpolated = interpolateStroke(activeStroke, 2.5);

    // Look ahead to find if the drawing path is approaching next milestone points
    let currentReached = lastReachedIdx;
    let foundAdvance = false;

    // Check next 2 points sequentially to ensure the child actually traces the line with their hand
    // rather than jumping ahead or auto-completing it too early.
    const lookAheadCount = Math.min(2, interpolated.length - 1 - currentReached);
    let bestIndex = -1;
    let minDistance = 999;

    for (let i = 1; i <= lookAheadCount; i++) {
      const idx = currentReached + i;
      const pt = interpolated[idx];
      const dist = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));

      if (dist < minDistance) {
        minDistance = dist;
        if (dist < 6) { // High-fidelity tracing tolerance (6% coordinate units) to prevent premature snapping
          bestIndex = idx;
        }
      }
    }

    if (bestIndex !== -1) {
      currentReached = bestIndex;
      setLastReachedIdx(currentReached);
      foundAdvance = true;
      setWarningActive(false);

      // Play soft drawing sounds synchronized to trace progress
      const progressFactor = currentReached / (interpolated.length - 1);
      sfx.playDraw(progressFactor);
      onDrawProgress(progressFactor);

      // Generate spark trails following the ideal path
      const canvasSize = rect.width;
      const targetPt = interpolated[currentReached];
      const px = (targetPt.x / 100) * canvasSize;
      const py = (targetPt.y / 100) * canvasSize;
      
      const colors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];
      particlesRef.current.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 4,
        alpha: 1.0,
        decay: 0.02,
      });

      // Check if stroke completed!
      if (currentReached >= interpolated.length - 1) {
        setIsDrawing(false);
        userDrawnPointsRef.current = [];
        sfx.playSuccess();
        
        // Success sparkles explosion at the ending node
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 2;
          particlesRef.current.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            color: '#10b981',
            size: Math.random() * 5 + 4,
            alpha: 1.0,
            decay: 0.02,
          });
        }

        onStrokeComplete(activeStrokeIdx);
        
        if (activeStrokeIdx + 1 >= strokes.length) {
          // All strokes complete! Letter done!
          // Large full-screen confetti burst
          for (let i = 0; i < 60; i++) {
            const cX = Math.random() * canvasSize;
            const cY = Math.random() * canvasSize * 0.3;
            // Generate upward spray confetti
            particlesRef.current.push({
              x: canvasSize / 2,
              y: canvasSize * 0.8,
              vx: (Math.random() - 0.5) * 14,
              vy: -Math.random() * 10 - 5,
              color: `hsl(${Math.random() * 360}, 95%, 60%)`,
              size: Math.random() * 10 + 8,
              alpha: 1.0,
              decay: 0.008,
              spin: (Math.random() - 0.5) * 0.3,
              angle: Math.random() * Math.PI * 2,
              isConfetti: true,
            });
          }
          
          setTimeout(() => {
            onComplete();
          }, 600);
        } else {
          setActiveStrokeIdx(activeStrokeIdx + 1);
          setLastReachedIdx(-1);
        }
      }
    }

    // Path adherence checker: if children wander off the guide rail completely
    if (!foundAdvance && currentReached >= 0) {
      // Find distance to the closest point in the entire active stroke path to ensure they didn't leave
      let closestDist = 999;
      interpolated.forEach(pt => {
        const d = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
        if (d < closestDist) closestDist = d;
      });

      if (closestDist > 20) { // Off-path bounds threshold
        setIsDrawing(false);
        userDrawnPointsRef.current = [];
        setWarningActive(true);
        sfx.playWarn();
        onWarning();
        triggerShake();
      }
    }
  };

  const handlePointerEnd = () => {
    setIsDrawing(false);
    userDrawnPointsRef.current = [];
  };

  const triggerShake = () => {
    // 3D screen rattle feedback
    const shakes = [
      { x: -10, y: 5 }, { x: 8, y: -7 }, { x: -6, y: 4 }, { x: 4, y: -3 }, { x: 0, y: 0 }
    ];
    shakes.forEach((val, index) => {
      setTimeout(() => {
        setShakeOffset(val);
      }, index * 45);
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none touch-none overflow-hidden"
      style={{
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
        transition: shakeOffset.x === 0 ? 'transform 0.15s ease' : 'none',
      }}
    >
      {/* Decorative Floating Background Ambient Grid */}
      <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />

      {/* Tracing Area Wrapper with Premium soft golden neon glow on drawing */}
      <div
        className={`relative rounded-3xl overflow-hidden bg-white/65 backdrop-blur-md shadow-2xl transition-all duration-300 border border-white/60 ${
          isDrawing 
            ? 'shadow-[0_20px_50px_rgba(59,130,246,0.25)] border-blue-200/50 scale-[1.01]' 
            : warningActive 
            ? 'shadow-[0_20px_50px_rgba(239,68,68,0.25)] border-red-200/50 animate-pulse' 
            : 'border-white/50'
        }`}
      >
        <canvas
          id="tracing-board-canvas"
          ref={canvasRef}
          className="block cursor-pointer relative z-10"
          onMouseDown={(e) => {
            e.preventDefault();
            handlePointerStart(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            e.preventDefault();
            handlePointerMove(e.clientX, e.clientY);
          }}
          onMouseUp={handlePointerEnd}
          onMouseLeave={handlePointerEnd}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handlePointerStart(touch.clientX, touch.clientY);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handlePointerMove(touch.clientX, touch.clientY);
          }}
          onTouchEnd={handlePointerEnd}
        />

        {warningActive && (
          <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[1px] pointer-events-none z-20 flex items-center justify-center animate-fade-in">
            <div className="bg-red-500/90 text-white font-medium text-xs px-4 py-2 rounded-full shadow-lg border border-red-400 flex items-center gap-1.5 animate-bounce">
              <span>⚠️</span>
              {lang === 'ar' ? 'ابقَ داخل الخط!' : lang === 'fr' ? 'Reste sur la ligne !' : lang === 'de' ? 'Bleib auf der Linie!' : 'Stay inside the line!'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
