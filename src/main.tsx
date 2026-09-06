import { createRoot } from 'react-dom/client';
import HomePage from './App';
import { loadFirebaseAnalytics } from './firebase';

void loadFirebaseAnalytics().catch(() => undefined);

createRoot(document.getElementById('root')!).render(<HomePage />);
