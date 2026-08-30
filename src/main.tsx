import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import PublicPortfolio from './pages/PublicPortfolio.tsx';
import CustomCursor from './components/CustomCursor.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import * as Sentry from "@sentry/react";
import { registerSW } from 'virtual:pwa-register';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN_REACT,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const isPublicPortfolio = window.location.pathname.startsWith('/p/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {isPublicPortfolio ? (
        <PublicPortfolio />
      ) : (
        <AppProvider>
          <SocketProvider>
            <CustomCursor />
            <App />
          </SocketProvider>
        </AppProvider>
      )}
    </ThemeProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
