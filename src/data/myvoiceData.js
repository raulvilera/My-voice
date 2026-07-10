// ─────────────────────────────────────────────────────────────────────────────
// INSTRUÇÕES DE DEPLOY DOS ÁUDIOS:
// 1. Faça upload dos MP3 no Supabase Storage → bucket "audios-dialogos"
//    Nomeie como: dialogo-aula3-1.mp3, dialogo-aula3-2.mp3 … dialogo-aula5-12.mp3
// 2. Copie a URL pública base do bucket e substitua SUPABASE_AUDIO_BASE_URL abaixo
// 3. A ordem dos áudios segue a sequência das falas no diálogo
// ─────────────────────────────────────────────────────────────────────────────

const AUDIO_BASE = 'https://ppzvwhkvwupmfmijrkkl.supabase.co/storage/v1/object/public/audios-dialogos';

export const myVoiceData = {
  basico: {
    nome: 'Inglês Básico',
    descricao: 'Do zero à conversação. Comece sua voz em inglês aqui.',
    cor: '#8b5cf6',
    aulas: [
      // ─────────────────────────────────────────────────────────────────────────────
// AULA 1 – Substitua o objeto da aula1 em src/data/myvoiceData.js
// ─────────────────────────────────────────────────────────────────────────────

      {
        id: 'aula1',
        numero: 1,
        titulo: 'Linda & Glynda – Aula 1',
        subtitulo: 'Verbo To Be · Pronomes · Afirmativo e Negativo',
        tag: 'Iniciante',
        sections: [
          // ── DIÁLOGO (original preservado) ──────────────────────────────
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            personagens: ['Linda', 'Glynda'],
            falas: [
              { personagem: 'Linda',  start: 1.0,  end: 4.24,  texto: 'Hi, Glynda. How are you?' },
              { personagem: 'Glynda', start: 4.84, end: 11.97, texto: 'I understand. I love my job, but my days are busy.' },
              { personagem: 'Linda',  start: 12.57,end: 14.52, texto: 'Really? Why not?' },
              { personagem: 'Glynda', start: 15.12,end: 24.85, texto: 'I see… I have three children, and I spend a lot of time with them.' },
              { personagem: 'Linda',  start: 25.45,end: 36.47, texto: 'That is very good. I have one son, and I want to spend more time with him.' },
              { personagem: 'Glynda', start: 37.07,end: 41.61, texto: 'Maybe you can start with small changes.' },
              { personagem: 'Linda',  start: 42.21,end: 46.1,  texto: 'Yes… I think I need that.' }
            ]
          },

          // ── PRONOMES ────────────────────────────────────────────────────
          {
            type: 'verbos',
            titulo: '📘 Pronomes em Inglês (Pronouns)',
            verbos: [
              { verbo: 'I',    presente: 'Eu',          passado: '1ª pessoa singular', participio: '' },
              { verbo: 'You',  presente: 'Você',        passado: '2ª pessoa singular', participio: '' },
              { verbo: 'He',   presente: 'Ele',         passado: '3ª pessoa singular', participio: '' },
              { verbo: 'She',  presente: 'Ela',         passado: '3ª pessoa singular', participio: '' },
              { verbo: 'It',   presente: 'Isto/Aquilo', passado: '3ª pessoa singular', participio: '' },
              { verbo: 'We',   presente: 'Nós',         passado: '1ª pessoa plural',   participio: '' },
              { verbo: 'You',  presente: 'Vocês',       passado: '2ª pessoa plural',   participio: '' },
              { verbo: 'They', presente: 'Eles/Elas',   passado: '3ª pessoa plural',   participio: '' },
            ]
          },

          // ── VERBO TO BE ─────────────────────────────────────────────────
          {
            type: 'verbos',
            titulo: '📘 Verbo TO BE – Ser/Estar',
            verbos: [
              { verbo: 'I AM…',           presente: 'Eu sou/estou',        passado: '1ª pessoa', participio: 'Afirmativo' },
              { verbo: 'YOU ARE…',        presente: 'Você é/está',         passado: '2ª pessoa', participio: 'Afirmativo' },
              { verbo: 'HE/SHE/IT IS…',  presente: 'Ele/Ela é/está',      passado: '3ª pessoa', participio: 'Afirmativo' },
              { verbo: 'WE ARE…',         presente: 'Nós somos/estamos',   passado: 'Plural',    participio: 'Afirmativo' },
              { verbo: 'THEY ARE…',       presente: 'Eles/Elas são/estão', passado: 'Plural',    participio: 'Afirmativo' },
              { verbo: 'I AM NOT…',       presente: 'Eu não sou/estou',    passado: '1ª pessoa', participio: 'Negativo' },
              { verbo: 'YOU ARE NOT…',    presente: 'Você não é/está',     passado: '2ª pessoa', participio: 'Negativo' },
              { verbo: 'HE/SHE IS NOT…', presente: 'Ele/Ela não é/está',  passado: '3ª pessoa', participio: 'Negativo' },
              { verbo: 'WE ARE NOT…',     presente: 'Nós não somos',       passado: 'Plural',    participio: 'Negativo' },
              { verbo: 'THEY ARE NOT…',   presente: 'Eles não são/estão',  passado: 'Plural',    participio: 'Negativo' },
            ]
          },

          // ── VOCABULÁRIO ─────────────────────────────────────────────────
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary – Adjetivos e Palavras Essenciais',
            palavras: [
              { en: 'tall',       pt: 'alto(a)' },
              { en: 'happy',      pt: 'feliz' },
              { en: 'Brazilian',  pt: 'brasileiro(a)' },
              { en: 'warm',       pt: 'quente / calor' },
              { en: 'good',       pt: 'bom / boa' },
              { en: 'hungry',     pt: 'com fome' },
              { en: 'thirsty',    pt: 'com sede' },
              { en: 'tired',      pt: 'cansado(a)' },
              { en: 'fast',       pt: 'rápido(a)' },
              { en: 'big',        pt: 'grande' },
              { en: 'teacher',    pt: 'professor(a)' },
              { en: 'mother',     pt: 'mãe' },
              { en: 'son',        pt: 'filho' },
              { en: 'children',   pt: 'filhos / crianças' },
              { en: 'job',        pt: 'trabalho / emprego' },
              { en: 'busy',       pt: 'ocupado(a)' },
              { en: 'a lot',      pt: 'muito(s)' },
              { en: 'How are you?', pt: 'Como você está?' },
              { en: 'I understand', pt: 'Eu entendo' },
              { en: 'Really?',    pt: 'Sério?' },
              { en: 'Why?',       pt: 'Por quê?' },
            ]
          },

          // ── EXERCÍCIOS ──────────────────────────────────────────────────
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Verbo TO BE',
            grupos: [
              {
                instrucao: 'Complete com a forma correta do verbo TO BE (am / is / are):',
                questoes: [
                  { pergunta: 'I ___ happy.',                      resposta: 'am' },
                  { pergunta: 'She ___ a teacher.',                 resposta: 'is' },
                  { pergunta: 'They ___ tired.',                    resposta: 'are' },
                  { pergunta: 'He ___ busy.',                       resposta: 'is' },
                  { pergunta: 'We ___ Brazilians.',                 resposta: 'are' },
                  { pergunta: 'Alex and Bruno ___ hungry.',         resposta: 'are' },
                  { pergunta: 'São Paulo ___ big.',                 resposta: 'is' },
                  { pergunta: 'You ___ fast.',                      resposta: 'are' },
                  { pergunta: 'Fernando ___ tired.',                resposta: 'is' },
                  { pergunta: 'Daniel and I ___ good.',             resposta: 'are' },
                ]
              },
              {
                instrucao: 'Forma NEGATIVA — adicione NOT:',
                questoes: [
                  { pergunta: 'I am tall → I am ___ tall.',             resposta: 'not' },
                  { pergunta: 'She is busy → She is ___ busy.',         resposta: 'not' },
                  { pergunta: 'He is Brazilian → He is ___ Brazilian.', resposta: 'not' },
                  { pergunta: 'It is warm → It is ___ warm.',           resposta: 'not' },
                  { pergunta: 'They are tired → They are ___ tired.',   resposta: 'not' },
                ]
              },
              {
                instrucao: 'Transforme em PERGUNTA (troque a ordem sujeito–verbo):',
                questoes: [
                  { pergunta: 'You are happy → ___ you happy?',        resposta: 'Are' },
                  { pergunta: 'She is a teacher → ___ she a teacher?', resposta: 'Is' },
                  { pergunta: 'They are busy → ___ they busy?',        resposta: 'Are' },
                  { pergunta: 'He is Brazilian → ___ he Brazilian?',   resposta: 'Is' },
                  { pergunta: 'It is warm → ___ it warm?',             resposta: 'Is' },
                ]
              },
              {
                instrucao: 'Arrume as palavras na ordem correta:',
                questoes: [
                  { pergunta: 'am / fast / I',             resposta: 'I am fast.' },
                  { pergunta: 'is / good / she',           resposta: 'She is good.' },
                  { pergunta: 'we / happy / are',          resposta: 'We are happy.' },
                  { pergunta: 'big / the black car / is',  resposta: 'The black car is big.' },
                  { pergunta: 'big / the black cars / are',resposta: 'The black cars are big.' },
                ]
              }
            ]
          }
        ]
      },
// ─────────────────────────────────────────────────────────────────────────────
// AULA 2 – Substitua o objeto da aula2 em src/data/myvoiceData.js
// ─────────────────────────────────────────────────────────────────────────────

      {
        id: 'aula2',
        numero: 2,
        titulo: 'Linda & Glynda – Aula 2',
        subtitulo: 'Perguntas com To Be · Família · Profissões',
        tag: 'Iniciante',
        sections: [
          // ── DIÁLOGO (original preservado) ──────────────────────────────
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            personagens: ['Linda', 'Glynda'],
            falas: [
              { personagem: 'Glynda', start: 1.0,  end: 4.29,  texto: 'Hello, Linda. You are quiet today. Are you okay?' },
              { personagem: 'Linda',  start: 4.89, end: 7.81,  texto: 'No, I am not okay. I am sad.' },
              { personagem: 'Glynda', start: 8.41, end: 10.97, texto: 'Why are you sad? Is everything ok?' },
              { personagem: 'Glynda', start: 11.57,end: 13.03, texto: 'Really? Where is he?' },
              { personagem: 'Linda',  start: 13.63,end: 15.09, texto: 'He is in Salvador.' },
              { personagem: 'Glynda', start: 15.69,end: 17.15, texto: 'Why is he there?' },
              { personagem: 'Linda',  start: 17.75,end: 19.58, texto: 'Because he is a businessman.' },
              { personagem: 'Glynda', start: 20.18,end: 23.1,  texto: 'What about your mother? Is she a businesswoman?' },
              { personagem: 'Linda',  start: 23.7, end: 25.53, texto: 'No, she is a teacher.' },
              { personagem: 'Glynda', start: 26.13,end: 27.96, texto: 'Is she a good teacher?' },
              { personagem: 'Linda',  start: 28.56,end: 31.12, texto: 'Yes, she is a very good teacher.' },
              { personagem: 'Glynda', start: 31.72,end: 35.37, texto: 'I have to go now. See you later. Bye, Linda.' },
              { personagem: 'Linda',  start: 35.97,end: 36.7,  texto: 'Bye, Glynda.' }
            ]
          },

          // ── FORMANDO PERGUNTAS COM TO BE ────────────────────────────────
          {
            type: 'verbos',
            titulo: '📘 Formando Perguntas com To Be',
            verbos: [
              { verbo: 'ARE you happy?',    presente: 'Yes, I AM happy.',       passado: 'No, I AM NOT happy.',       participio: 'troca I↔You' },
              { verbo: 'IS she a teacher?', presente: 'Yes, she IS a teacher.', passado: 'No, she IS NOT a teacher.', participio: '3ª pessoa' },
              { verbo: 'IS he Brazilian?',  presente: 'Yes, he IS Brazilian.',  passado: 'No, he IS NOT Brazilian.',  participio: '3ª pessoa' },
              { verbo: 'ARE they tired?',   presente: 'Yes, they ARE tired.',   passado: 'No, they ARE NOT tired.',   participio: 'plural' },
              { verbo: 'ARE we friends?',   presente: 'Yes, we ARE friends.',   passado: 'No, we ARE NOT friends.',   participio: 'plural' },
              { verbo: 'IS it warm?',       presente: 'Yes, it IS warm.',       passado: 'No, it IS NOT warm.',       participio: '3ª pessoa' },
            ]
          },

          // ── MAIS VERBOS ─────────────────────────────────────────────────
          {
            type: 'verbos',
            titulo: '📘 Mais Verbos – Presente · Passado · Particípio',
            verbos: [
              { verbo: 'TO BE (ser/estar)',   presente: 'am / is / are', passado: 'was / were', participio: 'been' },
              { verbo: 'TO WANT (querer)',    presente: 'want',          passado: 'wanted',     participio: 'wanted' },
              { verbo: 'TO EAT (comer)',      presente: 'eat',           passado: 'ate',        participio: 'eaten' },
              { verbo: 'TO GO (ir)',          presente: 'go',            passado: 'went',       participio: 'gone' },
              { verbo: 'TO HAVE (ter)',       presente: 'have / has',    passado: 'had',        participio: 'had' },
              { verbo: 'TO LIKE (gostar)',    presente: 'like',          passado: 'liked',      participio: 'liked' },
              { verbo: 'TO READ (ler)',       presente: 'read',          passado: 'read',       participio: 'read' },
              { verbo: 'TO SEE (ver)',        presente: 'see',           passado: 'saw',        participio: 'seen' },
              { verbo: 'TO WORK (trabalhar)', presente: 'work',          passado: 'worked',     participio: 'worked' },
              { verbo: 'TO COME (vir)',       presente: 'come',          passado: 'came',       participio: 'come' },
            ]
          },

          // ── VOCABULÁRIO ─────────────────────────────────────────────────
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary – Família, Profissões e Mais',
            palavras: [
              { en: 'father',        pt: 'pai' },
              { en: 'mother',        pt: 'mãe' },
              { en: 'family',        pt: 'família' },
              { en: 'brother',       pt: 'irmão' },
              { en: 'sister',        pt: 'irmã' },
              { en: 'son',           pt: 'filho' },
              { en: 'children',      pt: 'filhos / crianças' },
              { en: 'teacher',       pt: 'professor(a)' },
              { en: 'businessman',   pt: 'homem de negócios' },
              { en: 'businesswoman', pt: 'mulher de negócios' },
              { en: 'the',           pt: 'o / a / os / as' },
              { en: 'a / an',        pt: 'um / uma' },
              { en: 'mall',          pt: 'shopping' },
              { en: 'beach',         pt: 'praia' },
              { en: 'car',           pt: 'carro' },
              { en: 'food',          pt: 'comida' },
              { en: 'water',         pt: 'água' },
              { en: 'sad',           pt: 'triste' },
              { en: 'happy',         pt: 'feliz' },
              { en: 'okay / ok',     pt: 'bem' },
              { en: 'hot',           pt: 'quente' },
              { en: 'black',         pt: 'preto(a)' },
              { en: 'blue',          pt: 'azul' },
              { en: 'today',         pt: 'hoje' },
              { en: 'because',       pt: 'porque' },
              { en: 'very',          pt: 'muito' },
              { en: 'there',         pt: 'lá / ali' },
              { en: 'here',          pt: 'aqui' },
              { en: 'Are you okay?', pt: 'Você está bem?' },
              { en: 'Where is he?',  pt: 'Onde ele está?' },
              { en: 'See you later', pt: 'Até logo' },
            ]
          },

          // ── EXERCÍCIOS ──────────────────────────────────────────────────
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Perguntas com To Be e Vocabulário',
            grupos: [
              {
                instrucao: 'Forme PERGUNTAS trocando a ordem sujeito–verbo:',
                questoes: [
                  { pergunta: 'She is sad. → ___ she sad?',                   resposta: 'Is' },
                  { pergunta: 'He is a businessman. → ___ he a businessman?', resposta: 'Is' },
                  { pergunta: 'They are here. → ___ they here?',              resposta: 'Are' },
                  { pergunta: 'You are okay. → ___ you okay?',                resposta: 'Are' },
                  { pergunta: 'It is warm. → ___ it warm?',                   resposta: 'Is' },
                  { pergunta: 'The beach is hot. → ___ the beach hot?',       resposta: 'Is' },
                  { pergunta: 'The water is blue. → ___ the water blue?',     resposta: 'Is' },
                ]
              },
              {
                instrucao: 'Complete com a forma correta do verbo TO BE:',
                questoes: [
                  { pergunta: 'My father ___ in Salvador.',    resposta: 'is' },
                  { pergunta: 'My parents ___ happy.',         resposta: 'are' },
                  { pergunta: 'She ___ not a businesswoman.',  resposta: 'is' },
                  { pergunta: 'I ___ not okay today.',         resposta: 'am' },
                  { pergunta: 'Where ___ he?',                 resposta: 'is' },
                  { pergunta: 'The food ___ hot.',             resposta: 'is' },
                  { pergunta: 'The black cars ___ fast.',      resposta: 'are' },
                ]
              },
              {
                instrucao: 'Escreva a forma NEGATIVA ou a PERGUNTA conforme indicado:',
                questoes: [
                  { pergunta: 'You are happy → negativo: You are ___ happy.',         resposta: 'not' },
                  { pergunta: 'Bruno is hungry → negativo: Bruno is ___ hungry.',     resposta: 'not' },
                  { pergunta: 'The water is blue → pergunta: ___ the water blue?',    resposta: 'Is' },
                  { pergunta: 'He is Brazilian → pergunta: ___ he Brazilian?',        resposta: 'Is' },
                  { pergunta: 'The tall man is hungry → pergunta: ___ the tall man hungry?', resposta: 'Is' },
                ]
              },
              {
                instrucao: 'Resposta curta (Yes/No):',
                questoes: [
                  { pergunta: 'Is Linda sad? → Yes, ___ ___.',             resposta: 'she is' },
                  { pergunta: 'Is her father in São Paulo? → No, ___ ___.',resposta: "he isn't" },
                  { pergunta: 'Is her mother a teacher? → Yes, ___ ___.',  resposta: 'she is' },
                  { pergunta: 'Are they at home? → No, ___ ___.',          resposta: "they aren't" },
                  { pergunta: 'Are you happy? → Yes, ___ ___.',            resposta: 'I am' },
                ]
              }
            ]
          }
        ]
      },

        
      
      {
        id: 'aula3',
        numero: 3,
        titulo: 'Linda & Peter – Aula 3',
        subtitulo: 'Simple Past · Sentimentos · Ações do Passado',
        tag: 'Iniciante',
        sections: [
          {
            type: 'dialogo',
            titulo: '🔊 Word List & Expressions',
            audioSrc: `${AUDIO_BASE}/dialogo-aula3.mp3`,
            personagens: ['Narrator'],
            falas: [
              { personagem: 'Narrator', start: 0.0,  end: 17.8, texto: 'Verbs: Be · Was · Were · Been · Feel · Felt · Happen · Happened · Miss · Missed' },
              { personagem: 'Narrator', start: 18.2, end: 33.9, texto: 'Understand · Understood · Hear · Heard · Talk · Talked · Stay · Stayed' },
              { personagem: 'Narrator', start: 36.1, end: 46.0, texto: 'Trust · Trusted · Sound · Sounded · Love · Loved' },
              { personagem: 'Narrator', start: 0.0,  end: 2.0,  texto: 'Word List' },
              { personagem: 'Narrator', start: 4.0,  end: 6.0,  texto: 'Feelings' },
              { personagem: 'Narrator', start: 6.0,  end: 8.0,  texto: 'Sad' },
              { personagem: 'Narrator', start: 8.0,  end: 10.0, texto: 'Happy' },
              { personagem: 'Narrator', start: 10.0, end: 12.0, texto: 'Worry' },
              { personagem: 'Narrator', start: 14.0, end: 16.0, texto: 'Tired' },
              { personagem: 'Narrator', start: 16.0, end: 18.0, texto: 'Strong' },
              { personagem: 'Narrator', start: 20.0, end: 22.0, texto: 'Better' },
              { personagem: 'Narrator', start: 22.0, end: 24.0, texto: 'Alone' },
              { personagem: 'Narrator', start: 26.0, end: 28.0, texto: 'Difficult' },
              { personagem: 'Narrator', start: 28.0, end: 30.0, texto: 'Family' },
              { personagem: 'Narrator', start: 32.0, end: 34.0, texto: 'Father' },
              { personagem: 'Narrator', start: 34.0, end: 36.0, texto: 'Grandmother' },
              { personagem: 'Narrator', start: 36.0, end: 38.0, texto: 'Friend' },
              { personagem: 'Narrator', start: 42.0, end: 44.0, texto: 'Useful Expressions' },
              { personagem: 'Narrator', start: 46.0, end: 48.0, texto: 'I miss you' },
              { personagem: 'Narrator', start: 48.0, end: 50.0, texto: 'I am here for you' },
              { personagem: 'Narrator', start: 52.0, end: 54.0, texto: 'Stay strong' },
              { personagem: 'Narrator', start: 54.0, end: 56.0, texto: 'Trust God' },
              { personagem: 'Narrator', start: 58.0, end: 60.0, texto: 'Everything will be okay' },
              { personagem: 'Narrator', start: 62.0, end: 64.0, texto: 'Thank you for listening to me' }
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos do Diálogo',
            audioSrc: `${AUDIO_BASE}/dialogo-aula2.mp3`,
            verbos: [
              { verbo: 'TO LISTEN (ouvir)',     presente: 'listen',   passado: 'listened',    participio: 'listened',    start: 3.64,  end: 5.50  },
              { verbo: 'TO COME (vir)',         presente: 'come',     passado: 'came',        participio: 'come',        start: 6.97,  end: 8.59  },
              { verbo: 'TO RETURN (voltar)',    presente: 'return',   passado: 'returned',    participio: 'returned',    start: 10.23, end: 12.73 },
              { verbo: 'TO HOPE (esperar)',     presente: 'hope',     passado: 'hoped',       participio: 'hoped',       start: 14.74, end: 16.67 },
              { verbo: 'TO HELP (ajudar)',      presente: 'help',     passado: 'helped',      participio: 'helped',      start: 18.54, end: 20.36 },
              { verbo: 'TO SMILE (sorrir)',     presente: 'smile',    passado: 'smiled',      participio: 'smiled',      start: 21.84, end: 24.31 },
              { verbo: 'TO PRAY (rezar)',       presente: 'pray',     passado: 'prayed',      participio: 'prayed',      start: 26.35, end: 28.24 },
              { verbo: 'TO WORRY (preocupar)', presente: 'worry',    passado: 'worried',     participio: 'worried',     start: 30.08, end: 32.28 },
              { verbo: 'TO REMEMBER (lembrar)',presente: 'remember', passado: 'remembered',  participio: 'remembered',  start: 33.83, end: 36.39 },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'worried',            pt: 'preocupado(a)' },
              { en: 'calm',               pt: 'calmo(a)' },
              { en: 'glad',               pt: 'contente / feliz' },
              { en: 'beautiful',          pt: 'bonito(a)' },
              { en: 'again',              pt: 'de novo' },
              { en: 'still',              pt: 'ainda' },
              { en: 'always',             pt: 'sempre' },
              { en: 'a long time',        pt: 'um longo tempo' },
              { en: 'the right things',   pt: 'as coisas certas' },
              { en: 'that means a lot',   pt: 'isso significa muito' },
              { en: 'I am here for you',  pt: 'Estou aqui por você' },
              { en: 'Don\'t worry',       pt: 'Não se preocupe' },
              { en: 'Did you listen?',    pt: 'Você ouviu?' },
              { en: 'I liked it',         pt: 'Eu gostei' },
              { en: 'I remembered',       pt: 'Eu me lembrei' },
            ]
          },
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Simple Past',
            grupos: [
              {
                instrucao: 'Complete com o Simple Past do verbo:',
                questoes: [
                  { pergunta: 'She ___ (listen) to the music.',   resposta: 'listened' },
                  { pergunta: 'He ___ (smile) when he heard it.', resposta: 'smiled' },
                  { pergunta: 'They ___ (return) home early.',    resposta: 'returned' },
                  { pergunta: 'I ___ (remember) the first time.', resposta: 'remembered' },
                  { pergunta: 'She ___ (stay) calm.',             resposta: 'stayed' },
                ]
              },
              {
                instrucao: 'Forma negativa com didn\'t:',
                questoes: [
                  { pergunta: 'He listened → He ___ listen.',   resposta: 'didn\'t' },
                  { pergunta: 'She smiled → She ___ smile.',    resposta: 'didn\'t' },
                  { pergunta: 'They returned → They ___ return.', resposta: 'didn\'t' },
                ]
              },
              {
                instrucao: 'Forme perguntas com Did:',
                questoes: [
                  { pergunta: 'She listened. → ___ she listen?',   resposta: 'Did' },
                  { pergunta: 'He returned. → ___ he return?',     resposta: 'Did' },
                  { pergunta: 'They worried. → ___ they worry?',   resposta: 'Did' },
                  { pergunta: 'You remembered. → ___ you remember?', resposta: 'Did' },
                ]
              },
              {
                instrucao: 'Respostas curtas:',
                questoes: [
                  { pergunta: 'Did she smile? → Yes, ___ ___',    resposta: 'she did' },
                  { pergunta: 'Did he worry? → No, ___ ___',      resposta: 'he didn\'t' },
                  { pergunta: 'Did you listen? → Yes, ___ ___',   resposta: 'I did' },
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'aula4',
        numero: 4,
        titulo: 'Dalit & Susie – Aula 4',
        subtitulo: 'Apoio Emocional · Família · Simple Past',
        tag: 'Iniciante',
        sections: [
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            audioSrc: `${AUDIO_BASE}/dialogo-aula4.mp3`,
            personagens: ['Susie', 'Dalit'],
            falas: [
              { personagem: 'Susie',  start: 0.90, end: 2.51,  texto: 'Dalit, can I tell you something else?' },
              { personagem: 'Dalit',  start: 2.69, end: 4.13,  texto: "Of course, Susie. I'm listening." },
              { personagem: 'Susie',  start: 4.25, end: 6.26,  texto: 'My grandmother always talks to me on the phone.' },
              { personagem: 'Dalit',  start: 6.42, end: 7.32,  texto: "That's very special." },
              { personagem: 'Susie',  start: 7.51, end: 9.85,  texto: 'Yes, she tells me to stay strong and trust God.' },
              { personagem: 'Dalit',  start: 10.22, end: 11.82, texto: 'Your grandmother sounds very wise.' },
              { personagem: 'Susie',  start: 12.17, end: 12.53, texto: 'She is.' },
              { personagem: 'Susie',  start: 12.73, end: 14.28, texto: 'I love listening to her stories.' },
              { personagem: 'Dalit',  start: 14.65, end: 15.42, texto: "That's wonderful." },
              { personagem: 'Susie',  start: 15.81, end: 17.26, texto: 'I already feel a little better now.' },
              { personagem: 'Dalit',  start: 17.51, end: 18.86, texto: "I'm happy to hear that, Susie." }
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos do Diálogo',
            audioSrc: `${AUDIO_BASE}/verbos-aula4.mp3`,
            verbos: [
              { verbo: 'TO BE (ser/estar)',           presente: 'am/is/are', passado: 'was/were',   participio: 'been',        start:  2.66, end:  5.36 },
              { verbo: 'TO FEEL (sentir)',            presente: 'feel',      passado: 'felt',        participio: 'felt',        start:  7.20, end:  8.72 },
              { verbo: 'TO HAPPEN (acontecer)',       presente: 'happen',    passado: 'happened',    participio: 'happened',    start: 10.84, end: 12.46 },
              { verbo: 'TO MISS (sentir falta)',      presente: 'miss',      passado: 'missed',      participio: 'missed',      start: 14.64, end: 16.52 },
              { verbo: 'TO UNDERSTAND (entender)',    presente: 'understand', passado: 'understood', participio: 'understood',  start: 18.28, end: 20.97 },
              { verbo: 'TO HEAR (ouvir)',             presente: 'hear',      passado: 'heard',       participio: 'heard',       start: 23.19, end: 24.53 },
              { verbo: 'TO TALK (conversar)',         presente: 'talk',      passado: 'talked',      participio: 'talked',      start: 27.66, end: 28.39 },
              { verbo: 'TO STAY (ficar)',             presente: 'stay',      passado: 'stayed',      participio: 'stayed',      start: 32.21, end: 33.94 },
              { verbo: 'TO TRUST (confiar)',          presente: 'trust',     passado: 'trusted',     participio: 'trusted',     start: 36.13, end: 38.04 },
              { verbo: 'TO SOUND (soar)',             presente: 'sound',     passado: 'sounded',     participio: 'sounded',     start: 39.97, end: 42.39 },
              { verbo: 'TO LOVE (amar)',              presente: 'love',      passado: 'loved',       participio: 'loved',       start: 44.28, end: 45.97 },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'grandmother',             pt: 'avó' },
              { en: 'grandfather',             pt: 'avô' },
              { en: 'friend',                  pt: 'amigo(a)' },
              { en: 'alone',                   pt: 'sozinho(a)' },
              { en: 'far away',                pt: 'longe' },
              { en: 'strong',                  pt: 'forte' },
              { en: 'kind',                    pt: 'gentil' },
              { en: 'wise',                    pt: 'sábio(a)' },
              { en: 'funny',                   pt: 'engraçado(a)' },
              { en: 'down',                    pt: 'desanimado(a)' },
              { en: 'hard',                    pt: 'difícil' },
              { en: 'wonderful',               pt: 'maravilhoso(a)' },
              { en: 'I miss you',              pt: 'Sinto sua falta' },
              { en: 'I am here for you',       pt: 'Estou aqui por você' },
              { en: 'Stay strong',             pt: 'Mantenha-se forte' },
              { en: 'Everything will be okay', pt: 'Tudo vai ficar bem' },
              { en: 'Thank you for listening', pt: 'Obrigado por ouvir' },
              { en: 'That\'s what friends are for', pt: 'É para isso que servem os amigos' },
            ]
          },
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Sentimentos e Família',
            grupos: [
              {
                instrucao: 'Complete com o Simple Past:',
                questoes: [
                  { pergunta: 'I ___ (feel) alone yesterday.',           resposta: 'felt' },
                  { pergunta: 'She ___ (spend) time with her grandmother.', resposta: 'spent' },
                  { pergunta: 'He ___ (miss) his family.',               resposta: 'missed' },
                  { pergunta: 'They ___ (know) each other.',             resposta: 'knew' },
                  { pergunta: 'She ___ (tell) me everything.',           resposta: 'told' },
                ]
              },
              {
                instrucao: 'Escolha a palavra correta:',
                questoes: [
                  { pergunta: 'She is ___ (kind/kinds). She always helps.',    resposta: 'kind' },
                  { pergunta: 'He feels ___ (alone/lonely) without his family.',resposta: 'alone' },
                  { pergunta: 'My grandmother was very ___ (wise/wisely).',    resposta: 'wise' },
                  { pergunta: 'Stay ___ (strong/strongly). Everything will be okay.', resposta: 'strong' },
                ]
              },
              {
                instrucao: 'Traduza para o inglês:',
                questoes: [
                  { pergunta: 'Sinto falta da minha avó. → I ___ my grandmother.',resposta: 'miss' },
                  { pergunta: 'Estou aqui por você. → I am ___ for you.',        resposta: 'here' },
                  { pergunta: 'Tudo vai ficar bem. → Everything will be ___.',   resposta: 'okay' },
                  { pergunta: 'Obrigado por ouvir. → Thank you for ___.',        resposta: 'listening' },
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'aula5',
        numero: 5,
        titulo: 'Dalit & Susie – Aula 5',
        subtitulo: 'Orgulho e Conquistas · Família · Simple Present & Past',
        tag: 'Iniciante',
        sections: [
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            audioSrc: `${AUDIO_BASE}/dialogo-aula5.mp3`,
            personagens: ['Dalit'],
            falas: [
              { personagem: 'Dalit', start: 2.68,  end: 4.36,  texto: "Of course, Susie, I'm listening." },
              { personagem: 'Dalit', start: 7.45,  end: 8.78,  texto: "That's very special." },
              { personagem: 'Dalit', start: 12.49, end: 14.56, texto: 'Your grandmother sounds very wise.' },
              { personagem: 'Dalit', start: 17.22, end: 18.34, texto: "That's wonderful." },
              { personagem: 'Dalit', start: 20.76, end: 22.72, texto: "I'm happy to hear that, Susie." }
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos do Diálogo',
            useTTS: true,
            verbos: [
              { verbo: 'TO HEAR (ouvir/saber)',      presente: 'hear',      passado: 'heard',     participio: 'heard',
                audioClip: { src: `${AUDIO_BASE}/verbos-aula4.mp3`, start: 23.19, end: 24.53 } },
              { verbo: 'TO BELIEVE (acreditar)',     presente: 'believe',   passado: 'believed',  participio: 'believed' },
              { verbo: 'TO CHOOSE (escolher)',       presente: 'choose',    passado: 'chose',     participio: 'chosen' },
              { verbo: 'TO CELEBRATE (celebrar)',    presente: 'celebrate', passado: 'celebrated',participio: 'celebrated' },
              { verbo: 'TO FEEL (sentir)',            presente: 'feel',      passado: 'felt',      participio: 'felt',
                audioClip: { src: `${AUDIO_BASE}/verbos-aula4.mp3`, start: 7.20, end: 8.72 } },
              { verbo: 'TO GIVE UP (desistir)',       presente: 'give up',   passado: 'gave up',   participio: 'given up' },
              { verbo: 'TO INSPIRE (inspirar)',      presente: 'inspire',   passado: 'inspired',  participio: 'inspired' },
              { verbo: 'TO WORK (trabalhar)',        presente: 'work',      passado: 'worked',    participio: 'worked' },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'proud',           pt: 'orgulhoso(a)' },
              { en: 'amazing',         pt: 'incrível' },
              { en: 'wonderful',       pt: 'maravilhoso(a)' },
              { en: 'inspired',        pt: 'inspirado(a)' },
              { en: 'soccer star',     pt: 'estrela do futebol' },
              { en: 'a big deal',      pt: 'algo importante' },
              { en: 'especially',      pt: 'especialmente' },
              { en: 'still',           pt: 'ainda' },
              { en: 'energy',          pt: 'energia' },
              { en: 'example',         pt: 'exemplo' },
              { en: 'never give up',   pt: 'nunca desista' },
              { en: 'work hard',       pt: 'trabalhe duro' },
              { en: 'be kind',         pt: 'seja gentil' },
              { en: 'I am proud of her', pt: 'Tenho orgulho dela' },
              { en: 'She must be',     pt: 'Ela deve ser' },
              { en: 'full of energy',  pt: 'cheio(a) de energia' },
              { en: 'Congratulations!',pt: 'Parabéns!' },
              { en: 'Tell me more',    pt: 'Me conte mais' },
            ]
          },
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Orgulho e Conquistas',
            grupos: [
              {
                instrucao: 'Complete com o Simple Past ou Present:',
                questoes: [
                  { pergunta: 'She ___ (choose) to play in a new team.',      resposta: 'chose' },
                  { pergunta: 'I ___ (hear) about your sister.',              resposta: 'heard' },
                  { pergunta: 'My grandmother always ___ (believe) in me.',   resposta: 'believed' },
                  { pergunta: 'He ___ (feel) inspired after the speech.',     resposta: 'felt' },
                  { pergunta: 'They ___ (celebrate) together.',               resposta: 'celebrated' },
                ]
              },
              {
                instrucao: 'Complete com a palavra correta:',
                questoes: [
                  { pergunta: 'I am so ___ of her. (proud / proudly)',   resposta: 'proud' },
                  { pergunta: 'Never ___ up! (give / gave)',             resposta: 'give' },
                  { pergunta: 'She is ___ in her eighties. (still / yet)', resposta: 'still' },
                  { pergunta: 'That is a ___ deal! (big / bigger)',      resposta: 'big' },
                ]
              },
              {
                instrucao: 'Traduza para o inglês:',
                questoes: [
                  { pergunta: 'Tenho orgulho dela. → I am ___ of her.',  resposta: 'proud' },
                  { pergunta: 'Nunca desista. → Never ___ up.',          resposta: 'give' },
                  { pergunta: 'Ela é incrível. → She is ___.',           resposta: 'amazing' },
                  { pergunta: 'Parabéns! → ___!',                        resposta: 'Congratulations' },
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

export default myVoiceData;
