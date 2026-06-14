import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';
import { getOrCreateAppUser, activateUser as dbActivate } from '../lib/db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleAccessToken: string | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  activate: () => Promise<void>;
  updateUserData: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Globals to store the access token in memory across hot-reloads and module boundaries
let cachedAccessToken: string | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('khazain_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(cachedAccessToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await getOrCreateAppUser(
            firebaseUser.email || '', 
            firebaseUser.displayName || 'عضو جديد'
          );
          const fullUser = {
            ...appUser,
            photoUrl: firebaseUser.photoURL || appUser.photoUrl,
          };
          setUser(fullUser);
          localStorage.setItem('khazain_user', JSON.stringify(fullUser));
        } catch (error) {
          console.error("Auth synchronization error:", error);
        }
      } else {
        // Fallback to local session if present, otherwise null
        try {
          const saved = localStorage.getItem('khazain_user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
        cachedAccessToken = null;
        setGoogleAccessToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    // Add scopes requested by the user for Google Drive backup
    provider.addScope('https://www.googleapis.com/auth/drive');
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setGoogleAccessToken(credential.accessToken);
      }
    } catch (e) {
      console.error("Google Sign In with Popup error:", e);
      throw e;
    }
  };

  const loginWithEmail = async (email: string, name: string) => {
    setLoading(true);
    try {
      const appUser = await getOrCreateAppUser(email, name);
      setUser(appUser);
      localStorage.setItem('khazain_user', JSON.stringify(appUser));
    } catch (error) {
      console.error("Email login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('khazain_user');
    setUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const activate = async () => {
    if (user?.email) {
      const updatedUser = await dbActivate(user.email);
      const merged = { ...user, ...updatedUser };
      setUser(merged);
      localStorage.setItem('khazain_user', JSON.stringify(merged));
    }
  };

  const updateUserData = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('khazain_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, googleAccessToken, login, loginWithEmail, logout, activate, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

