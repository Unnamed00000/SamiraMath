import { getAnalytics, isSupported } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase-config';

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export async function loadFirebaseAnalytics() {
  if (typeof window === 'undefined') return null;
  if (!(await isSupported())) return null;
  return getAnalytics(firebaseApp);
}
