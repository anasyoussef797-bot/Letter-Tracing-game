'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Next.js entrypoint file that lets the user deploy this immediately onto Vercel!
// It references the same elegant client gameplay as our primary React SPA.
import React from 'react';

export default function Home() {
  React.useEffect(() => {
    // Redirect to the fully functional standalone HTML game served statically, 
    // or notify that they can copy the React files from /src directly!
    window.location.href = '/standalone_tracing_adventure.html';
  }, []);

  return (
    <div className="min-h-screen bg-sky-400 flex flex-col items-center justify-center text-white text-center p-6">
      <h1 className="text-3xl font-black mb-2 animate-bounce">🏝️ 3D Tracing Adventure ✨</h1>
      <p className="text-sm opacity-80 max-w-sm mb-4">Loading your interactive offline-ready handwriting game...</p>
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
