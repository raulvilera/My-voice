import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileFetched = useRef(false);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data && !error) setProfile(data);
    } catch (e) {
      console.warn('fetchProfile erro:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Segurança absoluta: nunca trava mais de 5s
    const safetyTimer = setTimeout(() => {
      console.warn('[Auth] Safety timeout atingido — forçando loading=false');
      setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id).finally(() => clearTimeout(safetyTimer));
      } else {
        setLoading(false);
        clearTimeout(safetyTimer);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          // Evita busca duplicada se já buscou
          if (!profileFetched.current) {
            profileFetched.current = true;
            await fetchProfile(u.id);
          }
        } else {
          setProfile(null);
          setLoading(false);
          profileFetched.current = false;
        }
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    profileFetched.current = false;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Busca o profile imediatamente para ter role disponível
    if (data?.user?.id) {
      await fetchProfile(data.user.id);
      profileFetched.current = true;
    }
    return data;
  };

  const signUp = async (email, password, nome) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, role: 'aluno' } },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    profileFetched.current = false;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
