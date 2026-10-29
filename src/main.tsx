import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { DebugControls } from './debug/DebugControls';
import { appLogger } from './debug/appLogger';
import { installGlobalErrorHandlers } from './debug/logger';
import './style.css';

function App() {
  useEffect(() => installGlobalErrorHandlers(appLogger), []);
  return <main>
    <p>Safety · Issue #7</p>
    <h1>Logging und Debugging</h1>
    <p>Fachliche Aktionen werden im Debug-Modus erfasst. Fehler werden immer protokolliert.</p>
    <DebugControls logger={appLogger} />
    <p>Die Diagramm-Editoren folgen in eigenen Issues.</p>
  </main>;
}

createRoot(document.getElementById('root')!, {
  onUncaughtError: (error) => appLogger.logError('react-render-failed', error),
  onCaughtError: (error) => appLogger.logError('react-boundary-caught', error),
}).render(<StrictMode><App /></StrictMode>);
