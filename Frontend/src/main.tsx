// Polyfill global and process for libraries expecting Node environment (e.g. SockJS, STOMP)
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).process = (window as any).process || { env: {} };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
