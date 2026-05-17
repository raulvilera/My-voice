import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Se usuário já está logado, redireciona
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const result = await signIn(email, senha);
      
      if (result?.user) {
        // Sucesso! Redireciona após pequeno delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 300);
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      
      const mensagem = err.message || 'Erro ao fazer login';
      if (mensagem.includes('Invalid login credentials')) {
        setErro('E-mail ou senha incorretos.');
      } else if (mensagem.includes('Email not confirmed')) {
        setErro('Por favor, confirme seu e-mail antes de fazer login.');
      } else if (mensagem.includes('User not found')) {
        setErro('Usuário não encontrado.');
      } else {
        setErro(mensagem);
      }
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp(email, senha, nome);
      
      if (result?.user) {
        setSucesso('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        setNome('');
        setEmail('');
        setSenha('');
        
        // Após 3 segundos, muda para aba de login
        setTimeout(() => {
          setTab('entrar');
          setSucesso('');
        }, 3000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      const mensagem = err.message || 'Erro ao cadastrar';
      
      if (mensagem.includes('already registered')) {
        setErro('Este e-mail já está cadastrado.');
      } else if (mensagem.includes('Password')) {
        setErro('A senha não atende aos requisitos de segurança.');
      } else {
        setErro(mensagem);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}><Mic size={32} /></div>
          <h1>My Voice</h1>
          <p>Do zero à conversação real. Inglês para o seu dia a dia, trabalho e viagem.</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'entrar' ? styles.tabActive : ''}`}
            onClick={() => {
              setTab('entrar');
              setErro('');
              setSucesso('');
            }}
            disabled={loading}
          >
            Entrar
          </button>
          <button
            className={`${styles.tab} ${tab === 'cadastrar' ? styles.tabActive : ''}`}
            onClick={() => {
              setTab('cadastrar');
              setErro('');
              setSucesso('');
            }}
            disabled={loading}
          >
            Cadastrar
          </button>
        </div>

        {tab === 'entrar' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <Mail size={18} className={styles.fieldIcon} />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <Lock size={18} className={styles.fieldIcon} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd(p => !p)}
                disabled={loading}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {erro && (
              <div className={styles.erro}>
                <AlertCircle size={16} /> {erro}
              </div>
            )}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Entrando…' : 'Entrar na Plataforma'}
            </button>
          </form>
        )}

        {tab === 'cadastrar' && (
          <form onSubmit={handleCadastro} className={styles.form}>
            <div className={styles.field}>
              <User size={18} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <Mail size={18} className={styles.fieldIcon} />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <Lock size={18} className={styles.fieldIcon} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Crie uma senha (mín. 6 caracteres)"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd(p => !p)}
                disabled={loading}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {erro && (
              <div className={styles.erro}>
                <AlertCircle size={16} /> {erro}
              </div>
            )}
            {sucesso && (
              <div className={styles.sucesso}>{sucesso}</div>
            )}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Cadastrando…' : 'Criar Conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
