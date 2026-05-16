import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('mv_profile');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const profileFetched = useRef(false);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setProfile(data);
        localStorage.setItem('mv_profile', JSON.stringify(data));
      } else if (error && error.code !== 'PGRST116') {
        console.warn('Erro ao buscar perfil:', error.message);
      }
    } catch (e) {
      console.warn('fetchProfile erro:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Timeout de segurança reduzido para 5s
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        // Se já temos cache, podemos liberar o loading mais cedo
        if (profile) setLoading(false);
        if (!profileFetched.current) {
          profileFetched.current = true;
          fetchProfile(u.id).finally(() => clearTimeout(safetyTimer));
        }
      } else {
        setLoading(false);
        clearTimeout(safetyTimer);
      }
    }).catch(err => {
      setLoading(false);
      clearTimeout(safetyTimer);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          if (!profileFetched.current) {
            profileFetched.current = true;
            await fetchProfile(u.id);
          }
        } else {
          setProfile(null);
          localStorage.removeItem('mv_profile');
          setLoading(false);
          profileFetched.current = false;
        }
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      profileFetched.current = false;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw new Error(error.message || 'Erro ao fazer login');
      }

      // Busca o perfil imediatamente
      if (data?.user?.id) {
        profileFetched.current = true;
        await fetchProfile(data.user.id);
      }

      return data;
    } catch (err) {
      console.error('[Auth] signIn error:', err);
      throw err;
    }
  };

  const signUp = async (email, password, nome) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome, role: 'aluno' } },
      });
      
      if (error) {
        throw new Error(error.message || 'Erro ao cadastrar');
      }

      return data;
    } catch (err) {
      console.error('[Auth] signUp error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth] signOut error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      profileFetched.current = false;
      setLoading(false);
    }
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
