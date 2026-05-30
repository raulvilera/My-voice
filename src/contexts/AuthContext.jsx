import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Recupera estado inicial instantaneamente do cache para evitar tela de loading
  const getCached = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  
  const [user, setUser]       = useState(() => getCached('myvoice_user'));
  const [profile, setProfile] = useState(() => getCached('myvoice_profile'));
  
  // Se tem usuário no cache, inicia com loading falso para renderizar a tela NA HORA
  const [loading, setLoading] = useState(() => !getCached('myvoice_user'));
  const profileFetched = useRef(false);

  // Sincroniza estado com localStorage
  const saveUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('myvoice_user', JSON.stringify(u));
    else localStorage.removeItem('myvoice_user');
  };

  const saveProfile = (p) => {
    setProfile(p);
    if (p) localStorage.setItem('myvoice_profile', JSON.stringify(p));
    else localStorage.removeItem('myvoice_profile');
  };

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        saveProfile(data);
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (normal para novo usuário)
        console.warn('Erro ao buscar perfil:', error.message);
      }
      // Se não encontrou perfil, deixa como null (novo usuário)
    } catch (e) {
      console.warn('fetchProfile erro:', e.message);
    }
    // setLoading(false) removido daqui para destravar a interface antes
  };

  useEffect(() => {
    // Timeout de segurança: máximo 8 segundos
    const safetyTimer = setTimeout(() => {
      console.warn('[Auth] Safety timeout - forçando loading=false');
      setLoading(false);
    }, 8000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      saveUser(u);
      setLoading(false); // DESTRAVA A TELA DE CARREGANDO IMEDIATAMENTE
      
      if (u && !profileFetched.current) {
        profileFetched.current = true;
        fetchProfile(u.id).finally(() => clearTimeout(safetyTimer));
      } else {
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
        saveUser(u);
        setLoading(false);
        if (u) {
          if (!profileFetched.current) {
            profileFetched.current = true;
            await fetchProfile(u.id);
          }
        } else {
          saveProfile(null);
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
      saveUser(null);
      saveProfile(null);
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
