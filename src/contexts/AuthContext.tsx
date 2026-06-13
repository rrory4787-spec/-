import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';
import { getOrCreateAppUser, activateUser as dbActivate } from '../lib/db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  activate: () => Promise<void>;
  updateUserData: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create user in our custom database via the server
        try {
          const appUser = await getOrCreateAppUser(
            firebaseUser.email || '', 
            firebaseUser.displayName || 'عضو جديد'
          );
          setUser({
            ...appUser,
            // Keep Firebase UID for internal reference if needed, though email is primary key in new schema
            photoUrl: firebaseUser.photoURL || appUser.photoUrl,
          });
        } catch (error) {
          console.error("Auth synchronization error:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const activate = async () => {
    if (user?.email) {
      const updatedUser = await dbActivate(user.email);
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
    }
  };

  const updateUserData = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, activate, updateUserData }}>
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
