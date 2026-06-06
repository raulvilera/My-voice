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
            personagens: ['Linda', 'Glynda'],
            falas: [
              { personagem: 'Linda',  texto: 'Hi, Glynda. How are you?' },
              { personagem: 'Glynda', texto: 'Hi, Linda. I\'m okay… just a little tired.' },
              { personagem: 'Linda',  texto: 'I understand. I love my job, but my days are busy.' },
              { personagem: 'Glynda', texto: 'I have a good job. I make a lot of money, but I\'m not happy.' },
              { personagem: 'Linda',  texto: 'Really? Why not?' },
              { personagem: 'Glynda', texto: 'I work a lot. I don\'t have much time for my son.' },
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
            personagens: ['Linda', 'Glynda'],
            falas: [
              { personagem: 'Glynda', texto: 'Hello, Linda. You are quiet today. Are you okay?' },
              { personagem: 'Linda',  texto: 'No, I am not okay. I am sad.' },
              { personagem: 'Glynda', texto: 'Why are you sad? Is everything ok?' },
              { personagem: 'Linda',  texto: 'Today is a holiday and my family is here but my father can\'t come.' },
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
            titulo: '💬 Diálogo',
            personagens: ['Linda', 'Peter'],
            falas: [
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula3-01.mp3`, texto: 'Hi, Linda. Did you listen to the music I sent you?' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula3-02.mp3`, texto: 'Yes, I listened. It was beautiful. I smiled when I heard it.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula3-03.mp3`, texto: 'I am glad. I was worried you did not like it.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula3-04.mp3`, texto: 'I liked it very much. I returned home, sat down, and listened again.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula3-05.mp3`, texto: 'Did you remember the first time we talked about music?' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula3-06.mp3`, texto: 'Yes, I remembered. You stayed calm and talked to me for a long time.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula3-07.mp3`, texto: 'I always trusted that you understood me.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula3-08.mp3`, texto: 'I did. And I still do. You always say the right things.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula3-09.mp3`, texto: 'Thank you, Linda. That means a lot.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula3-10.mp3`, texto: 'Don\'t worry. I am here for you too.' },
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
        titulo: 'Linda & Peter – Aula 4',
        subtitulo: 'Apoio Emocional · Família · Simple Past',
        tag: 'Iniciante',
        sections: [
          {
            type: 'dialogo',
            titulo: '💬 Diálogo',
            personagens: ['Linda', 'Peter'],
            falas: [
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula4-01.mp3`, texto: 'Linda, can I talk to you? I am feeling a little down today.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula4-02.mp3`, texto: 'Of course, Peter. I am here. What happened?' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula4-03.mp3`, texto: 'I miss my family. My father, my mother, my grandmother… they are far away.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula4-04.mp3`, texto: 'I understand. Being away from family is really hard.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula4-05.mp3`, texto: 'I am tired. I feel alone sometimes. My old friends are gone.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula4-06.mp3`, texto: 'Peter, I know it is not easy. But you are strong. You are not alone.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula4-07.mp3`, texto: 'Thank you. I miss my grandmother the most. She was always there for me.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula4-08.mp3`, texto: 'She sounds like a wonderful person. Tell me about her.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula4-09.mp3`, texto: 'She was kind, wise, and very funny. I loved spending time with her.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula4-10.mp3`, texto: 'I am here for you, Peter. Stay strong. Everything will be okay.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula4-11.mp3`, texto: 'Thank you for listening to me, Linda.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula4-12.mp3`, texto: 'Always. That\'s what friends are for.' },
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
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula5-01.mp3`, texto: 'Peter, I heard about your sister Suzie. Congratulations!' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula5-02.mp3`, texto: 'Thank you! I am so proud of her. She is amazing.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula5-03.mp3`, texto: 'Tell me more. What did she do?' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula5-04.mp3`, texto: 'She is a soccer star. She has chosen to play in a new team. It is a big deal.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula5-05.mp3`, texto: 'That is wonderful! How does your family feel?' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula5-06.mp3`, texto: 'We are all very happy. My grandmother is especially proud. She always believed in Suzie.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula5-07.mp3`, texto: 'Your grandmother sounds very special. Is she still doing well?' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula5-08.mp3`, texto: 'Yes! She is in her eighties, but she is still very wise and full of energy.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula5-09.mp3`, texto: 'I am so happy to hear that. She must be a great example for your family.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula5-10.mp3`, texto: 'She is. She always says: work hard, be kind, and never give up.' },
              { personagem: 'Linda', audioUrl: `${AUDIO_BASE}/aula5-11.mp3`, texto: 'That is beautiful. I feel inspired just hearing that.' },
              { personagem: 'Peter', audioUrl: `${AUDIO_BASE}/aula5-12.mp3`, texto: 'Of course! And I am happy you are here to celebrate with us, Linda.' },
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
