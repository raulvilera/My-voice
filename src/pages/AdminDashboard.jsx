import { useState, useEffect, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Mic, LogOut, Users, ToggleLeft, ToggleRight, Search,
  Plus, Eye, X, Upload, FileText, Loader2,
  MessageCircle, BookMarked, Grid3x3, PenLine, GraduationCap,
  CreditCard, Crown, Zap, Bot, Video,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminDashboard.module.css';

// Lazy loading do componente de gravação
const GravacaoAula = lazy(() => import('../components/GravacaoAula'));

const PreviewAulas = () => {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('aulas')
        .select('*, secoes(*)')
        .order('numero', { ascending: true });
      
      if (!error) setAulas(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className={styles.loadingMsg}>Carregando aulas…</p>;

  return (
    <div className={styles.previewContainer}>
      {aulas.map(aula => (
        <div key={aula.id} className={`glass-panel ${styles.aulaCard}`}>
          <div className={styles.aulaCardHeader}>
            <div className={styles.aulaNumero}>{String(aula.numero).padStart(2, '0')}</div>
            <div className={styles.aulaInfo}>
              <span className={`${styles.statusBadge} ${aula.publicada ? styles.ativo : styles.bloqueado}`}>
                {aula.publicada ? 'Publicada' : 'Rascunho'}
              </span>
              <h3>{aula.titulo}</h3>
              <p>{aula.subtitulo}</p>
            </div>
            <button className={styles.previewBtn} onClick={() => {}}>
              <Eye size={15}/> <span>Ver tudo</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ... Restante do código de UploadDocumento e AdminDashboard original preservado ...
// (Recomendo usar o arquivo original e apenas substituir o useEffect do PreviewAulas conforme acima)
