import { Navigate, Route, Routes } from 'react-router-dom';
import { GradientMesh } from './components/GradientMesh';
import { Header } from './components/Header';
import { Builder } from './pages/Builder';
import { Landing } from './pages/Landing';
import { Me } from './pages/Me';
import { Recommendations } from './pages/Recommendations';
import { Vibe } from './pages/Vibe';

export function App(): JSX.Element {
  return (
    <div className="relative min-h-screen">
      <GradientMesh />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Builder />} />
          <Route path="/vibe" element={<Vibe />} />
          <Route path="/recs" element={<Recommendations />} />
          <Route path="/me" element={<Me />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="mt-16 border-t border-white/5 py-8 text-center text-xs text-white/40">
        Jamming — built with React, TypeScript, Vite, Tailwind, and the Spotify Web API.
      </footer>
    </div>
  );
}
