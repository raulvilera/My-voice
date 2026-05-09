import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Mic, X, MessageCircle, BookMarked, Grid3x3, PenLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { SecaoDialogo }     from '../components/SecaoDialogo';
import { SecaoVerbos }      from '../components/SecaoVerbos';
import { SecaoVocabulario } from '../components/SecaoVocabulario';
import { SecaoExercicios }  from '../components/SecaoExercicios';
import styles from './Trilha.module.css';

const PILL_LABELS = {
  dialogo:     { emoji: '💬', label: 'Diálogo' },
  verbos:      { emoji: '📘', label: 'Verbos' },
  vocabulario: { emoji: '📖', label: 'Vocab' },
  exercicios:  { emoji: '✏️', label: 'Exercícios' },
};

// ── Modal de seção ────────────────────────────────────────────────────────────
const SecaoModal = ({ aula, secType, onClose }) => {
  if (!aula || !secType) return null;
  const secoes = (aula.secoes || []).sort((a, b) => a.ordem - b.ordem);
  const sectionsToShow = secType === 'dialogo' ? secoes : secoes.filter(s => s.tipo === secType);

  const renderSecao = (sec, idx) => {
    const dados = { ...sec.conteudo, titulo: sec.titulo };
    switch (sec.tipo) {
      case 'dialogo':     return <SecaoDialogo     key={idx} section={dados}/>;
      case 'verbos':      return <SecaoVerbos      key={idx} section={dados}/>;
      case 'vocabulario': return <SecaoVocabulario key={idx} section={dados}/>;
      case 'exercicios':  return <SecaoExercicios  key={idx} section={dados}/>;
      default: return null;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.aulaTag}>Aula {aula.numero}</span>
            <h2 className={styles.modalTitleText}>{aula.titulo}</h2>
            <p className={styles.modalSubtitle}>{aula.subtitulo}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={24}/></button>
        </div>
        <div className={styles.modalBody}>
          {sectionsToShow.map((sec, idx) => renderSecao(sec, idx))}
        </div>
        <div className={styles.motivaFrase}>"Você não precisa acertar tudo. Você só precisa continuar." ✨</div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Trilha = ({ modoVisualizacao = false }) => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { signOut } = useAuth();
  const [aulas, setAulas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);

  useEffect(() => {
    const fetchAulas = async () => {
      const { data } = await supabase
        .from('aulas')
        .select('*, secoes(*)')
        .eq('publicada', true)
        .order('numero');
      setAulas(data || []);
      setLoading(false);

      if (location.state?.aulaId && data) {
        const aula = data.find(a => a.id === location.state.aulaId);
        if (aula) setModal({ aula, secType: 'dialogo' });
      }
    };
    fetchAulas();
  }, []);

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const openSec = (aula, secType, e) => {
    e.stopPropagation();
    setModal({ aula, secType });
  };

  return (
    <div className={styles.trilhaContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <Mic className={styles.logoIcon} size={28}/>
          <h2>My Voice</h2>
        </div>
        {/* Botão Sair só aparece para aluno real, não no modo visualização */}
        {!modoVisualizacao && (
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20}/> Sair
          </button>
        )}
      </nav>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className="text-gradient">Inglês Básico</h1>
          <p>Do zero à conversação real. Comece sua voz em inglês aqui.</p>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Carregando aulas…</p>
        ) : aulas.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
            Nenhuma aula publicada ainda.
          </p>
        ) : (
          <div className={styles.aulasList}>
            {aulas.map(aula => {
              const secoes = (aula.secoes || []).sort((a, b) => a.ordem - b.ordem);
              return (
                <div key={aula.id} className={`glass-panel ${styles.aulaCard}`}>
                  <div className={styles.aulaNumero}>
                    <span>{String(aula.numero).padStart(2, '0')}</span>
                  </div>
                  <div className={styles.aulaInfo}>
                    <span className={styles.aulaTagSmall}>{aula.tag}</span>
                    <h3>{aula.titulo}</h3>
                    <p>{aula.subtitulo}</p>
                    <div className={styles.aulaSections}>
                      {secoes.map((s, si) => {
                        const pill = PILL_LABELS[s.tipo];
                        return pill ? (
                          <button
                            key={si}
                            className={styles.sectionPillBtn}
                            onClick={e => openSec(aula, s.tipo, e)}
                          >
                            {pill.emoji} {pill.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modal && (
        <SecaoModal
          aula={modal.aula}
          secType={modal.secType}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default Trilha;
