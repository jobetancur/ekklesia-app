import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          // Sincronización con Supabase
          // Buscamos el perfil usando el firebase_id
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('firebase_id', firebaseUser.uid)
            .maybeSingle();

          if (profileError) {
            throw profileError;
          }

          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error en sincronización de Auth:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
