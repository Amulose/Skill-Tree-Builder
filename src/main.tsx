import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App, { playSound } from './App'
import './index.css'

// Track if we are already hovering over a button to prevent sound spam
let isHoveringInteractive = false;

document.addEventListener('mouseover', (e) => {
  const target = e.target as HTMLElement;
  const isInteractive = !!target.closest('button, a, input, [role="button"]');
  
  // Only play sound if we just ENTERED an interactive element from a non-interactive one
  if (isInteractive && !isHoveringInteractive) {
    playSound('hover');
    isHoveringInteractive = true;
  } else if (!isInteractive) {
    isHoveringInteractive = false;
  }
});

document.addEventListener('mousedown', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('button, a, input, [role="button"]')) {
    playSound('click');
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)