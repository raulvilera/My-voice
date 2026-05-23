import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mic, BookOpen, ChevronRight, Sparkles, Star, Download, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { myVoiceData } from '../data/myvoiceData';
import styles from './Dashboard.module.css';

const capaDefault = "/my_voice_default.png";



const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [aulas, setAulas] = useState(() => {
    return myVoiceData.basico.aulas.map(a => ({
      ...a,
      id: `hc-${a.id}`,
      publicada: true,
      imagem_url: a.imagem_url || capaDefault
    }));
  });
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação');
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  useEffect(() => {
    const fetchAulas = async () => {
      try {
        const { data } = await supabase
          .from('aulas')
          .select('id, numero, titulo, subtitulo, tag, publicada, imagem_url')
          .eq('publicada', true)
          .order('numero');
        
        if (data && data.length > 0) {
          const aulasHardcoded = myVoiceData.basico.aulas.map(a => ({
            ...a,
            id: `hc-${a.id}`,
            publicada: true,
            imagem_url: a.imagem_url || capaDefault
          }));
          const numerosDB = new Set(data.map(a => a.numero));
          const filtradas = aulasHardcoded.filter(a => !numerosDB.has(a.numero));
          setAulas([...filtradas, ...data].sort((a, b) => a.numero - b.numero));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAulas();
  }, []);

  useEffect(() => {
    if (profile && profile.role === 'professor') {
      navigate('/admin', { replace: true });
    }
  }, [profile, navigate]);

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <img src="/my_voice_default.png" alt="My Voice Logo" style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '50%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {profile?.role === 'professor' && (
            <button 
              onClick={() => navigate('/admin')}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                color: '#fff',
                border: 'none',
                padding: '0.45rem 1.2rem',
                borderRadius: '20px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.88rem',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <GraduationCap size={16} /> Área da Professora
            </button>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20}/> Sair
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <header className={styles.welcomeHeader}>
          <h1 className="text-gradient">
            Olá, {profile?.name?.split(' ')[0] || 'bem-vindo'} 👋
          </h1>
          <p>Do zero à conversação real. Inglês para o seu dia a dia, trabalho e viagem.</p>
          
          {showInstallBtn && (
            <button className={styles.installAppBtn} onClick={handleInstallClick}>
              <Download size={18} /> Instalar Aplicativo My Voice
            </button>
          )}
        </header>

        <div className={styles.aulasList}>
          {aulas.map(aula => {
            const imagemUrl = aula.imagem_url || capaDefault;
            return (
              <div
                key={aula.id}
                className={`glass-panel ${styles.aulaCard}`}
                onClick={() => navigate('/trilha', { state: { aulaId: aula.id } })}
              >
                <div className={styles.aulaCardBackground} style={{ backgroundImage: `url(${imagemUrl})` }} />
                <div className={styles.aulaCardContent}>
                  <div className={styles.aulaNumero}>
                    <span>{String(aula.numero).padStart(2,'0')}</span>
                  </div>
                  <div className={styles.aulaInfo}>
                    <span className={styles.aulaTagSmall}>{aula.tag}</span>
                    <h3>{aula.titulo}</h3>
                    <p>{aula.subtitulo}</p>
                  </div>
                  <ChevronRight size={22} className={styles.aulaArrow}/>
                </div>
              </div>
            );
          })}

          {aulas.length === 0 && (
            <div className={styles.emptyState}>
              <p>Nenhuma aula disponível ainda. Volte em breve!</p>
            </div>
          )}
        </div>

        <div className={`glass-panel ${styles.motivaBox}`}>
          <Star size={18} className={styles.motivaStar}/>
          <p>"Prática com propósito. Sua voz em inglês começa aqui."</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
