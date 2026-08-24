// Polyfill global and process for libraries expecting Node environment (e.g. SockJS, STOMP)
if (typeof window !== 'undefined') {
    window.global = window;
    window.process = window.process || { env: {} };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
}