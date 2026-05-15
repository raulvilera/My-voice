import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const navigate           = useNavigate();
  const { signIn, signUp, profile } = useAuth();

  const [tab, setTab]         = useState('entrar');
  const [nome, setNome]       = useState('');
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await signIn(email, senha);
      // Redirecionamento automático via AuthContext
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setErro(
        err.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : err.message || 'Erro ao fazer login. Tente novamente.'
      );
      setLoading(false);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro(''); setSucesso(''); setLoading(true);
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    try {
      await signUp(email, senha, nome);
      setSucesso('Cadastro realizado! Verifique seu e-mail para confirmar o acesso.');
      setNome(''); setEmail(''); setSenha('');
    } catch (err) {
      setErro(
        err.message?.includes('already registered')
          ? 'Este e-mail já está cadastrado.'
          : err.message || 'Erro ao cadastrar.'
      );
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
            onClick={() => { setTab('entrar'); setErro(''); setSucesso(''); }}
          >
            Entrar
          </button>
          <button
            className={`${styles.tab} ${tab === 'cadastrar' ? styles.tabActive : ''}`}
            onClick={() => { setTab('cadastrar'); setErro(''); setSucesso(''); }}
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
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(p => !p)}>
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {erro && <div className={styles.erro}><AlertCircle size={16}/> {erro}</div>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
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
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(p => !p)}>
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {erro    && <div className={styles.erro}><AlertCircle size={16}/> {erro}</div>}
            {sucesso && <div className={styles.sucesso}>{sucesso}</div>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Cadastrando…' : 'Criar Conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
