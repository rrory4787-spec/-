import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// We will use a safe way to check for the config
import firebaseConfigData from '@/firebase-applet-config.json';

const firebaseConfig = firebaseConfigData || {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app); // Disabled to prevent client-side "Permission Denied" errors
export const auth = getAuth(app);
