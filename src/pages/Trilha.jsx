import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SecaoDialogo }     from '../components/SecaoDialogo';
import { SecaoVerbos }      from '../components/SecaoVerbos';
import { SecaoVocabulario } from '../components/SecaoVocabulario';
import { SecaoExercicios }  from '../components/SecaoExercicios';
import { supabase }         from '../lib/supabaseClient';

// ── DADOS DAS AULAS ───────────────────────────────────────────────────────────
const AULAS_HC = [
  {
    id: 'aula1', numero: 1,
    titulo: 'Linda & Glynda – Aula 1',
    subtitulo: 'Verbo To Be · Vocabulário do Dia a Dia',
    tag: 'Iniciante',
    sections: [
      {
        type: 'dialogo', titulo: '💬 Diálogo',
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
        type: 'verbos', titulo: '📘 Verbos do Diálogo',
        verbos: [
          { verbo: 'TO BE (ser/estar)',              presente: 'am / is / are', passado: 'was / were', participio: 'been'        },
          { verbo: 'TO LOVE (amar)',                 presente: 'love',          passado: 'loved',      participio: 'loved'       },
          { verbo: 'TO UNDERSTAND (entender)',       presente: 'understand',    passado: 'understood', participio: 'understood'  },
          { verbo: 'TO HAVE (ter)',                  presente: 'have',          passado: 'had',        participio: 'had'         },
          { verbo: 'TO SPEND (gastar/passar tempo)', presente: 'spend',         passado: 'spent',      participio: 'spent'       },
          { verbo: 'TO TRY (tentar)',                presente: 'try',           passado: 'tried',      participio: 'tried'       },
        ]
      },
      {
        type: 'vocabulario', titulo: '📖 Vocabulary',
        palavras: [
          { en: 'teacher',      pt: 'professora'             },
          { en: 'secretary',    pt: 'secretária'             },
          { en: 'mother',       pt: 'mãe'                    },
          { en: 'son',          pt: 'filho'                  },
          { en: 'children',     pt: 'filhos'                 },
          { en: 'job',          pt: 'trabalho'               },
          { en: 'busy',         pt: 'ocupada'                },
          { en: 'happy',        pt: 'feliz'                  },
          { en: 'tired',        pt: 'cansada'                },
          { en: 'always',       pt: 'sempre'                 },
          { en: 'a lot',        pt: 'muito'                  },
          { en: 'How are you?', pt: 'Como você está?'        },
          { en: 'I understand', pt: 'Eu entendo'             },
          { en: "That's nice",  pt: 'Que bom'                },
          { en: 'Really?',      pt: 'Sério?'                 },
          { en: 'Thank you',    pt: 'Obrigada'               },
          { en: 'I am trying',  pt: 'Eu estou tentando'      },
        ]
      },
      {
        type: 'exercicios', titulo: '✏️ Exercícios – Verbo TO BE',
        grupos: [
          { instrucao: 'Complete com am / is / are:', questoes: [
            { pergunta: 'I ___ happy.',       resposta: 'am'  },
            { pergunta: 'She ___ a teacher.', resposta: 'is'  },
            { pergunta: 'They ___ tired.',    resposta: 'are' },
            { pergunta: 'He ___ busy.',       resposta: 'is'  },
            { pergunta: 'We ___ friends.',    resposta: 'are' },
          ]},
          { instrucao: 'Forma negativa (adicione not):', questoes: [
            { pergunta: 'I am happy → I am ___ happy',         resposta: 'not' },
            { pergunta: 'She is busy → She is ___ busy',       resposta: 'not' },
            { pergunta: 'They are tired → They are ___ tired', resposta: 'not' },
          ]},
          { instrucao: 'Transforme em pergunta:', questoes: [
            { pergunta: 'You are happy → ___ you happy?',        resposta: 'Are' },
            { pergunta: 'She is a teacher → ___ she a teacher?', resposta: 'Is'  },
            { pergunta: 'They are busy → ___ they busy?',        resposta: 'Are' },
          ]},
          { instrucao: 'Respostas curtas:', questoes: [
            { pergunta: 'Are you tired? → Yes, I ___',      resposta: 'am'  },
            { pergunta: 'Is she a teacher? → Yes, she ___', resposta: 'is'  },
            { pergunta: 'Are they busy? → Yes, they ___',   resposta: 'are' },
          ]},
        ]
      }
    ]
  },
  {
    id: 'aula2', numero: 2,
    titulo: 'Linda & Glynda – Aula 2',
    subtitulo: 'Perguntas com To Be · Família · Profissões',
    tag: 'Iniciante',
    sections: [
      {
        type: 'dialogo', titulo: '💬 Diálogo',
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
        type: 'verbos', titulo: '📘 Verbos da Aula',
        verbos: [
          { verbo: 'TO BE (ser/estar)',        presente: 'am / is / are', passado: 'was / were', participio: 'been'        },
          { verbo: 'TO COME (vir)',             presente: 'come',         passado: 'came',       participio: 'come'        },
          { verbo: 'TO HAVE (ter)',             presente: 'have / has',   passado: 'had',        participio: 'had'         },
          { verbo: 'TO GO (ir)',                presente: 'go',           passado: 'went',       participio: 'gone'        },
          { verbo: 'TO SEE (ver)',              presente: 'see',          passado: 'saw',        participio: 'seen'        },
          { verbo: 'TO UNDERSTAND (entender)', presente: 'understand',   passado: 'understood', participio: 'understood'  },
          { verbo: 'TO CALL (ligar/chamar)',   presente: 'call',         passado: 'called',     participio: 'called'      },
          { verbo: 'TO WORK (trabalhar)',      presente: 'work',         passado: 'worked',     participio: 'worked'      },
        ]
      },
      {
        type: 'vocabulario', titulo: '📖 Vocabulary',
        palavras: [
          { en: 'father',           pt: 'pai'               },
          { en: 'mother',           pt: 'mãe'               },
          { en: 'family',           pt: 'família'           },
          { en: 'son',              pt: 'filho'             },
          { en: 'teacher',          pt: 'professor(a)'      },
          { en: 'businessman',      pt: 'homem de negócios' },
          { en: 'businesswoman',    pt: 'mulher de negócios'},
          { en: 'here',             pt: 'aqui'              },
          { en: 'there',            pt: 'lá'                },
          { en: 'holiday',          pt: 'feriado'           },
          { en: 'sad',              pt: 'triste'            },
          { en: 'happy',            pt: 'feliz'             },
          { en: 'busy',             pt: 'ocupado'           },
          { en: 'Are you okay?',    pt: 'Você está bem?'    },
          { en: 'Where is he?',     pt: 'Onde ele está?'    },
          { en: 'today',            pt: 'hoje'              },
          { en: 'because',          pt: 'porque'            },
          { en: 'very',             pt: 'muito'             },
        ]
      },
      {
        type: 'exercicios', titulo: '✏️ Exercícios – Perguntas com To Be',
        grupos: [
          { instrucao: 'Forme perguntas:', questoes: [
            { pergunta: 'She is sad. → ___ she sad?',                  resposta: 'Is'  },
            { pergunta: 'He is a businessman. → ___ he a businessman?',resposta: 'Is'  },
            { pergunta: 'They are here. → ___ they here?',             resposta: 'Are' },
            { pergunta: 'You are okay. → ___ you okay?',               resposta: 'Are' },
          ]},
          { instrucao: 'Complete com TO BE:', questoes: [
            { pergunta: 'My father ___ in Salvador.', resposta: 'is'  },
            { pergunta: 'My parents ___ happy.',      resposta: 'are' },
            { pergunta: 'I ___ not okay today.',      resposta: 'am'  },
            { pergunta: 'Where ___ he?',              resposta: 'is'  },
          ]},
          { instrucao: 'Resposta curta (Yes/No):', questoes: [
            { pergunta: 'Is Linda sad? → Yes, ___ ___',             resposta: 'she is'      },
            { pergunta: "Is her father in SP? → No, ___ ___",       resposta: "he isn't"    },
            { pergunta: 'Is her mother a teacher? → Yes, ___ ___',  resposta: 'she is'      },
            { pergunta: 'Are they at home? → No, ___ ___',          resposta: "they aren't" },
          ]},
        ]
      }
    ]
  },
  {
    id: 'aula3', numero: 3,
    titulo: 'Dallas & Susie – Aula 1',
    subtitulo: 'Verbos Grupo I · Sentimentos e Emoções',
    tag: 'Iniciante',
    sections: [
      {
        type: 'verbos',
        titulo: '📘 Verbos – Ouça e Repita (Áudio 1)',
        audioSrc: '/audios/Aúdio-1.mp3',
        verbos: [
          { verbo: 'TO BE (ser/estar)',         presente: 'am / is / are', passado: 'was / were', participio: 'been'        },
          { verbo: 'TO FEEL (sentir)',           presente: 'feel',          passado: 'felt',       participio: 'felt'        },
          { verbo: 'TO HAPPEN (acontecer)',      presente: 'happen',        passado: 'happened',   participio: 'happened'    },
          { verbo: 'TO MISS (sentir falta de)', presente: 'miss',          passado: 'missed',     participio: 'missed'      },
          { verbo: 'TO UNDERSTAND (entender)',   presente: 'understand',    passado: 'understood', participio: 'understood'  },
          { verbo: 'TO HEAR (ouvir)',            presente: 'hear',          passado: 'heard',      participio: 'heard'       },
          { verbo: 'TO TALK (conversar)',        presente: 'talk',          passado: 'talked',     participio: 'talked'      },
          { verbo: 'TO STAY (ficar)',            presente: 'stay',          passado: 'stayed',     participio: 'stayed'      },
          { verbo: 'TO TRUST (confiar)',         presente: 'trust',         passado: 'trusted',    participio: 'trusted'     },
          { verbo: 'TO SOUND (soar/parecer)',    presente: 'sound',         passado: 'sounded',    participio: 'sounded'     },
          { verbo: 'TO LOVE (amar)',             presente: 'love',          passado: 'loved',      participio: 'loved'       },
        ]
      },
      {
        type: 'vocabulario',
        titulo: '📖 Vocabulary – Feelings & Family (Áudio 3)',
        audioSrc: '/audios/Aúdio-3.mp3',
        palavras: [
          { en: 'sad',                           pt: 'triste'                 },
          { en: 'happy',                         pt: 'feliz'                  },
          { en: 'worry',                         pt: 'preocupação'            },
          { en: 'tired',                         pt: 'cansado(a)'             },
          { en: 'strong',                        pt: 'forte'                  },
          { en: 'better',                        pt: 'melhor'                 },
          { en: 'alone',                         pt: 'sozinho(a)'             },
          { en: 'difficult',                     pt: 'difícil'                },
          { en: 'family',                        pt: 'família'                },
          { en: 'father',                        pt: 'pai'                    },
          { en: 'grandmother',                   pt: 'avó'                    },
          { en: 'friend',                        pt: 'amigo(a)'               },
          { en: 'I miss you',                    pt: 'Sinto sua falta'        },
          { en: 'I am here for you',             pt: 'Estou aqui por você'    },
          { en: 'Stay strong',                   pt: 'Fique forte'            },
          { en: 'Trust God',                     pt: 'Confie em Deus'         },
          { en: 'Everything will be okay',       pt: 'Tudo vai ficar bem'     },
          { en: 'Thank you for listening to me', pt: 'Obrigada por me ouvir'  },
        ]
      },
      {
        type: 'exercicios', titulo: '✏️ Exercícios – Verbos e Vocabulário',
        grupos: [
          { instrucao: 'Escreva o passado dos verbos:', questoes: [
            { pergunta: 'feel  →  ___',  resposta: 'felt'    },
            { pergunta: 'hear  →  ___',  resposta: 'heard'   },
            { pergunta: 'miss  →  ___',  resposta: 'missed'  },
            { pergunta: 'stay  →  ___',  resposta: 'stayed'  },
            { pergunta: 'trust →  ___',  resposta: 'trusted' },
          ]},
          { instrucao: 'Traduza para o inglês:', questoes: [
            { pergunta: 'Sinto sua falta →  ___',    resposta: 'I miss you'              },
            { pergunta: 'Fique forte →  ___',         resposta: 'Stay strong'             },
            { pergunta: 'Tudo vai ficar bem →  ___',  resposta: 'Everything will be okay' },
            { pergunta: 'Estou aqui por você →  ___', resposta: 'I am here for you'       },
          ]},
          { instrucao: 'Complete (sad / strong / alone / tired / better):', questoes: [
            { pergunta: 'She works all day. She is very ___.',   resposta: 'tired'  },
            { pergunta: 'He has no friends here. He feels ___.',  resposta: 'alone'  },
            { pergunta: 'She cried today. She is feeling ___.',  resposta: 'sad'    },
            { pergunta: 'After resting, I feel ___.',            resposta: 'better' },
            { pergunta: 'Her grandmother tells her to stay ___.',resposta: 'strong' },
          ]},
        ]
      }
    ]
  },
  {
    id: 'aula4', numero: 4,
    titulo: 'Dallas & Susie – Aula 2',
    subtitulo: 'Verbos Grupo II · Diálogo Real · Esperança e Família',
    tag: 'Iniciante',
    sections: [
      {
        type: 'verbos',
        titulo: '📘 Verbos – Ouça e Repita (Áudio 2)',
        audioSrc: '/audios/Aúdio-2.mp3',
        verbos: [
          { verbo: 'TO LISTEN (ouvir/escutar)',  presente: 'listen',   passado: 'listened',   participio: 'listened'   },
          { verbo: 'TO COME (vir)',              presente: 'come',     passado: 'came',       participio: 'come'       },
          { verbo: 'TO RETURN (retornar)',       presente: 'return',   passado: 'returned',   participio: 'returned'   },
          { verbo: 'TO HOPE (esperar/torcer)',   presente: 'hope',     passado: 'hoped',      participio: 'hoped'      },
          { verbo: 'TO HELP (ajudar)',           presente: 'help',     passado: 'helped',     participio: 'helped'     },
          { verbo: 'TO SMILE (sorrir)',          presente: 'smile',    passado: 'smiled',     participio: 'smiled'     },
          { verbo: 'TO PRAY (rezar/orar)',       presente: 'pray',     passado: 'prayed',     participio: 'prayed'     },
          { verbo: 'TO WORRY (preocupar-se)',    presente: 'worry',    passado: 'worried',    participio: 'worried'    },
          { verbo: 'TO REMEMBER (lembrar)',      presente: 'remember', passado: 'remembered', participio: 'remembered' },
        ]
      },
      {
        type: 'dialogo',
        titulo: '💬 Diálogo – Dallas & Susie (Áudio 4)',
        audioSrc: '/audios/Aúdio-4.mp3',
        personagens: ['Susie', 'Dallas'],
        falas: [
          { personagem: 'Susie',  texto: "Dallas, can I tell you something else?"          },
          { personagem: 'Dallas', texto: "Of course, Susie. I'm listening."                },
          { personagem: 'Susie',  texto: "My grandmother always talks to me on the phone." },
          { personagem: 'Dallas', texto: "That's very special."                            },
          { personagem: 'Susie',  texto: "Yes, she tells me to stay strong and trust God." },
          { personagem: 'Dallas', texto: "Your grandmother sounds very wise."              },
          { personagem: 'Susie',  texto: "She is. I love listening to her stories."        },
          { personagem: 'Dallas', texto: "That's wonderful."                               },
          { personagem: 'Susie',  texto: "I already feel a little better now."             },
          { personagem: 'Dallas', texto: "I'm happy to hear that, Susie."                  },
        ]
      },
      {
        type: 'exercicios', titulo: '✏️ Exercícios – Diálogo e Verbos',
        grupos: [
          { instrucao: 'Escreva o passado dos verbos:', questoes: [
            { pergunta: 'listen   →  ___', resposta: 'listened'   },
            { pergunta: 'come     →  ___', resposta: 'came'       },
            { pergunta: 'hope     →  ___', resposta: 'hoped'      },
            { pergunta: 'worry    →  ___', resposta: 'worried'    },
            { pergunta: 'remember →  ___', resposta: 'remembered' },
          ]},
          { instrucao: 'Verdadeiro (True) ou Falso (False)?', questoes: [
            { pergunta: "Susie's grandmother talks to her on the phone. →  ___",        resposta: 'True'  },
            { pergunta: "Dallas says that's not important. →  ___",                      resposta: 'False' },
            { pergunta: "Grandmother tells Susie to stay strong and trust God. →  ___", resposta: 'True'  },
            { pergunta: "Susie feels worse at the end of the dialogue. →  ___",         resposta: 'False' },
          ]},
          { instrucao: 'Complete (listen / smile / hope / pray / remember):', questoes: [
            { pergunta: "I always ___ to my grandmother's advice.",    resposta: 'listen'   },
            { pergunta: "She starts to ___ when she hears good news.", resposta: 'smile'    },
            { pergunta: "They ___ that everything will be okay.",      resposta: 'hope'     },
            { pergunta: "He ___ every night before sleeping.",         resposta: 'prays'    },
            { pergunta: "I always ___ her words.",                     resposta: 'remember' },
          ]},
        ]
      }
    ]
  },
];

// ── PILLS ─────────────────────────────────────────────────────────────────────
const PILLS = {
  dialogo:     { emoji: '💬', label: 'Diálogo'    },
  verbos:      { emoji: '📘', label: 'Verbos'      },
  vocabulario: { emoji: '📖', label: 'Vocab'       },
  exercicios:  { emoji: '✏️', label: 'Exercícios' },
};

// ── MODAL ─────────────────────────────────────────────────────────────────────
const Modal = ({ aula, onClose }) => {
  const [secType, setSecType] = useState('tudo');
  if (!aula) return null;

  const secs = aula.sections || [];
  const toShow = secType === 'tudo' ? secs : secs.filter(s => s.type === secType);

  const renderSec = (s, i) => {
    switch (s.type) {
      case 'dialogo':     return <SecaoDialogo     key={i} section={s} />;
      case 'verbos':      return <SecaoVerbos      key={i} section={s} />;
      case 'vocabulario': return <SecaoVocabulario key={i} section={s} />;
      case 'exercicios':  return <SecaoExercicios  key={i} section={s} aulaId={aula.id} />;
      default: return null;
    }
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      backdropFilter:'blur(6px)', zIndex:9999,
      display:'flex', alignItems:'flex-start', justifyContent:'center',
      padding:'1rem', overflowY:'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:20, width:'100%', maxWidth:680,
        marginTop:'2rem', marginBottom:'2rem',
        display:'flex', flexDirection:'column', maxHeight:'90vh', overflowY:'auto',
      }}>
        {/* Header */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'flex-start',
          padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.08)',
          flexShrink:0,
        }}>
          <div>
            <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em',
              textTransform:'uppercase', color:'#06b6d4' }}>
              Aula {aula.numero}
            </span>
            <h2 style={{ fontSize:'1.15rem', fontWeight:800, marginTop:4 }}>{aula.titulo}</h2>
            <p style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:2 }}>{aula.subtitulo}</p>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.07)', border:'none', borderRadius:9999,
            color:'#94a3b8', cursor:'pointer', padding:'0.4rem 0.55rem', fontSize:'1.1rem',
          }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', padding:'0.875rem 1.5rem 0', flexShrink:0 }}>
          {[{ type:'tudo', emoji:'📋', label:'Tudo' }, ...secs.map(s => ({ type:s.type, ...PILLS[s.type] }))].map(t => (
            <button key={t.type} onClick={() => setSecType(t.type)} style={{
              fontSize:'0.75rem', padding:'0.3rem 0.8rem', borderRadius:9999,
              border: secType === t.type ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
              background: secType === t.type ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: secType === t.type ? '#c084fc' : '#94a3b8',
              fontWeight: secType === t.type ? 700 : 400,
              cursor:'pointer', fontFamily:'inherit',
            }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding:'1.25rem 1.5rem', flex:1 }}>
          {toShow.map((s, i) => renderSec(s, i))}
        </div>

        <div style={{
          padding:'1rem 1.5rem', textAlign:'center', fontSize:'0.8rem',
          color:'#94a3b8', fontStyle:'italic', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0,
        }}>
          "Você não precisa acertar tudo. Você só precisa continuar." ✨
        </div>
      </div>
    </div>
  );
};

// ── TRILHA (página principal) ─────────────────────────────────────────────────
export default function Trilha({ modoVisualizacao = false }) {
  const navigate = useNavigate();
  const [aulas, setAulas] = useState(AULAS_HC);
  const [modalAula, setModalAula] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('aulas')
          .select('*, secoes(*)')
          .eq('publicada', true)
          .order('numero', { ascending: true });
        if (!mounted || error || !data?.length) return;
        const numerosDB = new Set(data.map(a => a.numero));
        const filtradas = AULAS_HC.filter(a => !numerosDB.has(a.numero));
        setAulas([...filtradas, ...data].sort((a, b) => a.numero - b.numero));
      } catch { /* mantém hardcoded */ }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{
      minHeight:'100vh', fontFamily:"'Outfit',system-ui,sans-serif",
      background:'#0f172a', color:'#f8fafc',
      backgroundImage:'radial-gradient(circle at 15% 50%,rgba(139,92,246,.15),transparent 25%),radial-gradient(circle at 85% 30%,rgba(236,72,153,.15),transparent 25%)',
    }}>
      {/* Navbar */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'1rem 2rem', background:'rgba(15,23,42,0.9)',
        backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <img src="/my_voice_default.png" alt="My Voice"
            style={{ width:46, height:46, borderRadius:'50%', objectFit:'cover' }} />
          <span style={{
            fontSize:'1.2rem', fontWeight:800,
            background:'linear-gradient(to right,#8b5cf6,#ec4899)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>My Voice</span>
        </div>
        {!modoVisualizacao && (
          <button onClick={() => navigate(-1)} style={{
            display:'flex', alignItems:'center', gap:6, color:'#94a3b8', fontSize:'0.88rem',
            padding:'0.45rem 1rem', borderRadius:9999, border:'1px solid rgba(255,255,255,0.1)',
            cursor:'pointer', background:'transparent',
          }}>
            <LogOut size={18}/> Voltar
          </button>
        )}
      </nav>

      {/* Main */}
      <main style={{ padding:'2rem', maxWidth:860, margin:'0 auto', width:'100%' }}>
        <header style={{ marginBottom:'2rem', textAlign:'center' }}>
          <h1 style={{
            fontSize:'1.9rem', fontWeight:800, marginBottom:'0.4rem',
            background:'linear-gradient(to right,#8b5cf6,#ec4899,#06b6d4)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Inglês Básico</h1>
          <p style={{ color:'#94a3b8', fontSize:'0.95rem' }}>
            Do zero à conversação. Comece sua voz em inglês aqui.
          </p>
        </header>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
          {aulas.map(aula => {
            const secs = aula.sections || aula.secoes || [];
            return (
              <div key={aula.id} onClick={() => setModalAula(aula)} style={{
                display:'flex', alignItems:'center', gap:'1.25rem',
                padding:'1.25rem 1.5rem',
                background:'rgba(30,41,59,0.7)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:16, cursor:'pointer', transition:'transform 0.25s,box-shadow 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(139,92,246,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                {/* Número */}
                <div style={{
                  minWidth:52, height:52, borderRadius:12,
                  background:'linear-gradient(135deg,#8b5cf6,#ec4899)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.1rem', fontWeight:800, flexShrink:0,
                }}>
                  {String(aula.numero).padStart(2,'0')}
                </div>

                {/* Info */}
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em',
                    textTransform:'uppercase', color:'#06b6d4', display:'block', marginBottom:2 }}>
                    {aula.tag || 'Iniciante'}
                  </span>
                  <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'2px 0' }}>{aula.titulo}</h3>
                  <p style={{ fontSize:'0.82rem', color:'#94a3b8', marginBottom:8 }}>{aula.subtitulo}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                    {secs.map((s, si) => {
                      const tipo = s.type || s.tipo;
                      const pill = PILLS[tipo];
                      if (!pill) return null;
                      return (
                        <button key={si}
                          onClick={e => { e.stopPropagation(); setModalAula(aula); }}
                          style={{
                            fontSize:'0.7rem', padding:'0.22rem 0.65rem',
                            background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
                            borderRadius:9999, color:'#cbd5e1', cursor:'pointer',
                          }}>
                          {pill.emoji} {pill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <ChevronRight size={20} color="#94a3b8"/>
              </div>
            );
          })}
        </div>
      </main>

      {modalAula && createPortal(
        <Modal aula={modalAula} onClose={() => setModalAula(null)}/>,
        document.body
      )}
    </div>
  );
}
