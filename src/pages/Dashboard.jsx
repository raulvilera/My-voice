
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mic, BookOpen, ChevronRight, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import capaDefault from "../assets/capa_padrao.jpg";
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAulas = async () => {
      const { data } = await supabase
        .from('aulas')
        .select('id, numero, titulo, subtitulo, tag, publicada, imagem_url')
        .eq('publicada', true)
        .order('numero');
      setAulas(data || []);
      setLoading(false);
    };
    fetchAulas();
  }, []);

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <Mic className={styles.logoIcon} size={26}/>
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
        </header>

        {loading ? (
          <p style={{textAlign:'center', color:'var(--color-text-muted)'}}>Carregando aulas…</p>
        ) : (
          <div className={styles.aulasList}>
            {aulas.map(aula => {
              const imagemUrl = aula.imagem_url || capaDefault;
              return (
                <div
                  key={aula.id}
                  className={`glass-panel ${styles.aulaCard}`}
                  onClick={() => navigate('/trilha', { state: { aulaId: aula.id } })}
                  style={{ backgroundImage: `url(${imagemUrl})` }}
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
        )}

        <div className={`glass-panel ${styles.motivaBox}`}>
          <Star size={18} className={styles.motivaStar}/>
          <p>"Prática com propósito. Sua voz em inglês começa aqui."</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard
