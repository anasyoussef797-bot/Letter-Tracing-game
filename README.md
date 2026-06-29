# 3D Letter Tracing Adventure 🏝️✨

A premium, production-ready interactive educational game designed for preschool children (3–6 years old) to learn how to write letters by tracing them with a finger or mouse.

This project is fully modular and supports 4 languages out of the box with automatic RTL adjustment for Arabic!

---

## 🌟 Key Features

1. **Multilingual Sound System (Zero Assets Required!)**
   - **Real Speech Synthesis**: Uses the Web Speech API (`speechSynthesis`) to pronounce letters and encouragements dynamically in **Arabic**, **English**, **French**, and **German** using native local voice profiles.
   - **Real-Time Audio Synthesizer**: Uses the Web Audio API to create zero-latency, sweet, playful chimes, sparkles, click tones, and warning pops. No bulky audio assets to download!

2. **AAA Quality Gameplay & Visual Style**
   - **Aesthetics**: Glassmorphism dashboard panel overlays, beautiful pastel gradients, bouncing animal avatars, and animated floating clouds.
   - **Pulsing Guides**: The active letter stroke shows a start circle and end target, with an animated golden star gliding along the path to show the correct handwriting order.
   - **Responsive Tracing Canvas**: Perfect aspect-ratio fitting via `ResizeObserver` that scales seamlessly for high-density Android tablets, iPad, and mobile phone screen sizes.

3. **Smart Handwriting Validation Engine**
   - **Forgiving Window**: Employs spatial dense point interpolation to check tracing proximity (relative 100x100 scaling), so children do not need absolute pixel-perfect accuracy to play.
   - **Tactile Physics**: Draws interactive colorful particle sparks, trails, and large multi-colored confetti ribbon explosions on level completion.
   - **Non-punitive Feedback**: If the drawing deviates off-path, a gentle warning appears, accompanied by a friendly bubble sound and a 3D screen shake.

4. **Polaroid Screenshot Masterpiece Capture**
   - Uses an HTML Canvas compositor to snapshot the child's drawing and frames it inside a vintage Polaroid card containing the letter's companion emoji, spelling, and phonetic pronunciation.
   - Enables immediate local saving on mobile devices and iPads.

5. **Offline Standalone HTML Version Included**
   - Enclosed single-file pure HTML format (`standalone_tracing_adventure.html`) that bundles the full tracing engine, letters database, sound synth, speech support, and gameplay! Plays instantly anywhere on earth offline.

---

## 📂 Architecture & Files

* **`/src/types.ts`**: Core TypeScript models and state structures.
* **`/src/utils/audio.ts`**: Web Audio synthesizer class and Speech Manager.
* **`/src/utils/letters.ts`**: Handcrafted relative drawing stroke milestones database and interpolation logic.
* **`/src/utils/localization.ts`**: Multi-language translation labels.
* **`/src/components/TracingCanvas.tsx`**: Advanced high-fidelity responsive HTML Canvas tracing, particle loops, and gesture events.
* **`/src/components/LanguageSelector.tsx`**, **`AvatarSelector.tsx`**, **`AdventureMap.tsx`**: Engaging gameplay screens.
* **`/public/standalone_tracing_adventure.html`**: The complete single-file standalone offline edition of the game.
* **`/nextjs-app/`**: Turnkey configurations for GitHub and Next.js Vercel hosting.

---

## 🛠️ Local Development & Build

Ensure Node.js is installed, then run:

```bash
# Install packages
npm install

# Start local development server
npm run dev

# Run TypeScript syntax check
npm run lint

# Compile production Vite bundle
npm run build
```

Open `http://localhost:3000` to play immediately!

---

## 🚀 GitHub & Vercel Deployment

### Deploying the React/Vite Version:
1. Push this workspace to your GitHub repository.
2. Link it to **Vercel** or **Netlify**.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Done!

### Deploying the Next.js Version:
1. Navigate to the `/nextjs-app/` subdirectory.
2. Push `/nextjs-app/` files as a standalone repository to GitHub.
3. Import the repository into **Vercel** as a Next.js framework project.
4. Done!

---
*Created with high precision and crafted to delight preschoolers globally.*
