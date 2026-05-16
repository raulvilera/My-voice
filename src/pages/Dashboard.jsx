import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mic, BookOpen, ChevronRight, Sparkles, Star, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { myVoiceData } from '../data/myvoiceData';
import styles from './Dashboard.module.css';

const capaDefault = "/capa_padrao.jpg";

// ── Bandeira dos EUA SVG inline ───────────────────────────────────────────────
const BandeiraEUA = ({ size = 42 }) => (
  <svg width={size} height={size * 0.526} viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 3, display: 'block' }}>
    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
      <rect key={i} x="0" y={i * 400/13} width="760" height={400/13}
        fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'} />
    ))}
    <rect x="0" y="0" width="303" height={400 * 7/13} fill="#3C3B6E" />
    {Array.from({ length: 50 }).map((_, idx) => {
      const isOddRow = Math.floor(idx / 6) % 2 !== 0;
      const col = idx % (isOddRow ? 5 : 6);
      const cx = isOddRow ? 30 + col * 50 + 25 : 30 + col * 50;
      const cy = Math.floor(idx / (isOddRow ? 5 : 6)) * 26 + (isOddRow ? 13 : 0) + 16;
      return <polygon key={idx} points="0,-9 2.6,-4 9,-4 4,0 6,6 0,3 -6,6 -4,0 -9,-4 -2.6,-4"
        transform={`translate(${cx},${cy})`} fill="white" />;
    })}
  </svg>
);

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

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <div className={styles.logoMicWrapper}>
            <div className={styles.logoBandeira}>
              <BandeiraEUA size={42} />
            </div>
            <Mic className={styles.logoIcon} size={26}/>
          </div>
          <h2>My Voice</h2>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20}/> Sair
        </button>
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
