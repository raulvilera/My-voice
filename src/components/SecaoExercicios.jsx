import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, RotateCcw, MessageCircle, BookMarked, Grid3x3, PenLine, Play, Square, Volume2 } from 'lucide-react';
import styles from '../pages/Trilha.module.css';

// ── Exercícios ────────────────────────────────────────────────────────────────
export const SecaoExercicios = ({ section }) => {
  const [respostas, setRespostas]   = useState({});
  const [resultados, setResultados] = useState({});
  const [checked, setChecked]       = useState(false);

  const handleInput = (gi, qi, val) => { setRespostas(prev => ({ ...prev, [`${gi}-${qi}`]: val })); setChecked(false); };
  const verificar = () => {
    const res = {};
    section.grupos.forEach((g, gi) => g.questoes.forEach((q, qi) => {
      res[`${gi}-${qi}`] = (respostas[`${gi}-${qi}`] || '').trim().toLowerCase() === q.resposta.toLowerCase();
    }));
    setResultados(res); setChecked(true);
  };
  const resetar = () => { setRespostas({}); setResultados({}); setChecked(false); };
  const total   = section.grupos.reduce((acc, g) => acc + g.questoes.length, 0);
  const acertos = checked ? Object.values(resultados).filter(Boolean).length : 0;

  return (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}><PenLine size={20}/> {section.titulo}</h3>
      {section.grupos.map((grupo, gi) => (
        <div key={gi} className={styles.exercGrupo}>
          <p className={styles.exercInstrucao}>{grupo.instrucao}</p>
          <div className={styles.exercList}>
            {grupo.questoes.map((q, qi) => {
              const chave  = `${gi}-${qi}`;
              const status = checked ? (resultados[chave] ? 'certo' : 'errado') : '';
              return (
                <div key={qi} className={`${styles.exercItem} ${styles[status]}`}>
                  <span className={styles.exercNum}>{qi + 1}.</span>
                  <label className={styles.exercLabel}>
                    {q.pergunta.split('___').map((part, pi, arr) => (
                      <React.Fragment key={pi}>
                        {part}
                        {pi < arr.length - 1 && (
                          <input type="text" className={styles.exercInput} value={respostas[chave] || ''} onChange={e => handleInput(gi, qi, e.target.value)} placeholder="?"/>
                        )}
                      </React.Fragment>
                    ))}
                  </label>
                  {checked && <span className={styles.exercIcon}>{resultados[chave] ? <Check size={16}/> : <X size={16}/>}</span>}
                  {checked && !resultados[chave] && <span className={styles.gabarito}>✓ {q.resposta}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {checked && (
        <div className={`${styles.scoreBox} ${acertos === total ? styles.scorePerfect : ''}`}>
          {acertos === total ? '🎉' : acertos >= total / 2 ? '👍' : '💪'}{' '}{acertos}/{total} corretas{acertos === total && ' — Perfeito!'}
        </div>
      )}
      <div className={styles.exercBtns}>
        <button className={`btn-primary ${styles.checkBtn}`} onClick={verificar}><Check size={18}/> Verificar Respostas</button>
        <button className={`btn-secondary ${styles.resetBtn}`} onClick={resetar}><RotateCcw size={18}/> Reiniciar</button>
      </div>
    </div>
  );
};

// ── Modal de seção individual ─────────────────────────────────────────────────
const SecaoModal = ({ aula, secType, onClose }) => {
  if (!aula || !secType) return null;
  const sec = aula.sections.find(s => s.type === secType);
  if (!sec) return null;

  // Para diálogo: mostra TODAS as seções
  const sectionsToShow = secType === 'dialogo' ? aula.sections : [sec];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.aulaTag}>Aula {aula.numero}</span>
            <h2 className={styles.modalTitleText}>{aula.titulo}</h2>
            <p className={styles.modalSubtitle}>
              {secType === 'dialogo'     ? '💬 Diálogo completo'
              : secType === 'verbos'     ? '📘 Verbos'
              : secType === 'vocabulario'? '📖 Vocabulário'
              :                           '✏️ Exercícios'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={24}/></button>
        </div>
        <div className={styles.modalBody}>
          {sectionsToShow.map((s, idx) => {
            switch (s.type) {
              case 'dialogo':     return <SecaoDialogo     key={idx} section={s}/>;
              case 'verbos':      return <SecaoVerbos      key={idx} section={s}/>;
              case 'vocabulario': return <SecaoVocabulario key={idx} section={s}/>;
              case 'exercicios':  return <SecaoExercicios  key={idx} section={s}/>;
              default: return null;
            }
          })}
        </div>
        <div className={styles.motivaFrase}>"Você não precisa acertar tudo. Você só precisa continuar." ✨</div>
      </div>
    </div>
  );
};

// ── Pill labels ───────────────────────────────────────────────────────────────
const PILL_LABELS = {
  dialogo:     { emoji: '💬', label: 'Diálogo' },
  verbos:      { emoji: '📘', label: 'Verbos' },
  vocabulario: { emoji: '📖', label: 'Vocab' },
  exercicios:  { emoji: '✏️', label: 'Exercícios' },
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Trilha = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // { aula, secType }
  const curso = myVoiceData.basico;

  const openSec = (aula, secType, e) => {
    e.stopPropagation();
    setModal({ aula, secType });
  };

  return (
    <div className={styles.trilhaContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}><Mic className={styles.logoIcon} size={28}/><h2>My Voice</h2></div>
        <button className={styles.logoutBtn} onClick={() => navigate('/dashboard')}><LogOut size={20}/> Voltar</button>
      </nav>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className="text-gradient">{curso.nome}</h1>
          <p>{curso.descricao}</p>
        </header>

        <div className={styles.aulasList}>
          {curso.aulas.map(aula => (
            <div key={aula.id} className={`glass-panel ${styles.aulaCard}`}>
              <div className={styles.aulaNumero}>
                <span>{String(aula.numero).padStart(2,'0')}</span>
              </div>
              <div className={styles.aulaInfo}>
                <span className={styles.aulaTagSmall}>{aula.tag}</span>
                <h3>{aula.titulo}</h3>
                <p>{aula.subtitulo}</p>
                <div className={styles.aulaSections}>
                  {aula.sections.map((s, si) => {
                    const { emoji, label } = PILL_LABELS[s.type] || {};
                    return (
                      <button
                        key={si}
                        className={styles.sectionPillBtn}
                        onClick={(e) => openSec(aula, s.type, e)}
                        title={`Abrir ${label}`}
                      >
                        {emoji} {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {[3,4,5].map(n => (
            <div key={n} className={`glass-panel ${styles.aulaCard} ${styles.aulaBloqueada}`}>
              <div className={`${styles.aulaNumero} ${styles.bloqueadoNum}`}><span>{String(n).padStart(2,'0')}</span></div>
              <div className={styles.aulaInfo}>
                <span className={styles.aulaTagSmall}>Em breve</span>
                <h3>Aula {n} – Linda & Glynda</h3>
                <p>Conteúdo sendo preparado…</p>
              </div>
              <span className={styles.lockIcon}>🔒</span>
            </div>
          ))}
        </div>
      </main>

      {modal && <SecaoModal aula={modal.aula} secType={modal.secType} onClose={() => setModal(null)}/>}
    </div>
  );
};

export default Trilha;
