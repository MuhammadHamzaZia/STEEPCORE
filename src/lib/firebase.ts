import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "xanthic-acumen-rcf5x",
  appId: "1:355941782705:web:f4724d42f9dea7d8e67e90",
  apiKey: "AIzaSyC6G8KnAHpvMYHcJ2z1N65waH_nUpHfBmc",
  authDomain: "xanthic-acumen-rcf5x.firebaseapp.com",
  storageBucket: "xanthic-acumen-rcf5x.firebasestorage.app",
  messagingSenderId: "355941782705"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return {
    user,
    idToken,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid
  };
}

export async function firebaseSignOut() {
  await signOut(auth);
}
