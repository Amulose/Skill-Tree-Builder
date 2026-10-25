import { Routes, Route, Link } from 'react-router-dom';
import Gallery from './pages/Gallery';
import Viewer from './pages/Viewer';
import Editor from './pages/Editor';
import { Network } from 'lucide-react';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <header className="h-14 border-b border-border bg-panel flex items-center px-6 shrink-0">
        <Link to="/" className="flex items-center gap-2 text-accent hover:text-accentHover transition-colors font-semibold tracking-wide">
          <Network size={20} />
          <span>SKILL TREE BUILDER</span>
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
  );
}

export default App;