import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X, RotateCcw, MessageCircle, BookMarked, Grid3x3, PenLine, Play, Square, Volume2, Mic, LogOut, ChevronRight, Lock } from 'lucide-react';

// ── DATA ───────────────────────────────────────────────────────────────────────
const myVoiceData = {
  basico: {
    nome: 'Inglês Básico',
    descricao: 'Do zero à conversação. Comece sua voz em inglês aqui.',
    cor: '#8b5cf6',
    aulas: [
      {
        id: 'aula1',
        numero: 1,
        titulo: 'Linda & Glynda – Aula 1',
        subtitulo: 'Verbo To Be · Vocabulário do Dia a Dia',
        tag: 'Iniciante',
        sections: [
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            personagens: ['Linda', 'Glynda'],
            falas: [
              { personagem: 'Linda',  texto: 'Hi, Glynda. How are you?' },
              { personagem: 'Glynda', texto: "Hi, Linda. I'm okay… just a little tired." },
              { personagem: 'Linda',  texto: 'I understand. I love my job, but my days are busy.' },
              { personagem: 'Glynda', texto: "I have a good job. I make a lot of money, but I'm not happy." },
              { personagem: 'Linda',  texto: 'Really? Why not?' },
              { personagem: 'Glynda', texto: "I work a lot. I don't have much time for my son." },
              { personagem: 'Linda',  texto: 'I see… I have three children, and I spend a lot of time with them.' },
              { personagem: 'Glynda', texto: 'That is very good. I have one son, and I want to spend more time with him.' },
              { personagem: 'Linda',  texto: 'Maybe you can start with small changes.' },
              { personagem: 'Glynda', texto: 'Yes… I think I need that.' },
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos do Diálogo',
            verbos: [
              { verbo: 'TO BE (ser/estar)',              presente: 'am / is / are', passado: 'was / were',  participio: 'been'  },
              { verbo: 'TO LOVE (amar)',                 presente: 'love',          passado: 'loved',       participio: 'loved' },
              { verbo: 'TO UNDERSTAND (entender)',       presente: 'understand',    passado: 'understood',  participio: 'understood' },
              { verbo: 'TO HAVE (ter)',                  presente: 'have',          passado: 'had',         participio: 'had'   },
              { verbo: 'TO SPEND (gastar/passar tempo)', presente: 'spend',         passado: 'spent',       participio: 'spent' },
              { verbo: 'TO TRY (tentar)',                presente: 'try',           passado: 'tried',       participio: 'tried' },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'teacher',       pt: 'professora' },
              { en: 'secretary',     pt: 'secretária' },
              { en: 'mother',        pt: 'mãe' },
              { en: 'son',           pt: 'filho' },
              { en: 'children',      pt: 'filhos' },
              { en: 'job',           pt: 'trabalho' },
              { en: 'busy',          pt: 'ocupada' },
              { en: 'days',          pt: 'dias' },
              { en: 'happy',         pt: 'feliz' },
              { en: 'tired',         pt: 'cansada' },
              { en: 'not happy',     pt: 'não feliz / insatisfeita' },
              { en: 'always',        pt: 'sempre' },
              { en: 'a lot',         pt: 'muito' },
              { en: 'a lot of time', pt: 'muito tempo' },
              { en: 'How are you?',  pt: 'Como você está?' },
              { en: 'I understand',  pt: 'Eu entendo' },
              { en: "That's nice",   pt: 'Que bom' },
              { en: 'Really?',       pt: 'Sério?' },
              { en: 'Why?',          pt: 'Por quê?' },
              { en: 'Thank you',     pt: 'Obrigada' },
              { en: 'I am trying',   pt: 'Eu estou tentando' },
            ]
          },
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Verbo TO BE',
            grupos: [
              {
                instrucao: 'Complete com am / is / are:',
                questoes: [
                  { pergunta: 'I ___ happy.',       resposta: 'am'  },
                  { pergunta: 'She ___ a teacher.', resposta: 'is'  },
                  { pergunta: 'They ___ tired.',    resposta: 'are' },
                  { pergunta: 'He ___ busy.',       resposta: 'is'  },
                  { pergunta: 'We ___ friends.',    resposta: 'are' },
                ]
              },
              {
                instrucao: 'Forma negativa (adicione not):',
                questoes: [
                  { pergunta: 'I am happy → I am ___ happy',       resposta: 'not' },
                  { pergunta: 'She is busy → She is ___ busy',     resposta: 'not' },
                  { pergunta: 'They are tired → They are ___ tired', resposta: 'not' },
                ]
              },
              {
                instrucao: 'Transforme em pergunta:',
                questoes: [
                  { pergunta: 'You are happy → ___ you happy?',        resposta: 'Are' },
                  { pergunta: 'She is a teacher → ___ she a teacher?', resposta: 'Is'  },
                  { pergunta: 'They are busy → ___ they busy?',        resposta: 'Are' },
                ]
              },
              {
                instrucao: 'Respostas curtas:',
                questoes: [
                  { pergunta: 'Are you tired? → Yes, I ___',      resposta: 'am'  },
                  { pergunta: 'Is she a teacher? → Yes, she ___', resposta: 'is'  },
                  { pergunta: 'Are they busy? → Yes, they ___',   resposta: 'are' },
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'aula2',
        numero: 2,
        titulo: 'Linda & Glynda – Aula 2',
        subtitulo: 'Perguntas com To Be · Família · Profissões',
        tag: 'Iniciante',
        sections: [
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            personagens: ['Linda', 'Glynda'],
            falas: [
              { personagem: 'Glynda', texto: 'Hello, Linda. You are quiet today. Are you okay?' },
              { personagem: 'Linda',  texto: 'No, I am not okay. I am sad.' },
              { personagem: 'Glynda', texto: 'Why are you sad? Is everything ok?' },
              { personagem: 'Linda',  texto: "Today is a holiday and my family is here but my father can't come." },
              { personagem: 'Glynda', texto: 'Really? Where is he?' },
              { personagem: 'Linda',  texto: 'He is in Salvador.' },
              { personagem: 'Glynda', texto: 'Why is he there?' },
              { personagem: 'Linda',  texto: 'Because he is a businessman.' },
              { personagem: 'Glynda', texto: 'What about your mother? Is she a businesswoman?' },
              { personagem: 'Linda',  texto: 'No, she is a teacher.' },
              { personagem: 'Glynda', texto: 'Is she a good teacher?' },
              { personagem: 'Linda',  texto: 'Yes, she is a very good teacher.' },
              { personagem: 'Glynda', texto: 'I have to go now. See you later. Bye, Linda.' },
              { personagem: 'Linda',  texto: 'Bye, Glynda.' },
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos da Aula',
            verbos: [
              { verbo: 'TO BE (ser/estar)',        presente: 'am / is / are', passado: 'was / were',  participio: 'been'       },
              { verbo: 'TO COME (vir)',             presente: 'come',         passado: 'came',         participio: 'come'       },
              { verbo: 'TO HAVE (ter)',             presente: 'have / has',   passado: 'had',          participio: 'had'        },
              { verbo: 'TO GO (ir)',                presente: 'go',           passado: 'went',         participio: 'gone'       },
              { verbo: 'TO SEE (ver)',              presente: 'see',          passado: 'saw',          participio: 'seen'       },
              { verbo: 'TO UNDERSTAND (entender)', presente: 'understand',   passado: 'understood',   participio: 'understood' },
              { verbo: 'TO CALL (ligar/chamar)',   presente: 'call',         passado: 'called',       participio: 'called'     },
              { verbo: 'TO WORK (trabalhar)',      presente: 'work',         passado: 'worked',       participio: 'worked'     },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'father',           pt: 'pai' },
              { en: 'mother',           pt: 'mãe' },
              { en: 'family',           pt: 'família' },
              { en: 'children',         pt: 'filhos / crianças' },
              { en: 'son',              pt: 'filho' },
              { en: 'teacher',          pt: 'professor(a)' },
              { en: 'businessman',      pt: 'homem de negócios' },
              { en: 'businesswoman',    pt: 'mulher de negócios' },
              { en: 'here',             pt: 'aqui' },
              { en: 'there',            pt: 'lá' },
              { en: 'holiday',          pt: 'feriado' },
              { en: 'sad',              pt: 'triste' },
              { en: 'happy',            pt: 'feliz' },
              { en: 'okay / ok',        pt: 'bem' },
              { en: 'busy',             pt: 'ocupado' },
              { en: 'excited',          pt: 'animado' },
              { en: 'Are you okay?',    pt: 'Você está bem?' },
              { en: 'Where is he?',     pt: 'Onde ele está?' },
              { en: 'Is he on vacation?', pt: 'Ele está de férias?' },
              { en: 'Is she a teacher?',  pt: 'Ela é professora?' },
              { en: 'Are they happy?',    pt: 'Eles estão felizes?' },
              { en: 'today',            pt: 'hoje' },
              { en: 'now',              pt: 'agora' },
              { en: 'with',             pt: 'com' },
              { en: 'without',          pt: 'sem' },
              { en: 'because',          pt: 'porque' },
              { en: 'very',             pt: 'muito' },
            ]
          },
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Perguntas com To Be',
            grupos: [
              {
                instrucao: 'Forme perguntas (troque a ordem do sujeito e verbo):',
                questoes: [
                  { pergunta: 'She is sad. → ___ she sad?',               resposta: 'Is'  },
                  { pergunta: 'He is a businessman. → ___ he a businessman?', resposta: 'Is' },
                  { pergunta: 'They are here. → ___ they here?',           resposta: 'Are' },
                  { pergunta: 'You are okay. → ___ you okay?',             resposta: 'Are' },
                  { pergunta: 'It is a holiday. → ___ it a holiday?',      resposta: 'Is'  },
                ]
              },
              {
                instrucao: 'Complete com o verbo TO BE correto:',
                questoes: [
                  { pergunta: 'My father ___ in Salvador.',        resposta: 'is'  },
                  { pergunta: 'My parents ___ happy.',             resposta: 'are' },
                  { pergunta: 'She ___ not a businesswoman.',      resposta: 'is'  },
                  { pergunta: 'I ___ not okay today.',             resposta: 'am'  },
                  { pergunta: 'Where ___ he?',                     resposta: 'is'  },
                ]
              },
              {
                instrucao: 'Resposta curta (Yes/No):',
                questoes: [
                  { pergunta: 'Is Linda sad? → Yes, ___ ___',                    resposta: 'she is'    },
                  { pergunta: 'Is her father in São Paulo? → No, ___ ___',        resposta: "he isn't"  },
                  { pergunta: 'Is her mother a teacher? → Yes, ___ ___',          resposta: 'she is'    },
                  { pergunta: 'Are they at home? → No, ___ ___',                  resposta: "they aren't" },
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

// ── SecaoDialogo ──────────────────────────────────────────────────────────────
const SecaoDialogo = ({ section }) => {
  const [isPlaying, setIsPlaying]     = useState(false);
  const [activeFala, setActiveFala]   = useState(-1);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [speed, setSpeed]             = useState(0.9);
  const [voicesReady, setVoicesReady] = useState(false);
  const cancelledRef = useRef(false);
  const timersRef    = useRef([]);

  useEffect(() => {
    const load = () => { if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const clearTimers = () => { timersRef.current.forEach(t => clearTimeout(t)); timersRef.current = []; };

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

  const estimateWordDurations = (words, rate) => {
    const BASE_CHAR_MS = 68, BASE_PAUSE = 55;
    return words.map(w => {
      const chars = w.replace(/[^a-zA-Z]/g, '').length || 1;
      return Math.round((chars * BASE_CHAR_MS + BASE_PAUSE) / rate);
    });
  };

  const stop = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    window.speechSynthesis.cancel();
    setIsPlaying(false); setActiveFala(-1); setActiveWordIdx(-1);
  }, []);

  const playAll = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); clearTimers();
    cancelledRef.current = false; setIsPlaying(true);
    let idx = 0;
    const speakNext = () => {
      if (cancelledRef.current || idx >= section.falas.length) {
        setIsPlaying(false); setActiveFala(-1); setActiveWordIdx(-1); return;
      }
      const fala  = section.falas[idx];
      const words = fala.texto.split(/\s+/);
      const durs  = estimateWordDurations(words, speed);
      setActiveFala(idx); setActiveWordIdx(-1);
      let elapsed = 80;
      words.forEach((_, wi) => {
        const t = setTimeout(() => { if (!cancelledRef.current) setActiveWordIdx(wi); }, elapsed);
        timersRef.current.push(t); elapsed += durs[wi];
      });
      const clearT = setTimeout(() => { if (!cancelledRef.current) setActiveWordIdx(-1); }, elapsed);
      timersRef.current.push(clearT);
      const utter    = new SpeechSynthesisUtterance(fala.texto);
      utter.lang     = 'en-US'; utter.rate = speed;
      utter.pitch    = fala.personagem === section.personagens[0] ? 1.1 : 0.95;
      const voice    = getVoice(fala.personagem);
      if (voice) utter.voice = voice;
      utter.onboundary = (e) => {
        if (e.name === 'word' && !cancelledRef.current) {
          const soFar = fala.texto.slice(0, e.charIndex);
          const wIdx  = soFar.trim() === '' ? 0 : soFar.trim().split(/\s+/).length;
          clearTimers(); setActiveWordIdx(wIdx);
        }
      };
      utter.onend  = () => { if (!cancelledRef.current) { clearTimers(); setActiveWordIdx(-1); idx++; setTimeout(speakNext, 350); } };
      utter.onerror = () => { if (!cancelledRef.current) { clearTimers(); idx++; speakNext(); } };
      window.speechSynthesis.speak(utter);
    };
    speakNext();
  }, [section.falas, section.personagens, speed, getVoice]);

  useEffect(() => () => { stop(); }, [stop]);

  const s = styles;
  return (
    <div style={s.sectionBlock}>
      <h3 style={s.sectionTitle}><MessageCircle size={18} style={{marginRight:6}}/>{section.titulo}</h3>
      <div style={s.audioBar}>
        <button style={{...s.playBtn, ...(isPlaying ? s.playBtnActive : {})}}
          onClick={isPlaying ? stop : playAll} disabled={!voicesReady}>
          {isPlaying ? <Square size={14}/> : <Play size={14}/>}
          <span style={{marginLeft:6}}>{isPlaying ? 'Parar' : voicesReady ? 'Ouvir Diálogo' : 'Carregando…'}</span>
        </button>
        <div style={s.speedControl}>
          <Volume2 size={13} style={{color:'#94a3b8'}}/>
          {[0.75, 0.9, 1, 1.25].map(sp => (
            <button key={sp} style={{...s.speedBtn, ...(speed===sp ? s.speedActive : {})}}
              onClick={() => { setSpeed(sp); if (isPlaying) stop(); }}>
              {sp===0.75?'0.75×':sp===0.9?'0.9×':sp===1?'1×':'1.25×'}
            </button>
          ))}
        </div>
        <span style={s.voiceInfo}>🎙 {section.personagens.join(' · ')}</span>
      </div>
      <div style={s.dialogBox}>
        {section.falas.map((fala, fi) => {
          const isA   = fala.personagem === section.personagens[0];
          const active = activeFala === fi;
          const words  = fala.texto.split(/\s+/);
          return (
            <div key={fi} style={{...s.bubble, ...(isA?s.bubbleA:s.bubbleB), ...(active?s.bubbleActiveStyle:{})}}>
              <span style={s.bubbleName}>{fala.personagem}</span>
              <p style={s.bubbleText}>
                {active
                  ? words.map((w, wi) => (
                      <span key={wi} style={{...s.word, ...(wi===activeWordIdx?s.wordActive:{})}}>{w} </span>
                    ))
                  : fala.texto}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── SecaoVerbos ───────────────────────────────────────────────────────────────
const SecaoVerbos = ({ section }) => (
  <div style={styles.sectionBlock}>
    <h3 style={styles.sectionTitle}><BookMarked size={18} style={{marginRight:6}}/>{section.titulo}</h3>
    <div style={{overflowX:'auto'}}>
      <table style={styles.verbTable}>
        <thead>
          <tr>
            {['Verbo','Presente','Passado','Particípio'].map(h => (
              <th key={h} style={styles.verbTh}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.verbos.map((v, i) => (
            <tr key={i} style={i%2===0?styles.verbRowEven:{}}>
              <td style={{...styles.verbTd, fontWeight:600, color:'#8b5cf6'}}>{v.verbo}</td>
              <td style={styles.verbTd}>{v.presente}</td>
              <td style={styles.verbTd}>{v.passado}</td>
              <td style={styles.verbTd}>{v.participio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── SecaoVocabulario ──────────────────────────────────────────────────────────
const SecaoVocabulario = ({ section }) => (
  <div style={styles.sectionBlock}>
    <h3 style={styles.sectionTitle}><Grid3x3 size={18} style={{marginRight:6}}/>{section.titulo}</h3>
    <div style={styles.vocabGrid}>
      {section.palavras.map((p, i) => (
        <div key={i} style={styles.vocabCard}>
          <span style={styles.vocabEn}>{p.en}</span>
          <span style={styles.vocabPt}>{p.pt}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── SecaoExercicios ───────────────────────────────────────────────────────────
const SecaoExercicios = ({ section }) => {
  const [respostas, setRespostas]   = useState({});
  const [resultados, setResultados] = useState({});
  const [checked, setChecked]       = useState(false);

  const handleInput = (gi, qi, val) => { setRespostas(p => ({...p,[`${gi}-${qi}`]:val})); setChecked(false); };
  const verificar = () => {
    const res = {};
    section.grupos.forEach((g, gi) => g.questoes.forEach((q, qi) => {
      res[`${gi}-${qi}`] = (respostas[`${gi}-${qi}`]||'').trim().toLowerCase() === q.resposta.toLowerCase();
    }));
    setResultados(res); setChecked(true);
  };
  const resetar = () => { setRespostas({}); setResultados({}); setChecked(false); };
  const total   = section.grupos.reduce((acc,g) => acc + g.questoes.length, 0);
  const acertos = checked ? Object.values(resultados).filter(Boolean).length : 0;

  return (
    <div style={styles.sectionBlock}>
      <h3 style={styles.sectionTitle}><PenLine size={18} style={{marginRight:6}}/>{section.titulo}</h3>
      {section.grupos.map((grupo, gi) => (
        <div key={gi} style={styles.exercGrupo}>
          <p style={styles.exercInstrucao}>{grupo.instrucao}</p>
          <div>
            {grupo.questoes.map((q, qi) => {
              const chave  = `${gi}-${qi}`;
              const status = checked ? (resultados[chave] ? 'certo' : 'errado') : '';
              return (
                <div key={qi} style={{...styles.exercItem, ...(status==='certo'?styles.exercCerto:status==='errado'?styles.exercErrado:{})}}>
                  <span style={styles.exercNum}>{qi+1}.</span>
                  <label style={styles.exercLabel}>
                    {q.pergunta.split('___').map((part, pi, arr) => (
                      <React.Fragment key={pi}>
                        {part}
                        {pi < arr.length-1 && (
                          <input type="text" style={styles.exercInput}
                            value={respostas[chave]||''} onChange={e => handleInput(gi, qi, e.target.value)} placeholder="?"/>
                        )}
                      </React.Fragment>
                    ))}
                  </label>
                  {checked && <span style={{marginLeft:8}}>{resultados[chave] ? <Check size={15} color="#10b981"/> : <X size={15} color="#ef4444"/>}</span>}
                  {checked && !resultados[chave] && <span style={styles.gabarito}>✓ {q.resposta}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {checked && (
        <div style={{...styles.scoreBox, ...(acertos===total?styles.scorePerfect:{})}}>
          {acertos===total?'🎉':acertos>=total/2?'👍':'💪'} {acertos}/{total} corretas{acertos===total&&' — Perfeito!'}
        </div>
      )}
      <div style={styles.exercBtns}>
        <button style={styles.checkBtn} onClick={verificar}><Check size={16}/><span style={{marginLeft:6}}>Verificar Respostas</span></button>
        <button style={styles.resetBtn} onClick={resetar}><RotateCcw size={16}/><span style={{marginLeft:6}}>Reiniciar</span></button>
      </div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const PILL_LABELS = {
  dialogo:     { emoji: '💬', label: 'Diálogo'    },
  verbos:      { emoji: '📘', label: 'Verbos'      },
  vocabulario: { emoji: '📖', label: 'Vocab'       },
  exercicios:  { emoji: '✏️', label: 'Exercícios' },
};

const SecaoModal = ({ aula, secType, onClose }) => {
  if (!aula || !secType) return null;
  const sec = aula.sections.find(s => s.type === secType);
  if (!sec) return null;
  const sectionsToShow = secType === 'dialogo' ? aula.sections : [sec];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <span style={styles.aulaTagSmall}>Aula {aula.numero}</span>
            <h2 style={{fontSize:'1.15rem',fontWeight:800,marginTop:4}}>{aula.titulo}</h2>
            <p style={{color:'#94a3b8',fontSize:'0.82rem',marginTop:2}}>
              {secType==='dialogo'?'💬 Diálogo completo':secType==='verbos'?'📘 Verbos':secType==='vocabulario'?'📖 Vocabulário':'✏️ Exercícios'}
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={22}/></button>
        </div>
        <div style={styles.modalBody}>
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
        <div style={styles.motivaFrase}>"Você não precisa acertar tudo. Você só precisa continuar." ✨</div>
      </div>
    </div>
  );
};

// ── Trilha (Main Page) ────────────────────────────────────────────────────────
export default function Trilha() {
  const [modal, setModal] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const curso = myVoiceData.basico;

  // Se veio do Dashboard com um aulaId, abre automaticamente o diálogo daquela aula
  useEffect(() => {
    const aulaId = location.state?.aulaId;
    if (aulaId) {
      const aula = curso.aulas.find(a => a.id === aulaId);
      if (aula) setModal({ aula, secType: 'dialogo' });
    }
  }, []);

  const openSec = (aula, secType, e) => { e.stopPropagation(); setModal({ aula, secType }); };

  return (
    <div style={styles.trilhaContainer}>
      <nav style={styles.navbar}>
        <div style={styles.logoInfo}>
          <Mic size={26} color="#8b5cf6"/>
          <h2 style={styles.logoTitle}>My Voice</h2>
        </div>
        <button style={styles.logoutBtn} onClick={() => navigate(-1)}>
          <LogOut size={18}/><span style={{marginLeft:6}}>Voltar</span>
        </button>
      </nav>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>{curso.nome}</h1>
          <p style={{color:'#94a3b8',fontSize:'0.95rem'}}>{curso.descricao}</p>
        </header>

        <div style={styles.aulasList}>
          {curso.aulas.map(aula => (
            <div key={aula.id} style={styles.aulaCard}>
              <div style={styles.aulaNumero}>
                <span>{String(aula.numero).padStart(2,'0')}</span>
              </div>
              <div style={styles.aulaInfo}>
                <span style={styles.aulaTagSmall}>{aula.tag}</span>
                <h3 style={{fontSize:'1rem',fontWeight:700,margin:'2px 0'}}>{aula.titulo}</h3>
                <p style={{fontSize:'0.82rem',color:'#94a3b8',marginBottom:8}}>{aula.subtitulo}</p>
                <div style={styles.aulaSections}>
                  {aula.sections.map((s, si) => {
                    const { emoji, label } = PILL_LABELS[s.type] || {};
                    return (
                      <button key={si} style={styles.sectionPillBtn}
                        onClick={(e) => openSec(aula, s.type, e)}>
                        {emoji} {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <ChevronRight size={20} color="#94a3b8"/>
            </div>
          ))}

          {[3,4,5].map(n => (
            <div key={n} style={{...styles.aulaCard, opacity:0.4, cursor:'not-allowed', filter:'grayscale(0.5)'}}>
              <div style={{...styles.aulaNumero, background:'rgba(255,255,255,0.08)'}}>
                <span>{String(n).padStart(2,'0')}</span>
              </div>
              <div style={styles.aulaInfo}>
                <span style={styles.aulaTagSmall}>Em breve</span>
                <h3 style={{fontSize:'1rem',fontWeight:700,margin:'2px 0'}}>Aula {n} – Linda & Glynda</h3>
                <p style={{fontSize:'0.82rem',color:'#94a3b8'}}>Conteúdo sendo preparado…</p>
              </div>
              <Lock size={18} color="#94a3b8"/>
            </div>
          ))}
        </div>
      </main>

      {modal && <SecaoModal aula={modal.aula} secType={modal.secType} onClose={() => setModal(null)}/>}
    </div>
  );
}

// ── Inline Styles (replica fiel do Trilha.module.css) ────────────────────────
const styles = {
  trilhaContainer: { minHeight:'100vh', display:'flex', flexDirection:'column',
    fontFamily:"'Outfit', system-ui, sans-serif", background:'#0f172a', color:'#f8fafc',
    backgroundImage:'radial-gradient(circle at 15% 50%, rgba(139,92,246,0.15),transparent 25%), radial-gradient(circle at 85% 30%, rgba(236,72,153,0.15),transparent 25%)' },
  navbar: { position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'1rem 2rem', background:'rgba(15,23,42,0.9)', backdropFilter:'blur(20px)',
    borderBottom:'1px solid rgba(255,255,255,0.1)' },
  logoInfo: { display:'flex', alignItems:'center', gap:'0.75rem' },
  logoTitle: { fontSize:'1.2rem', fontWeight:800, background:'linear-gradient(to right,#8b5cf6,#ec4899)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  logoutBtn: { display:'flex', alignItems:'center', color:'#94a3b8', fontSize:'0.88rem',
    padding:'0.45rem 1rem', borderRadius:9999, border:'1px solid rgba(255,255,255,0.1)',
    cursor:'pointer', background:'transparent', transition:'all 0.15s' },
  mainContent: { flex:1, padding:'2rem', maxWidth:860, margin:'0 auto', width:'100%' },
  header: { marginBottom:'2rem', textAlign:'center' },
  headerTitle: { fontSize:'1.9rem', fontWeight:800, marginBottom:'0.4rem',
    background:'linear-gradient(to right,#8b5cf6,#ec4899,#06b6d4)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  aulasList: { display:'flex', flexDirection:'column', gap:'0.875rem' },
  aulaCard: { display:'flex', alignItems:'center', gap:'1.25rem', padding:'1.25rem 1.5rem',
    background:'rgba(30,41,59,0.7)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:16, cursor:'pointer', transition:'transform 0.3s, box-shadow 0.3s' },
  aulaNumero: { minWidth:52, height:52, borderRadius:12,
    background:'linear-gradient(135deg,#8b5cf6,#ec4899)', display:'flex',
    alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:800, flexShrink:0 },
  aulaInfo: { flex:1 },
  aulaTagSmall: { fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em',
    textTransform:'uppercase', color:'#06b6d4', display:'block', marginBottom:2 },
  aulaSections: { display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:4 },
  sectionPillBtn: { fontSize:'0.7rem', padding:'0.22rem 0.65rem',
    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:9999, color:'#cbd5e1', cursor:'pointer', transition:'all 0.15s',
    display:'flex', alignItems:'center', gap:4 },

  // Modal
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
    zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center',
    padding:'1rem', overflowY:'auto' },
  modalContent: { background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:20, width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto',
    display:'flex', flexDirection:'column', marginTop:'2rem' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start',
    padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 },
  closeBtn: { background:'rgba(255,255,255,0.07)', border:'none', borderRadius:9999,
    color:'#94a3b8', cursor:'pointer', padding:'0.4rem', display:'flex', alignItems:'center' },
  modalBody: { padding:'1.25rem 1.5rem', flex:1 },
  motivaFrase: { padding:'1rem 1.5rem', textAlign:'center', fontSize:'0.8rem',
    color:'#94a3b8', fontStyle:'italic', borderTop:'1px solid rgba(255,255,255,0.06)' },

  // Section shared
  sectionBlock: { marginBottom:'1.5rem' },
  sectionTitle: { display:'flex', alignItems:'center', fontSize:'0.95rem', fontWeight:700,
    marginBottom:'0.875rem', color:'#e2e8f0' },

  // Diálogo
  audioBar: { display:'flex', flexWrap:'wrap', alignItems:'center', gap:'0.6rem',
    padding:'0.75rem 1rem', background:'rgba(139,92,246,0.08)', borderRadius:12,
    border:'1px solid rgba(139,92,246,0.2)', marginBottom:'0.875rem' },
  playBtn: { display:'flex', alignItems:'center', padding:'0.45rem 1rem', borderRadius:9999,
    background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff',
    border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, transition:'all 0.15s' },
  playBtnActive: { background:'linear-gradient(135deg,#ef4444,#f97316)' },
  speedControl: { display:'flex', alignItems:'center', gap:4 },
  speedBtn: { fontSize:'0.68rem', padding:'0.2rem 0.5rem', borderRadius:6,
    background:'transparent', border:'1px solid rgba(255,255,255,0.12)',
    color:'#94a3b8', cursor:'pointer', transition:'all 0.15s' },
  speedActive: { background:'rgba(139,92,246,0.25)', color:'#a78bfa',
    border:'1px solid rgba(139,92,246,0.4)' },
  voiceInfo: { fontSize:'0.7rem', color:'#94a3b8', marginLeft:'auto' },
  dialogBox: { display:'flex', flexDirection:'column', gap:'0.6rem' },
  bubble: { padding:'0.6rem 0.9rem', borderRadius:12, maxWidth:'82%' },
  bubbleA: { background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.25)',
    alignSelf:'flex-start', borderBottomLeftRadius:4 },
  bubbleB: { background:'rgba(236,72,153,0.12)', border:'1px solid rgba(236,72,153,0.2)',
    alignSelf:'flex-end', borderBottomRightRadius:4 },
  bubbleActiveStyle: { boxShadow:'0 0 0 2px rgba(139,92,246,0.5)' },
  bubbleName: { fontSize:'0.68rem', fontWeight:700, color:'#8b5cf6',
    textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:3 },
  bubbleText: { fontSize:'0.88rem', lineHeight:1.55, color:'#e2e8f0' },
  word: { transition:'background 0.1s', borderRadius:3, padding:'0 1px' },
  wordActive: { background:'rgba(139,92,246,0.4)', color:'#fff', fontWeight:700 },

  // Verbos
  verbTable: { width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' },
  verbTh: { textAlign:'left', padding:'0.5rem 0.75rem', background:'rgba(139,92,246,0.15)',
    color:'#a78bfa', fontWeight:700, fontSize:'0.72rem', textTransform:'uppercase',
    letterSpacing:'0.05em', borderBottom:'1px solid rgba(255,255,255,0.1)' },
  verbTd: { padding:'0.5rem 0.75rem', color:'#e2e8f0', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  verbRowEven: { background:'rgba(255,255,255,0.02)' },

  // Vocabulário
  vocabGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'0.5rem' },
  vocabCard: { padding:'0.5rem 0.75rem', background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
    display:'flex', flexDirection:'column', gap:2 },
  vocabEn: { fontSize:'0.82rem', fontWeight:700, color:'#a78bfa' },
  vocabPt: { fontSize:'0.74rem', color:'#94a3b8' },

  // Exercícios
  exercGrupo: { marginBottom:'1rem' },
  exercInstrucao: { fontSize:'0.82rem', color:'#06b6d4', fontWeight:600, marginBottom:'0.5rem' },
  exercItem: { display:'flex', alignItems:'center', flexWrap:'wrap', gap:6, padding:'0.45rem 0.6rem',
    borderRadius:8, marginBottom:4, background:'rgba(255,255,255,0.03)',
    border:'1px solid rgba(255,255,255,0.06)', fontSize:'0.84rem' },
  exercCerto: { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)' },
  exercErrado: { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)' },
  exercNum: { fontSize:'0.72rem', color:'#94a3b8', minWidth:18, fontWeight:600 },
  exercLabel: { display:'flex', flexWrap:'wrap', alignItems:'center', gap:4, flex:1, fontSize:'0.84rem' },
  exercInput: { width:72, padding:'0.2rem 0.4rem', borderRadius:6, fontSize:'0.82rem',
    background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)',
    color:'#e2e8f0', outline:'none', textAlign:'center' },
  gabarito: { fontSize:'0.72rem', color:'#10b981', fontStyle:'italic', marginLeft:4 },
  scoreBox: { margin:'0.75rem 0', padding:'0.75rem 1.25rem', borderRadius:12, textAlign:'center',
    fontWeight:700, fontSize:'0.9rem', background:'rgba(6,182,212,0.12)',
    border:'1px solid rgba(6,182,212,0.25)', color:'#06b6d4' },
  scorePerfect: { background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981' },
  exercBtns: { display:'flex', gap:'0.75rem', marginTop:'0.75rem', flexWrap:'wrap' },
  checkBtn: { display:'flex', alignItems:'center', padding:'0.55rem 1.25rem', borderRadius:9999,
    background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', border:'none',
    cursor:'pointer', fontSize:'0.82rem', fontWeight:600 },
  resetBtn: { display:'flex', alignItems:'center', padding:'0.55rem 1.25rem', borderRadius:9999,
    background:'transparent', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.12)',
    cursor:'pointer', fontSize:'0.82rem', fontWeight:600 },
};
