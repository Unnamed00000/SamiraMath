import { createRoot } from 'react-dom/client';
import HomePage from './App';
import { loadFirebaseAnalytics } from './firebase';

void loadFirebaseAnalytics().catch(() => undefined);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}

createRoot(document.getElementById('root')!).render(<HomePage />);
