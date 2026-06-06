import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Check, X, RotateCcw, MessageCircle, BookMarked, Grid3x3, PenLine, Play, Square, Volume2, Mic, LogOut, ChevronRight, Lock } from 'lucide-react';
import { SecaoDialogo }     from '../components/SecaoDialogo';
import { SecaoVerbos }      from '../components/SecaoVerbos';
import { SecaoVocabulario } from '../components/SecaoVocabulario';
import { SecaoExercicios }  from '../components/SecaoExercicios';
import { supabase }         from '../lib/supabaseClient';
import './Trilha.css';

// ── DATA ───────────────────────────────────────────────────────────────────────
const myVoiceData = {
  basico: {
    nome: 'Inglês Básico',
    descricao: 'Dallas & Susie – Sentimentos, Verbos e Família',
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
      },
      {
        id: 'aula3',
        numero: 3,
        titulo: 'Dallas & Susie – Aula 1',
        subtitulo: 'Sentimentos, Verbos e Família',
        tag: 'Novo',
        sections: [
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            personagens: ['Dallas', 'Susie'],
            falas: [
              { personagem: 'Dallas', texto: 'Hi Susie! How are you today?' },
              { personagem: 'Susie', texto: 'Hi Dallas. I am good, thank you. And you?' },
              { personagem: 'Dallas', texto: 'I am very happy today. My family is coming to visit.' },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'family', pt: 'família' },
              { en: 'happy', pt: 'feliz' },
              { en: 'visit', pt: 'visitar' }
            ]
          }
        ]
      }
    ]
  }
};

// ── Pílulas de seção ──────────────────────────────────────────────────────────
const PILL_LABELS = {
  dialogo:     { emoji: '💬', label: 'Diálogo'    },
  verbos:      { emoji: '📘', label: 'Verbos'      },
  vocabulario: { emoji: '📖', label: 'Vocab'       },
  exercicios:  { emoji: '✏️', label: 'Exercícios' },
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const SecaoModal = ({ aula, secType, onClose }) => {
  if (!aula || !secType) return null;
  
  const sections = aula.sections || aula.secoes || [];
  
  let sectionsToShow = [];
  if (secType === 'tudo') {
    sectionsToShow = [...sections].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  } else {
    const sec = sections.find(s => (s.type || s.tipo) === secType);
    if (!sec) return null;
    sectionsToShow = [sec];
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-aula-tag">Aula {aula.numero}</span>
            <h2 className="modal-title">{aula.titulo}</h2>
            <p className="modal-sec-label">
              {secType === 'tudo' ? '📋 Material completo' : secType==='dialogo'?'💬 Diálogo':secType==='verbos'?'📘 Verbos':secType==='vocabulario'?'📖 Vocabulário':'✏️ Exercícios'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="sec-tabs" id="mTabs"></div>
        <div className="modal-body">
          {sectionsToShow.map((s, idx) => {
            const sectionType = s.type || s.tipo;
            // Passa o objeto inteiro — cada componente faz sua própria normalização
            // Para hardcoded: s tem dados diretos (falas, verbos, etc.)
            // Para banco: s tem .conteudo com os dados
            // Merge dos dois para garantir que nada se perca
            const base = (s.conteudo && typeof s.conteudo === 'object') ? s.conteudo : {};
            const norm = {
              titulo:      s.titulo      || base.titulo      || '',
              audioSrc:    s.audioSrc    || base.audioSrc    || null,
              personagens: s.personagens || base.personagens || [],
              falas:       s.falas       || base.falas       || [],
              verbos:      s.verbos      || base.verbos      || [],
              palavras:    s.palavras    || base.palavras     || [],
              grupos:      s.grupos      || base.grupos       || [],
            };
            
            switch (sectionType) {
              case 'dialogo':     return <SecaoDialogo     key={idx} section={norm}/>;
              case 'verbos':      return <SecaoVerbos      key={idx} section={norm}/>;
              case 'vocabulario': return <SecaoVocabulario key={idx} section={norm}/>;
              case 'exercicios':  return <SecaoExercicios  key={idx} section={norm} aulaId={aula.id}/>;
              default: return null;
            }
          })}
        </div>
        <div className="motiva">"Você não precisa acertar tudo. Você só precisa continuar." ✨</div>
      </div>
    </div>
  );
};

// ── Trilha (Main Page) ────────────────────────────────────────────────────────
export default function Trilha({ modoVisualizacao = false }) {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [aulas, setAulas] = useState(() => {
    return myVoiceData.basico.aulas.map(a => ({
      ...a,
      id: `hc-${a.id}`,
      publicada: true,
      secoes: a.sections?.map((s, i) => ({
        tipo: s.type || s.tipo,
        titulo: s.titulo,
        conteudo: s.conteudo || s,
        ordem: i
      })) || []
    }));
  });
  const [loading, setLoading] = useState(false);
  const curso = myVoiceData.basico;

  const openSec = (aula, secType, e) => {
    e.stopPropagation();
    setModal({ aula, secType });
  };

  useEffect(() => {
    let isMounted = true;

    const aulasHardcoded = myVoiceData.basico.aulas.map(a => ({
      ...a,
      id: `hc-${a.id}`,
      publicada: true,
      secoes: a.sections?.map((s, i) => ({
        tipo: s.type || s.tipo,
        titulo: s.titulo,
        conteudo: s.conteudo || s,
        ordem: i
      })) || []
    }));

    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setAulas(prev => prev.length === 0 ? aulasHardcoded : prev);
        setLoading(false);
      }
    }, 6000);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('aulas')
          .select('*, secoes(*)')
          .eq('publicada', true)
          .order('numero', { ascending: true });

        let aulasDB = [];
        if (!error) {
          aulasDB = data || [];
        }

        if (isMounted) {
          const numerosDB = new Set(aulasDB.map(a => a.numero));
          const filtradas = aulasHardcoded.filter(a => !numerosDB.has(a.numero));
          setAulas([...filtradas, ...aulasDB].sort((a, b) => a.numero - b.numero));
        }
      } catch (e) {
        if (isMounted) {
          setAulas(prev => prev.length === 0 ? aulasHardcoded : prev);
        }
      } finally {
        if (isMounted) setLoading(false);
        clearTimeout(safetyTimer);
      }
    })();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <>
      <nav>
        <div className="logo-title">
          <img src="/my_voice_default.png" alt="My Voice Logo" style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '50%', marginRight: '8px', verticalAlign: 'middle' }} />
          My Voice
        </div>
        {!modoVisualizacao && (
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
        )}
      </nav>

      <main>
        <header className="header">
          <h1 className="header-title">{curso.nome}</h1>
          <p className="header-sub">{curso.descricao}</p>
        </header>

        <div className="aulas-list" id="aulasList">
          {aulas.map(aula => (
            <div 
              key={aula.id} 
              className="aula-card"
              onClick={(e) => openSec(aula, 'tudo', e)}
            >
              <div className="aula-numero">
                <span>{String(aula.numero).padStart(2,'0')}</span>
              </div>
              <div className="aula-info">
                <span className="aula-tag">{aula.tag}</span>
                <h3 className="aula-titulo">{aula.titulo}</h3>
                <p className="aula-sub">{aula.subtitulo}</p>
                <div className="pills">
                  {(aula.sections || aula.secoes || []).map((s, si) => {
                    const sectionType = s.type || s.tipo;
                    const { emoji, label } = PILL_LABELS[sectionType] || {};
                    return (
                      <button 
                        key={si} 
                        className="pill"
                        onClick={(e) => openSec(aula, sectionType, e)}
                      >
                        {emoji} {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button 
                className="chevron-btn"
                onClick={(e) => openSec(aula, 'tudo', e)}
                title="Ver material completo"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ))}

          {[4,5].map(n => (
            <div key={n} className="aula-card" style={{ opacity:0.4, cursor:'not-allowed', filter:'grayscale(0.5)' }}>
              <div className="aula-numero" style={{ background:'rgba(255,255,255,0.08)' }}>
                <span>{String(n).padStart(2,'0')}</span>
              </div>
              <div className="aula-info">
                <span className="aula-tag">Em breve</span>
                <h3 className="aula-titulo">Aula {n} – Dallas & Susie</h3>
                <p className="aula-sub">Conteúdo sendo preparado…</p>
              </div>
              <Lock size={18} color="#94a3b8"/>
            </div>
          ))}
        </div>
      </main>

      {modal && createPortal(
        <SecaoModal aula={modal.aula} secType={modal.secType} onClose={() => setModal(null)}/>,
        document.body
      )}
    </>
  );
}
