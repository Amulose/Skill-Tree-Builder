import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Gallery from './pages/Gallery';
import Viewer from './pages/Viewer';
import Editor from './pages/Editor';
import Particles from './components/Particles';
import { Network, Volume2 } from 'lucide-react';

// --- AUDIO SYSTEM ---
let audioCtx: AudioContext | null = null;

export const playSound = (type: 'hover' | 'click' | 'success') => {
  try {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.1);
      osc.frequency.setValueAtTime(659, now + 0.2);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // Ignore audio errors if the user hasn't interacted yet
  }
};

function App() {
  const [audioEnabled, setAudioEnabled] = useState(false);

  const startApp = () => {
    // Initialize audio context on user interaction
    if (!audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContext();
    }
    setAudioEnabled(true);
    playSound('success');
  };

  return (
    <div className="flex flex-col h-screen relative bg-bg">
      {/* Particles Background */}
      <Particles />

      {/* Audio Gate */}
      {!audioEnabled && (
        <div className="absolute inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-center justify-center transition-opacity duration-1000">
          <div className="bg-panel border border-border p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md text-center animate-slide-up">
            <div className="bg-accent/20 p-4 rounded-full mb-6">
              <Volume2 size={48} className="text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Skill Tree Builder</h1>
            <p className="text-textMuted mb-8 leading-relaxed">
              This experience includes premium interactive sound effects and ambient particles. Click below to enable audio.
            </p>
            <button 
              onClick={startApp}
              className="w-full bg-accent hover:bg-accentHover text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
            >
              Enter Experience
            </button>
          </div>
        </div>
      )}

      {/* Main App */}
      <div className={`flex flex-col h-screen relative z-10 transition-opacity duration-700 ${!audioEnabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <header className="h-14 border-b border-border bg-panel/80 backdrop-blur-md flex items-center px-6 shrink-0 shadow-sm z-40">
          <Link 
            to="/" 
            onClick={() => playSound('click')}
            className="flex items-center gap-2 text-accent hover:text-accentHover transition-colors font-semibold tracking-wide"
          >
            <Network size={20} />
            <span className="text-textMain">SKILL TREE BUILDER</span>
          </Link>
        </header>
        
        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/tree/:id" element={<Viewer />} />
            <Route path="/tree/:id/edit" element={<Editor />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;