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
      
      if (data && !error) {
        setProfile(data);
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (normal para novo usuário)
        console.warn('Erro ao buscar perfil:', error.message);
      }
      // Se não encontrou perfil, deixa como null (novo usuário)
    } catch (e) {
      console.warn('fetchProfile erro:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Timeout de segurança: máximo 8 segundos
    const safetyTimer = setTimeout(() => {
      console.warn('[Auth] Safety timeout - forçando loading=false');
      setLoading(false);
    }, 8000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u && !profileFetched.current) {
        profileFetched.current = true;
        fetchProfile(u.id).finally(() => clearTimeout(safetyTimer));
      } else {
        setLoading(false);
        clearTimeout(safetyTimer);
      }
    }).catch(err => {
      console.error('[Auth] getSession error:', err);
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
      setUser(null);
      setProfile(null);
      profileFetched.current = false;
      setLoading(false);
      supabase.auth.signOut().catch(err => {
        console.warn('[Auth] Erro em background ao deslogar do Supabase:', err);
      });
    } catch (err) {
      console.error('[Auth] Erro ao deslogar:', err);
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
