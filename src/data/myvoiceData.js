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
            audioSrc: `${AUDIO_BASE}/dialogo-aula1.mp3`,
            personagens: ['Linda', 'Glynda'],
            falas: [
              { personagem: 'Linda', start: 1.0, end: 4.24, texto: 'Hi, Glynda. How are you?' },
              { personagem: 'Linda', start: 4.84, end: 11.97, texto: 'I understand. I love my job, but my days are busy.' },
              { personagem: 'Linda', start: 12.57, end: 14.52, texto: 'Really? Why not?' },
              { personagem: 'Linda', start: 15.12, end: 24.85, texto: 'I see… I have three children, and I spend a lot of time with them.' },
              { personagem: 'Glynda', start: 25.45, end: 36.47, texto: 'That is very good. I have one son, and I want to spend more time with him.' },
              { personagem: 'Linda', start: 37.07, end: 41.61, texto: 'Maybe you can start with small changes.' },
              { personagem: 'Glynda', start: 42.21, end: 46.1, texto: 'Yes… I think I need that.' }
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos do Diálogo',
            verbos: [
              { verbo: 'TO BE (ser/estar)',           presente: 'am / is / are', passado: 'was / were', participio: 'been' },
              { verbo: 'TO LOVE (amar)',               presente: 'love',          passado: 'loved',      participio: 'loved' },
              { verbo: 'TO UNDERSTAND (entender)',     presente: 'understand',    passado: 'understood', participio: 'understood' },
              { verbo: 'TO HAVE (ter)',                presente: 'have',          passado: 'had',        participio: 'had' },
              { verbo: 'TO SPEND (gastar/passar tempo)',presente: 'spend',        passado: 'spent',      participio: 'spent' },
              { verbo: 'TO TRY (tentar)',              presente: 'try',           passado: 'tried',      participio: 'tried' },
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
              { en: 'That\'s nice',  pt: 'Que bom' },
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
                  { pergunta: 'I ___ happy.',       resposta: 'am' },
                  { pergunta: 'She ___ a teacher.', resposta: 'is' },
                  { pergunta: 'They ___ tired.',    resposta: 'are' },
                  { pergunta: 'He ___ busy.',       resposta: 'is' },
                  { pergunta: 'We ___ friends.',    resposta: 'are' },
                ]
              },
              {
                instrucao: 'Forma negativa (adicione not):',
                questoes: [
                  { pergunta: 'I am happy → I am ___ happy',       resposta: 'not' },
                  { pergunta: 'She is busy → She is ___ busy',     resposta: 'not' },
                  { pergunta: 'They are tired → They are ___ tired',resposta: 'not' },
                ]
              },
              {
                instrucao: 'Transforme em pergunta:',
                questoes: [
                  { pergunta: 'You are happy → ___ you happy?',    resposta: 'Are' },
                  { pergunta: 'She is a teacher → ___ she a teacher?', resposta: 'Is' },
                  { pergunta: 'They are busy → ___ they busy?',    resposta: 'Are' },
                ]
              },
              {
                instrucao: 'Respostas curtas:',
                questoes: [
                  { pergunta: 'Are you tired? → Yes, I ___',        resposta: 'am' },
                  { pergunta: 'Is she a teacher? → Yes, she ___',   resposta: 'is' },
                  { pergunta: 'Are they busy? → Yes, they ___',     resposta: 'are' },
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
            audioSrc: `${AUDIO_BASE}/dialogo-aula2.mp3`,
            personagens: ['Linda', 'Glynda'],
            falas: [
              { personagem: 'Glynda', start: 1.0, end: 4.29, texto: 'Hello, Linda. You are quiet today. Are you okay?' },
              { personagem: 'Linda', start: 4.89, end: 7.81, texto: 'No, I am not okay. I am sad.' },
              { personagem: 'Glynda', start: 8.41, end: 10.97, texto: 'Why are you sad? Is everything ok?' },
              { personagem: 'Glynda', start: 11.57, end: 13.03, texto: 'Really? Where is he?' },
              { personagem: 'Linda', start: 13.63, end: 15.09, texto: 'He is in Salvador.' },
              { personagem: 'Glynda', start: 15.69, end: 17.15, texto: 'Why is he there?' },
              { personagem: 'Linda', start: 17.75, end: 19.58, texto: 'Because he is a businessman.' },
              { personagem: 'Glynda', start: 20.18, end: 23.1, texto: 'What about your mother? Is she a businesswoman?' },
              { personagem: 'Linda', start: 23.7, end: 25.53, texto: 'No, she is a teacher.' },
              { personagem: 'Glynda', start: 26.13, end: 27.96, texto: 'Is she a good teacher?' },
              { personagem: 'Linda', start: 28.56, end: 31.12, texto: 'Yes, she is a very good teacher.' },
              { personagem: 'Glynda', start: 31.72, end: 35.37, texto: 'I have to go now. See you later. Bye, Linda.' },
              { personagem: 'Linda', start: 35.97, end: 36.7, texto: 'Bye, Glynda.' }
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos da Aula',
            verbos: [
              { verbo: 'TO BE (ser/estar)',         presente: 'am / is / are',  passado: 'was / were', participio: 'been' },
              { verbo: 'TO COME (vir)',             presente: 'come',           passado: 'came',       participio: 'come' },
              { verbo: 'TO HAVE (ter)',             presente: 'have / has',     passado: 'had',        participio: 'had' },
              { verbo: 'TO GO (ir)',                presente: 'go',             passado: 'went',       participio: 'gone' },
              { verbo: 'TO SEE (ver)',              presente: 'see',            passado: 'saw',        participio: 'seen' },
              { verbo: 'TO UNDERSTAND (entender)', presente: 'understand',     passado: 'understood', participio: 'understood' },
              { verbo: 'TO CALL (ligar/chamar)',    presente: 'call',           passado: 'called',     participio: 'called' },
              { verbo: 'TO WORK (trabalhar)',       presente: 'work',           passado: 'worked',     participio: 'worked' },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'father',          pt: 'pai' },
              { en: 'mother',          pt: 'mãe' },
              { en: 'family',          pt: 'família' },
              { en: 'children',        pt: 'filhos / crianças' },
              { en: 'son',             pt: 'filho' },
              { en: 'teacher',         pt: 'professor(a)' },
              { en: 'businessman',     pt: 'homem de negócios' },
              { en: 'businesswoman',   pt: 'mulher de negócios' },
              { en: 'here',            pt: 'aqui' },
              { en: 'there',           pt: 'lá' },
              { en: 'holiday',         pt: 'feriado' },
              { en: 'sad',             pt: 'triste' },
              { en: 'happy',           pt: 'feliz' },
              { en: 'okay / ok',       pt: 'bem' },
              { en: 'busy',            pt: 'ocupado' },
              { en: 'excited',         pt: 'animado' },
              { en: 'Are you okay?',   pt: 'Você está bem?' },
              { en: 'Where is he?',    pt: 'Onde ele está?' },
              { en: 'Is he on vacation?', pt: 'Ele está de férias?' },
              { en: 'Is she a teacher?',  pt: 'Ela é professora?' },
              { en: 'Are they happy?', pt: 'Eles estão felizes?' },
              { en: 'today',           pt: 'hoje' },
              { en: 'now',             pt: 'agora' },
              { en: 'with',            pt: 'com' },
              { en: 'without',         pt: 'sem' },
              { en: 'because',         pt: 'porque' },
              { en: 'very',            pt: 'muito' },
            ]
          },
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Perguntas com To Be',
            grupos: [
              {
                instrucao: 'Forme perguntas (troque a ordem do sujeito e verbo):',
                questoes: [
                  { pergunta: 'She is sad. → ___ she sad?',               resposta: 'Is' },
                  { pergunta: 'He is a businessman. → ___ he a businessman?', resposta: 'Is' },
                  { pergunta: 'They are here. → ___ they here?',          resposta: 'Are' },
                  { pergunta: 'You are okay. → ___ you okay?',            resposta: 'Are' },
                  { pergunta: 'It is a holiday. → ___ it a holiday?',     resposta: 'Is' },
                ]
              },
              {
                instrucao: 'Complete com o verbo TO BE correto:',
                questoes: [
                  { pergunta: 'My father ___ in Salvador.',       resposta: 'is' },
                  { pergunta: 'My parents ___ happy.',            resposta: 'are' },
                  { pergunta: 'She ___ not a businesswoman.',     resposta: 'is' },
                  { pergunta: 'I ___ not okay today.',            resposta: 'am' },
                  { pergunta: 'Where ___ he?',                    resposta: 'is' },
                ]
              },
              {
                instrucao: 'Resposta curta (Yes/No):',
                questoes: [
                  { pergunta: 'Is Linda sad? → Yes, ___ ___',               resposta: 'she is' },
                  { pergunta: 'Is her father in São Paulo? → No, ___ ___',  resposta: 'he isn\'t' },
                  { pergunta: 'Is her mother a teacher? → Yes, ___ ___',    resposta: 'she is' },
                  { pergunta: 'Are they at home? → No, ___ ___',            resposta: 'they aren\'t' },
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
            verbos: [
              { verbo: 'TO LISTEN (ouvir)',         presente: 'listen',    passado: 'listened',    participio: 'listened' },
              { verbo: 'TO SMILE (sorrir)',          presente: 'smile',     passado: 'smiled',      participio: 'smiled' },
              { verbo: 'TO WORRY (preocupar)',       presente: 'worry',     passado: 'worried',     participio: 'worried' },
              { verbo: 'TO RETURN (voltar)',         presente: 'return',    passado: 'returned',    participio: 'returned' },
              { verbo: 'TO REMEMBER (lembrar)',      presente: 'remember',  passado: 'remembered',  participio: 'remembered' },
              { verbo: 'TO STAY (ficar)',            presente: 'stay',      passado: 'stayed',      participio: 'stayed' },
              { verbo: 'TO TRUST (confiar)',         presente: 'trust',     passado: 'trusted',     participio: 'trusted' },
              { verbo: 'TO UNDERSTAND (entender)',   presente: 'understand',passado: 'understood',  participio: 'understood' },
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
              { personagem: 'Susie',  start: 0.0,  end: 2.7,  texto: 'Dalit, can I tell you something else?' },
              { personagem: 'Dalit',  start: 2.7,  end: 4.2,  texto: "Of course, Susie. I'm listening." },
              { personagem: 'Susie',  start: 4.2,  end: 6.4,  texto: 'My grandmother always talks to me on the phone.' },
              { personagem: 'Dalit',  start: 6.4,  end: 7.5,  texto: "That's very special." },
              { personagem: 'Susie',  start: 7.5,  end: 10.2, texto: 'Yes, she tells me to stay strong and trust God.' },
              { personagem: 'Dalit',  start: 10.2, end: 12.1, texto: 'Your grandmother sounds very wise.' },
              { personagem: 'Susie',  start: 12.1, end: 12.9, texto: 'She is.' },
              { personagem: 'Susie',  start: 12.9, end: 14.6, texto: 'I love listening to her stories.' },
              { personagem: 'Dalit',  start: 14.6, end: 15.8, texto: "That's wonderful." },
              { personagem: 'Susie',  start: 15.8, end: 17.5, texto: 'I already feel a little better now.' },
              { personagem: 'Dalit',  start: 17.5, end: 19.0, texto: "I'm happy to hear that, Susie." }
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos do Diálogo',
            verbos: [
              { verbo: 'TO MISS (sentir falta)',     presente: 'miss',    passado: 'missed',  participio: 'missed' },
              { verbo: 'TO FEEL (sentir)',            presente: 'feel',    passado: 'felt',    participio: 'felt' },
              { verbo: 'TO HAPPEN (acontecer)',       presente: 'happen',  passado: 'happened',participio: 'happened' },
              { verbo: 'TO SPEND (passar tempo)',     presente: 'spend',   passado: 'spent',   participio: 'spent' },
              { verbo: 'TO LOVE (amar)',              presente: 'love',    passado: 'loved',   participio: 'loved' },
              { verbo: 'TO KNOW (saber/conhecer)',    presente: 'know',    passado: 'knew',    participio: 'known' },
              { verbo: 'TO TELL (contar)',            presente: 'tell',    passado: 'told',    participio: 'told' },
              { verbo: 'TO LISTEN (ouvir)',           presente: 'listen',  passado: 'listened',participio: 'listened' },
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
        titulo: 'Linda & Peter – Aula 5',
        subtitulo: 'Orgulho e Conquistas · Família · Simple Present & Past',
        tag: 'Iniciante',
        sections: [
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            personagens: ['Linda', 'Peter'],
            falas: [
              { personagem: 'Linda', texto: 'Peter, I heard about your sister Suzie. Congratulations!' },
              { personagem: 'Peter', texto: 'Thank you! I am so proud of her. She is amazing.' },
              { personagem: 'Linda', texto: 'Tell me more. What did she do?' },
              { personagem: 'Peter', texto: 'She is a soccer star. She has chosen to play in a new team. It is a big deal.' },
              { personagem: 'Linda', texto: 'That is wonderful! How does your family feel?' },
              { personagem: 'Peter', texto: 'We are all very happy. My grandmother is especially proud. She always believed in Suzie.' },
              { personagem: 'Linda', texto: 'Your grandmother sounds very special. Is she still doing well?' },
              { personagem: 'Peter', texto: 'Yes! She is in her eighties, but she is still very wise and full of energy.' },
              { personagem: 'Linda', texto: 'I am so happy to hear that. She must be a great example for your family.' },
              { personagem: 'Peter', texto: 'She is. She always says: work hard, be kind, and never give up.' },
              { personagem: 'Linda', texto: 'That is beautiful. I feel inspired just hearing that.' },
              { personagem: 'Peter', texto: 'Of course! And I am happy you are here to celebrate with us, Linda.' },
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos do Diálogo',
            verbos: [
              { verbo: 'TO HEAR (ouvir/saber)',      presente: 'hear',      passado: 'heard',     participio: 'heard' },
              { verbo: 'TO BELIEVE (acreditar)',     presente: 'believe',   passado: 'believed',  participio: 'believed' },
              { verbo: 'TO CHOOSE (escolher)',       presente: 'choose',    passado: 'chose',     participio: 'chosen' },
              { verbo: 'TO CELEBRATE (celebrar)',    presente: 'celebrate', passado: 'celebrated',participio: 'celebrated' },
              { verbo: 'TO FEEL (sentir)',            presente: 'feel',      passado: 'felt',      participio: 'felt' },
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
