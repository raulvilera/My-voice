import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle, BookMarked, Grid3x3, PenLine, Check, X, RotateCcw, ChevronRight, Mic, Play, Square, Volume2, ArrowLeft } from 'lucide-react';
import { myVoiceData } from '../data/myvoiceData';
import styles from './Trilha.module.css';

// ── Diálogo com Áudio + Destaque Sincronizado ─────────────────────────────────
const SecaoDialogo = ({ section }) => {
  const [isPlaying, setIsPlaying]         = useState(false);
  const [activeFala, setActiveFala]       = useState(-1);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [speed, setSpeed]                 = useState(0.9);
  const [voicesReady, setVoicesReady]     = useState(false);
  const cancelledRef  = useRef(false);
  const timersRef     = useRef([]);

  // Carrega vozes
  useEffect(() => {
    const load = () => { if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Limpa todos os timers ativos
  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  // Escolhe voz por personagem
  const getVoice = useCallback((personagem) => {
    const voices   = window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    if (!enVoices.length) return null;
    const isFirst   = personagem === section.personagens[0];
    const preferred = isFirst
      ? ['Samantha','Karen','Victoria','Moira','Tessa','Zoe']
      : ['Daniel','Alex','Fred','Fiona','Serena','Rishi'];
    for (const name of preferred) {
      const v = enVoices.find(v => v.name.includes(name));
      if (v) return v;
    }
    return enVoices[isFirst ? 0 : Math.min(1, enVoices.length - 1)];
  }, [section.personagens]);

  // Estima duração de cada palavra em ms baseado nos caracteres e velocidade
  const estimateWordDurations = (words, rate) => {
    // Média: ~120ms por caractere a velocidade 1x, ajustado pelo rate
    // Palavras curtas têm um mínimo de pausa
    const BASE_CHAR_MS = 68;
    const BASE_PAUSE   = 55; // pausa entre palavras
    return words.map(w => {
      const chars = w.replace(/[^a-zA-Z]/g, '').length || 1;
      return Math.round((chars * BASE_CHAR_MS + BASE_PAUSE) / rate);
    });
  };

  const stop = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setActiveFala(-1);
    setActiveWordIdx(-1);
  }, []);

  const playAll = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    clearTimers();
    cancelledRef.current = false;
    setIsPlaying(true);

    let idx = 0;

    const speakNext = () => {
      if (cancelledRef.current || idx >= section.falas.length) {
        setIsPlaying(false);
        setActiveFala(-1);
        setActiveWordIdx(-1);
        return;
      }

      const fala  = section.falas[idx];
      const words = fala.texto.split(/\s+/);
      const durs  = estimateWordDurations(words, speed);

      setActiveFala(idx);
      setActiveWordIdx(-1);

      // Agenda o destaque de cada palavra via setTimeout
      let elapsed = 80; // pequeno delay inicial para sincronia
      words.forEach((_, wi) => {
        const t = setTimeout(() => {
          if (!cancelledRef.current) setActiveWordIdx(wi);
        }, elapsed);
        timersRef.current.push(t);
        elapsed += durs[wi];
      });

      // Limpa destaque ao fim da fala
      const clearT = setTimeout(() => {
        if (!cancelledRef.current) setActiveWordIdx(-1);
      }, elapsed);
      timersRef.current.push(clearT);

      // SpeechSynthesis
      const utter    = new SpeechSynthesisUtterance(fala.texto);
      utter.lang     = 'en-US';
      utter.rate     = speed;
      utter.pitch    = fala.personagem === section.personagens[0] ? 1.1 : 0.95;
      const voice    = getVoice(fala.personagem);
      if (voice) utter.voice = voice;

      // Usa onboundary quando disponível (desktop Chrome/Edge) para recalibrar
      utter.onboundary = (e) => {
        if (e.name === 'word' && !cancelledRef.current) {
          const soFar = fala.texto.slice(0, e.charIndex);
          const wIdx  = soFar.trim() === '' ? 0 : soFar.trim().split(/\s+/).length;
          // Recalibra: cancela timers futuros e usa posição real
          clearTimers();
          setActiveWordIdx(wIdx);
        }
      };

      utter.onend = () => {
        if (!cancelledRef.current) {
          clearTimers();
          setActiveWordIdx(-1);
          idx++;
          setTimeout(speakNext, 350);
        }
      };

      utter.onerror = () => {
        if (!cancelledRef.current) {
          clearTimers();
          idx++;
          speakNext();
        }
      };

      window.speechSynthesis.speak(utter);
    };

    speakNext();
  }, [section.falas, section.personagens, speed, getVoice]);

  // Para ao desmontar
  useEffect(() => () => { stop(); }, [stop]);

  return (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}><MessageCircle size={20}/> {section.titulo}</h3>

      <div className={styles.audioBar}>
        <button
          className={`${styles.playBtn} ${isPlaying ? styles.playBtnActive : ''}`}
          onClick={isPlaying ? stop : playAll}
          disabled={!voicesReady}
        >
          {isPlaying ? <Square size={16}/> : <Play size={16}/>}
          {isPlaying ? 'Parar' : voicesReady ? 'Ouvir Diálogo' : 'Carregando…'}
        </button>

        <div className={styles.speedControl}>
          <Volume2 size={14}/>
          {[0.75, 0.9, 1, 1.25].map(s => (
            <button
              key={s}
              className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ''}`}
              onClick={() => { setSpeed(s); if (isPlaying) stop(); }}
            >
              {s === 0.75 ? '0.75×' : s === 0.9 ? '0.9×' : s === 1 ? '1×' : '1.25×'}
            </button>
          ))}
        </div>
        <span className={styles.voiceInfo}>🎙 {section.personagens.join(' · ')}</span>
      </div>

      <div className={styles.dialogBox}>
        {section.falas.map((fala, fi) => {
          const isA   = fala.personagem === section.personagens[0];
          const active = activeFala === fi;
          const words  = fala.texto.split(/\s+/);
          return (
            <div key={fi} className={`${styles.bubble} ${isA ? styles.bubbleA : styles.bubbleB} ${active ? styles.bubbleActive : ''}`}>
              <span className={styles.bubbleName}>{fala.personagem}</span>
              <p className={styles.bubbleText}>
                {active
                  ? words.map((w, wi) => (
                      <span key={wi} className={`${styles.word} ${wi === activeWordIdx ? styles.wordActive : ''}`}>
                        {w}{' '}
                      </span>
                    ))
                  : fala.texto
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ── Verbos ────────────────────────────────────────────────────────────────────
const SecaoVerbos = ({ section }) => (
  <div className={styles.sectionBlock}>
    <h3 className={styles.sectionTitle}><BookMarked size={20}/> {section.titulo}</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.verbTable}>
        <thead><tr><th>Verbo</th><th>Presente</th><th>Passado</th><th>Particípio</th></tr></thead>
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
  return (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <Grid3x3 size={20}/> {section.titulo}
        <span className={styles.hint}>Clique para ver a tradução</span>
      </h3>
      <div className={styles.vocabGrid}>
        {section.palavras.map((p, i) => (
          <div key={i} className={`${styles.vocabCard} ${revealed[i] ? styles.vocabRevealed : ''}`} onClick={() => setRevealed(prev => ({ ...prev, [i]: !prev[i] }))}>
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
                <h3>Aula {n} – Linda & Glinda</h3>
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
