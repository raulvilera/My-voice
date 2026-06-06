import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, RotateCcw, MessageCircle, BookMarked, Grid3x3, PenLine, Play, Square, Volume2, Mic, LogOut, ChevronRight, Lock } from 'lucide-react';
import { SecaoDialogo }     from '../components/SecaoDialogo';
import { SecaoVerbos }      from '../components/SecaoVerbos';
import { SecaoVocabulario } from '../components/SecaoVocabulario';
import { SecaoExercicios }  from '../components/SecaoExercicios';

// ── Bandeira dos EUA SVG inline ───────────────────────────────────────────────
const BandeiraEUA = ({ size = 36 }) => (
  <svg width={size} height={size * 0.526} viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 3, display: 'block' }}>
    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
      <rect key={i} x="0" y={i * 400/13} width="760" height={400/13}
        fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'} />
    ))}
    <rect x="0" y="0" width="303" height={400 * 7/13} fill="#3C3B6E" />
    {Array.from({ length: 50 }).map((_, idx) => {
      const row = Math.floor(idx / 6) % 2 === 0 ? Math.floor(idx / 6) : Math.floor(idx / 5);
      const col = idx % (Math.floor(idx / 6) % 2 === 0 ? 6 : 5);
      const isOddRow = Math.floor(idx / 6) % 2 !== 0;
      const cx = isOddRow ? 30 + col * 50 + 25 : 30 + col * 50;
      const cy = Math.floor(idx / (isOddRow ? 5 : 6)) * 26 + (isOddRow ? 13 : 0) + 16;
      return <polygon key={idx} points="0,-9 2.6,-4 9,-4 4,0 6,6 0,3 -6,6 -4,0 -9,-4 -2.6,-4"
        transform={`translate(${cx},${cy})`} fill="white" />;
    })}
  </svg>
);

// ── DATA ─────────────────────────────────────────────────────────────────────
const myVoiceData = {
  basico: {
    nome: 'Inglês Básico',
    descricao: 'Do zero à conversação. Comece sua voz em inglês aqui.',
    cor: '#8b5cf6',
    aulas: [
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
              { verbo: 'TO BE (ser/estar)',              presente: 'am / is / are', passado: 'was / were',  participio: 'been'        },
              { verbo: 'TO LOVE (amar)',                 presente: 'love',          passado: 'loved',       participio: 'loved'       },
              { verbo: 'TO UNDERSTAND (entender)',       presente: 'understand',    passado: 'understood',  participio: 'understood'  },
              { verbo: 'TO HAVE (ter)',                  presente: 'have',          passado: 'had',         participio: 'had'         },
              { verbo: 'TO SPEND (gastar/passar tempo)', presente: 'spend',         passado: 'spent',       participio: 'spent'       },
              { verbo: 'TO TRY (tentar)',                presente: 'try',           passado: 'tried',       participio: 'tried'       },
            ]
          },
          {
            type: 'vocabulario', titulo: '📖 Vocabulary',
            palavras: [
              { en: 'teacher',       pt: 'professora' },
              { en: 'secretary',     pt: 'secretária' },
              { en: 'mother',        pt: 'mãe' },
              { en: 'son',           pt: 'filho' },
              { en: 'children',      pt: 'filhos' },
              { en: 'job',           pt: 'trabalho' },
              { en: 'busy',          pt: 'ocupada' },
              { en: 'happy',         pt: 'feliz' },
              { en: 'tired',         pt: 'cansada' },
              { en: 'always',        pt: 'sempre' },
              { en: 'a lot',         pt: 'muito' },
              { en: 'How are you?',  pt: 'Como você está?' },
              { en: 'I understand',  pt: 'Eu entendo' },
              { en: "That's nice",   pt: 'Que bom' },
              { en: 'Really?',       pt: 'Sério?' },
              { en: 'Thank you',     pt: 'Obrigada' },
              { en: 'I am trying',   pt: 'Eu estou tentando' },
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
              { verbo: 'TO BE (ser/estar)',        presente: 'am / is / are', passado: 'was / were',  participio: 'been'        },
              { verbo: 'TO COME (vir)',             presente: 'come',         passado: 'came',        participio: 'come'        },
              { verbo: 'TO HAVE (ter)',             presente: 'have / has',   passado: 'had',         participio: 'had'         },
              { verbo: 'TO GO (ir)',                presente: 'go',           passado: 'went',        participio: 'gone'        },
              { verbo: 'TO SEE (ver)',              presente: 'see',          passado: 'saw',         participio: 'seen'        },
              { verbo: 'TO UNDERSTAND (entender)', presente: 'understand',   passado: 'understood',  participio: 'understood'  },
              { verbo: 'TO CALL (ligar/chamar)',   presente: 'call',         passado: 'called',      participio: 'called'      },
              { verbo: 'TO WORK (trabalhar)',      presente: 'work',         passado: 'worked',      participio: 'worked'      },
            ]
          },
          {
            type: 'vocabulario', titulo: '📖 Vocabulary',
            palavras: [
              { en: 'father',        pt: 'pai'               },
              { en: 'mother',        pt: 'mãe'               },
              { en: 'family',        pt: 'família'           },
              { en: 'son',           pt: 'filho'             },
              { en: 'teacher',       pt: 'professor(a)'      },
              { en: 'businessman',   pt: 'homem de negócios' },
              { en: 'businesswoman', pt: 'mulher de negócios'},
              { en: 'here',          pt: 'aqui'              },
              { en: 'there',         pt: 'lá'                },
              { en: 'holiday',       pt: 'feriado'           },
              { en: 'sad',           pt: 'triste'            },
              { en: 'happy',         pt: 'feliz'             },
              { en: 'busy',          pt: 'ocupado'           },
              { en: 'Are you okay?', pt: 'Você está bem?'    },
              { en: 'Where is he?',  pt: 'Onde ele está?'    },
              { en: 'today',         pt: 'hoje'              },
              { en: 'because',       pt: 'porque'            },
              { en: 'very',          pt: 'muito'             },
            ]
          },
          {
            type: 'exercicios', titulo: '✏️ Exercícios – Perguntas com To Be',
            grupos: [
              { instrucao: 'Forme perguntas:', questoes: [
                { pergunta: 'She is sad. → ___ she sad?',               resposta: 'Is'  },
                { pergunta: 'He is a businessman. → ___ he a businessman?', resposta: 'Is' },
                { pergunta: 'They are here. → ___ they here?',          resposta: 'Are' },
                { pergunta: 'You are okay. → ___ you okay?',            resposta: 'Are' },
              ]},
              { instrucao: 'Complete com o verbo TO BE correto:', questoes: [
                { pergunta: 'My father ___ in Salvador.', resposta: 'is'  },
                { pergunta: 'My parents ___ happy.',      resposta: 'are' },
                { pergunta: 'I ___ not okay today.',      resposta: 'am'  },
                { pergunta: 'Where ___ he?',              resposta: 'is'  },
              ]},
              { instrucao: 'Resposta curta (Yes/No):', questoes: [
                { pergunta: 'Is Linda sad? → Yes, ___ ___',              resposta: 'she is'      },
                { pergunta: "Is her father in São Paulo? → No, ___ ___", resposta: "he isn't"    },
                { pergunta: 'Is her mother a teacher? → Yes, ___ ___',   resposta: 'she is'      },
                { pergunta: 'Are they at home? → No, ___ ___',           resposta: "they aren't" },
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
              { verbo: 'TO BE (ser/estar)',         presente: 'am / is / are', passado: 'was / were',  participio: 'been'        },
              { verbo: 'TO FEEL (sentir)',           presente: 'feel',          passado: 'felt',        participio: 'felt'        },
              { verbo: 'TO HAPPEN (acontecer)',      presente: 'happen',        passado: 'happened',    participio: 'happened'    },
              { verbo: 'TO MISS (sentir falta de)', presente: 'miss',          passado: 'missed',      participio: 'missed'      },
              { verbo: 'TO UNDERSTAND (entender)',   presente: 'understand',    passado: 'understood',  participio: 'understood'  },
              { verbo: 'TO HEAR (ouvir)',            presente: 'hear',          passado: 'heard',       participio: 'heard'       },
              { verbo: 'TO TALK (conversar)',        presente: 'talk',          passado: 'talked',      participio: 'talked'      },
              { verbo: 'TO STAY (ficar)',            presente: 'stay',          passado: 'stayed',      participio: 'stayed'      },
              { verbo: 'TO TRUST (confiar)',         presente: 'trust',         passado: 'trusted',     participio: 'trusted'     },
              { verbo: 'TO SOUND (soar/parecer)',    presente: 'sound',         passado: 'sounded',     participio: 'sounded'     },
              { verbo: 'TO LOVE (amar)',             presente: 'love',          passado: 'loved',       participio: 'loved'       },
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
                { pergunta: 'She works all day. She is very ___.',    resposta: 'tired'  },
                { pergunta: 'He has no friends here. He feels ___.',  resposta: 'alone'  },
                { pergunta: 'She cried today. She is feeling ___.',   resposta: 'sad'    },
                { pergunta: 'After resting, I feel ___.',             resposta: 'better' },
                { pergunta: 'Her grandmother tells her to stay ___.',  resposta: 'strong' },
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
              { instrucao: "Verdadeiro (True) ou Falso (False)?", questoes: [
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
  
  // ✅ CORREÇÃO: Suporta tanto dados hardcoded (sections) quanto dados do Supabase (secoes)
  const sections = aula.sections || aula.secoes || [];
  
  // Adapta o tipo: 'type' (hardcoded) ou 'tipo' (Supabase)
  const sec = sections.find(s => (s.type || s.tipo) === secType);
  if (!sec) return null;
  
  // Prepara os dados para os componentes
  // Se vem do Supabase, o conteúdo está em sec.conteudo; se hardcoded, está achatado
  const sectionData = sec.conteudo ? { ...sec.conteudo, titulo: sec.titulo } : sec;
  
  // Para diálogo: mostra TODAS as seções
  const sectionsToShow = secType === 'dialogo' ? sections : [sec];

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
            const sectionType = s.type || s.tipo;
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
        <div style={styles.motivaFrase}>"Você não precisa acertar tudo. Você só precisa continuar." ✨</div>
      </div>
    </div>
  );
};

// ── Trilha (Main Page) ────────────────────────────────────────────────────────
export default function Trilha({ modoVisualizacao = false }) {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [aulas, setAulas] = useState(() =>
    myVoiceData.basico.aulas.map(a => ({
      ...a,
      id: `hc-${a.id}`,
      publicada: true,
      secoes: (a.sections || []).map((s, i) => ({
        tipo: s.type || s.tipo,
        titulo: s.titulo,
        conteudo: s,
        ordem: i,
      })),
    }))
  );

  useEffect(() => {
    let mounted = true;
    const aulasHC = myVoiceData.basico.aulas.map(a => ({
      ...a,
      id: `hc-${a.id}`,
      publicada: true,
      secoes: (a.sections || []).map((s, i) => ({
        tipo: s.type || s.tipo,
        titulo: s.titulo,
        conteudo: s,
        ordem: i,
      })),
    }));

    (async () => {
      try {
        const { data, error } = await supabase
          .from('aulas')
          .select('*, secoes(*)')
          .eq('publicada', true)
          .order('numero', { ascending: true });

        if (!mounted) return;
        const aulasDB = (!error && data) ? data : [];
        const numerosDB = new Set(aulasDB.map(a => a.numero));
        const filtradas = aulasHC.filter(a => !numerosDB.has(a.numero));
        setAulas([...filtradas, ...aulasDB].sort((a, b) => a.numero - b.numero));
      } catch {
        if (mounted) setAulas(aulasHC);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const openSec = (aula, secType, e) => {
    e.stopPropagation();
    setModal({ aula, secType });
  };

  return (
    <div style={styles.trilhaContainer}>
      <nav style={styles.navbar}>
        <div style={styles.logoInfo}>
          <img src="/my_voice_default.png" alt="My Voice" style={{ width:46, height:46, borderRadius:'50%', objectFit:'cover' }} />
          <h2 style={styles.logoTitle}>My Voice</h2>
        </div>
        {!modoVisualizacao && (
          <button style={styles.logoutBtn} onClick={() => navigate(-1)}>
            <LogOut size={18}/><span style={{marginLeft:6}}>Voltar</span>
          </button>
        )}
      </nav>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>{myVoiceData.basico.nome}</h1>
          <p style={{color:'#94a3b8',fontSize:'0.95rem'}}>{myVoiceData.basico.descricao}</p>
        </header>

        <div style={styles.aulasList}>
          {aulas.map(aula => {
            const secs = aula.sections || aula.secoes || [];
            return (
              <div key={aula.id} style={styles.aulaCard} onClick={(e) => openSec(aula, 'tudo', e)}>
                <div style={styles.aulaNumero}>
                  <span>{String(aula.numero).padStart(2,'0')}</span>
                </div>
                <div style={styles.aulaInfo}>
                  <span style={styles.aulaTagSmall}>{aula.tag}</span>
                  <h3 style={{fontSize:'1rem',fontWeight:700,margin:'2px 0'}}>{aula.titulo}</h3>
                  <p style={{fontSize:'0.82rem',color:'#94a3b8',marginBottom:8}}>{aula.subtitulo}</p>
                  <div style={styles.aulaSections}>
                    {secs.map((s, si) => {
                      const sectionType = s.type || s.tipo;
                      const { emoji, label } = PILL_LABELS[sectionType] || {};
                      if (!emoji) return null;
                      return (
                        <button key={si} style={styles.sectionPillBtn}
                          onClick={(e) => openSec(aula, sectionType, e)}>
                          {emoji} {label}
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

      {modal && createPortal(
        <SecaoModal aula={modal.aula} secType={modal.secType} onClose={() => setModal(null)}/>,
        document.body
      )}
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
  logoMicWrapper: { position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:42, height:42 },
  logoBandeira: { position:'absolute', inset:0, borderRadius:8, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 1.5px rgba(255,255,255,0.18)' },
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

  // ✅ CORREÇÃO: Aumenta z-index de 200 para 9999 para ficar acima do ModoAluno (zIndex 300/400)
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
    zIndex:9999, display:'flex', alignItems:'flex-start', justifyContent:'center',
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
