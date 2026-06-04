'use client'
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // ← import the initialized instance

export function useFirebaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true); // ← true until first auth check resolves

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  }, []) // auth is a stable module-level import, no need to list it

  useEffect(() => {
    // onAuthStateChanged fires immediately with the current user,
    // so the manual auth.currentUser check is redundant — removed.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  return { user, loading, logout }; // ← was missing entirely
}


