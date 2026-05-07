import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, ChevronDown, ChevronUp, MessageCircle, BookMarked, Grid3x3, PenLine, Check, X, RotateCcw, ChevronRight, Mic } from 'lucide-react';
import { myVoiceData } from '../data/myvoiceData';
import styles from './Trilha.module.css';

// ── Diálogo ──────────────────────────────────────────────────────────────────
const SecaoDialogo = ({ section }) => (
  <div className={styles.sectionBlock}>
    <h3 className={styles.sectionTitle}>
      <MessageCircle size={20} /> {section.titulo}
    </h3>
    <div className={styles.dialogBox}>
      {section.falas.map((fala, i) => {
        const isA = fala.personagem === section.personagens[0];
        return (
          <div key={i} className={`${styles.bubble} ${isA ? styles.bubbleA : styles.bubbleB}`}>
            <span className={styles.bubbleName}>{fala.personagem}</span>
            <p>{fala.texto}</p>
          </div>
        );
      })}
    </div>
  </div>
);

// ── Verbos ────────────────────────────────────────────────────────────────────
const SecaoVerbos = ({ section }) => (
  <div className={styles.sectionBlock}>
    <h3 className={styles.sectionTitle}>
      <BookMarked size={20} /> {section.titulo}
    </h3>
    <div className={styles.tableWrapper}>
      <table className={styles.verbTable}>
        <thead>
          <tr>
            <th>Verbo</th>
            <th>Presente</th>
            <th>Passado</th>
            <th>Particípio</th>
          </tr>
        </thead>
        <tbody>
          {section.verbos.map((v, i) => (
            <tr key={i}>
              <td className={styles.verbName}>{v.verbo}</td>
              <td><span className={styles.verbForm}>{v.presente}</span></td>
              <td><span className={styles.verbForm}>{v.passado}</span></td>
              <td><span className={styles.verbForm}>{v.participio}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── Vocabulário ───────────────────────────────────────────────────────────────
const SecaoVocabulario = ({ section }) => {
  const [revealed, setRevealed] = useState({});
  const toggleReveal = (i) => setRevealed(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <Grid3x3 size={20} /> {section.titulo}
        <span className={styles.hint}>Clique para ver a tradução</span>
      </h3>
      <div className={styles.vocabGrid}>
        {section.palavras.map((p, i) => (
          <div
            key={i}
            className={`${styles.vocabCard} ${revealed[i] ? styles.vocabRevealed : ''}`}
            onClick={() => toggleReveal(i)}
          >
            <span className={styles.vocabEn}>{p.en}</span>
            <span className={styles.vocabPt}>{revealed[i] ? p.pt : '···'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Exercícios ────────────────────────────────────────────────────────────────
const SecaoExercicios = ({ section }) => {
  const [respostas, setRespostas] = useState({});
  const [resultados, setResultados] = useState({});
  const [checked, setChecked] = useState(false);

  const handleInput = (grupoIdx, questaoIdx, val) => {
    setRespostas(prev => ({ ...prev, [`${grupoIdx}-${questaoIdx}`]: val }));
    setChecked(false);
  };

  const verificar = () => {
    const res = {};
    section.grupos.forEach((grupo, gi) => {
      grupo.questoes.forEach((q, qi) => {
        const chave = `${gi}-${qi}`;
        const resposta = (respostas[chave] || '').trim().toLowerCase();
        res[chave] = resposta === q.resposta.toLowerCase();
      });
    });
    setResultados(res);
    setChecked(true);
  };

  const resetar = () => {
    setRespostas({});
    setResultados({});
    setChecked(false);
  };

  const total = section.grupos.reduce((acc, g) => acc + g.questoes.length, 0);
  const acertos = checked ? Object.values(resultados).filter(Boolean).length : 0;

  return (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <PenLine size={20} /> {section.titulo}
      </h3>

      {section.grupos.map((grupo, gi) => (
        <div key={gi} className={styles.exercGrupo}>
          <p className={styles.exercInstrucao}>{grupo.instrucao}</p>
          <div className={styles.exercList}>
            {grupo.questoes.map((q, qi) => {
              const chave = `${gi}-${qi}`;
              const status = checked ? (resultados[chave] ? 'certo' : 'errado') : '';
              return (
                <div key={qi} className={`${styles.exercItem} ${styles[status]}`}>
                  <span className={styles.exercNum}>{qi + 1}.</span>
                  <label className={styles.exercLabel}>
                    {q.pergunta.split('___').map((part, pi, arr) => (
                      <React.Fragment key={pi}>
                        {part}
                        {pi < arr.length - 1 && (
                          <input
                            type="text"
                            className={styles.exercInput}
                            value={respostas[chave] || ''}
                            onChange={e => handleInput(gi, qi, e.target.value)}
                            placeholder="?"
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </label>
                  {checked && (
                    <span className={styles.exercIcon}>
                      {resultados[chave] ? <Check size={16} /> : <X size={16} />}
                    </span>
                  )}
                  {checked && !resultados[chave] && (
                    <span className={styles.gabarito}>✓ {q.resposta}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {checked && (
        <div className={`${styles.scoreBox} ${acertos === total ? styles.scorePerfect : ''}`}>
          {acertos === total ? '🎉' : acertos >= total / 2 ? '👍' : '💪'}
          {' '}{acertos}/{total} corretas
          {acertos === total && ' — Perfeito!'}
        </div>
      )}

      <div className={styles.exercBtns}>
        <button className={`btn-primary ${styles.checkBtn}`} onClick={verificar}>
          <Check size={18} /> Verificar Respostas
        </button>
        <button className={`btn-secondary ${styles.resetBtn}`} onClick={resetar}>
          <RotateCcw size={18} /> Reiniciar
        </button>
      </div>
    </div>
  );
};

// ── Aula Modal / Drawer ───────────────────────────────────────────────────────
const AulaViewer = ({ aula, onClose }) => {
  if (!aula) return null;

  const renderSection = (sec, idx) => {
    switch (sec.type) {
      case 'dialogo':    return <SecaoDialogo    key={idx} section={sec} />;
      case 'verbos':     return <SecaoVerbos     key={idx} section={sec} />;
      case 'vocabulario': return <SecaoVocabulario key={idx} section={sec} />;
      case 'exercicios': return <SecaoExercicios  key={idx} section={sec} />;
      default: return null;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.aulaTag}>Aula {aula.numero}</span>
            <h2 className={styles.modalTitleText}>{aula.titulo}</h2>
            <p className={styles.modalSubtitle}>{aula.subtitulo}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>

        <div className={styles.modalBody}>
          {aula.sections.map((sec, idx) => renderSection(sec, idx))}
        </div>

        <div className={styles.motivaFrase}>
          "Você não precisa acertar tudo. Você só precisa continuar." ✨
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Trilha = () => {
  const navigate = useNavigate();
  const [aulaSelecionada, setAulaSelecionada] = useState(null);

  const curso = myVoiceData.basico;

  return (
    <div className={styles.trilhaContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <Mic className={styles.logoIcon} size={28} />
          <h2>My Voice</h2>
        </div>
        <button className={styles.logoutBtn} onClick={() => navigate('/dashboard')}>
          <LogOut size={20} />
          Voltar
        </button>
      </nav>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className="text-gradient">{curso.nome}</h1>
          <p>{curso.descricao}</p>
        </header>

        <div className={styles.aulasList}>
          {curso.aulas.map((aula, idx) => (
            <div
              key={aula.id}
              className={`glass-panel ${styles.aulaCard}`}
              onClick={() => setAulaSelecionada(aula)}
            >
              <div className={styles.aulaNumero}>
                <span>{String(aula.numero).padStart(2, '0')}</span>
              </div>
              <div className={styles.aulaInfo}>
                <span className={styles.aulaTagSmall}>{aula.tag}</span>
                <h3>{aula.titulo}</h3>
                <p>{aula.subtitulo}</p>
                <div className={styles.aulaSections}>
                  {aula.sections.map((s, si) => (
                    <span key={si} className={styles.sectionPill}>
                      {s.type === 'dialogo' ? '💬 Diálogo'
                        : s.type === 'verbos' ? '📘 Verbos'
                        : s.type === 'vocabulario' ? '📖 Vocab'
                        : '✏️ Exercícios'}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={24} className={styles.aulaArrow} />
            </div>
          ))}

          {/* Próximas aulas (placeholder) */}
          {[3, 4, 5].map(n => (
            <div key={n} className={`glass-panel ${styles.aulaCard} ${styles.aulaBloqueada}`}>
              <div className={`${styles.aulaNumero} ${styles.bloqueadoNum}`}>
                <span>{String(n).padStart(2, '0')}</span>
              </div>
              <div className={styles.aulaInfo}>
                <span className={styles.aulaTagSmall}>Em breve</span>
                <h3>Aula {n} – Linda & Glinda</h3>
                <p>Conteúdo sendo preparado…</p>
              </div>
              <span className={styles.lockIcon}>🔒</span>
            </div>
          ))}
        </div>
      </main>

      <AulaViewer aula={aulaSelecionada} onClose={() => setAulaSelecionada(null)} />
    </div>
  );
};

export default Trilha;
