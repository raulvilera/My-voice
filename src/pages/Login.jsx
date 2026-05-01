import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Key, Mail, ArrowRight } from 'lucide-react';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulando login
    if (email && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass-panel animate-fade-in ${styles.loginBox}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <BookOpen size={40} color="var(--color-primary)" />
          </div>
          <h2>Bem-vindo ao <span className="text-gradient">EduReforço</span></h2>
          <p className={styles.subtitle}>Sua jornada de aprendizado começa aqui.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <Mail className={styles.icon} size={20} />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <Key className={styles.icon} size={20} />
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Entrar
            <ArrowRight size={20} />
          </button>
        </form>

        <div className={styles.footer}>
          <p>Ainda não tem uma conta? <a href="#" className={styles.link}>Cadastre-se</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
