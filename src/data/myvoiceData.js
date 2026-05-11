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
              { personagem: 'Linda', texto: 'Hi, Glynda. How are you?' },
              { personagem: 'Glynda', texto: 'Hi, Linda. I\'m okay… just a little tired.' },
              { personagem: 'Linda', texto: 'I understand. I love my job, but my days are busy.' },
              { personagem: 'Glynda', texto: 'I have a good job. I make a lot of money, but I\'m not happy.' },
              { personagem: 'Linda', texto: 'Really? Why not?' },
              { personagem: 'Glynda', texto: 'I work a lot. I don\'t have much time for my son.' },
              { personagem: 'Linda', texto: 'I see… I have three children, and I spend a lot of time with them.' },
              { personagem: 'Glynda', texto: 'That is very good. I have one son, and I want to spend more time with him.' },
              { personagem: 'Linda', texto: 'Maybe you can start with small changes.' },
              { personagem: 'Glynda', texto: 'Yes… I think I need that.' },
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos do Diálogo',
            verbos: [
              { verbo: 'TO BE (ser/estar)', presente: 'am / is / are', passado: 'was / were', participio: 'been' },
              { verbo: 'TO LOVE (amar)', presente: 'love', passado: 'loved', participio: 'loved' },
              { verbo: 'TO UNDERSTAND (entender)', presente: 'understand', passado: 'understood', participio: 'understood' },
              { verbo: 'TO HAVE (ter)', presente: 'have', passado: 'had', participio: 'had' },
              { verbo: 'TO SPEND (gastar/passar tempo)', presente: 'spend', passado: 'spent', participio: 'spent' },
              { verbo: 'TO TRY (tentar)', presente: 'try', passado: 'tried', participio: 'tried' },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'teacher', pt: 'professora' },
              { en: 'secretary', pt: 'secretária' },
              { en: 'mother', pt: 'mãe' },
              { en: 'son', pt: 'filho' },
              { en: 'children', pt: 'filhos' },
              { en: 'job', pt: 'trabalho' },
              { en: 'busy', pt: 'ocupada' },
              { en: 'days', pt: 'dias' },
              { en: 'happy', pt: 'feliz' },
              { en: 'tired', pt: 'cansada' },
              { en: 'not happy', pt: 'não feliz / insatisfeita' },
              { en: 'always', pt: 'sempre' },
              { en: 'a lot', pt: 'muito' },
              { en: 'a lot of time', pt: 'muito tempo' },
              { en: 'How are you?', pt: 'Como você está?' },
              { en: 'I understand', pt: 'Eu entendo' },
              { en: 'That\'s nice', pt: 'Que bom' },
              { en: 'Really?', pt: 'Sério?' },
              { en: 'Why?', pt: 'Por quê?' },
              { en: 'Thank you', pt: 'Obrigada' },
              { en: 'I am trying', pt: 'Eu estou tentando' },
            ]
          },
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Verbo TO BE',
            grupos: [
              {
                instrucao: 'Complete com am / is / are:',
                questoes: [
                  { pergunta: 'I ___ happy.', resposta: 'am' },
                  { pergunta: 'She ___ a teacher.', resposta: 'is' },
                  { pergunta: 'They ___ tired.', resposta: 'are' },
                  { pergunta: 'He ___ busy.', resposta: 'is' },
                  { pergunta: 'We ___ friends.', resposta: 'are' },
                ]
              },
              {
                instrucao: 'Forma negativa (adicione not):',
                questoes: [
                  { pergunta: 'I am happy → I am ___ happy', resposta: 'not' },
                  { pergunta: 'She is busy → She is ___ busy', resposta: 'not' },
                  { pergunta: 'They are tired → They are ___ tired', resposta: 'not' },
                ]
              },
              {
                instrucao: 'Transforme em pergunta:',
                questoes: [
                  { pergunta: 'You are happy → ___ you happy?', resposta: 'Are' },
                  { pergunta: 'She is a teacher → ___ she a teacher?', resposta: 'Is' },
                  { pergunta: 'They are busy → ___ they busy?', resposta: 'Are' },
                ]
              },
              {
                instrucao: 'Respostas curtas:',
                questoes: [
                  { pergunta: 'Are you tired? → Yes, I ___', resposta: 'am' },
                  { pergunta: 'Is she a teacher? → Yes, she ___', resposta: 'is' },
                  { pergunta: 'Are they busy? → Yes, they ___', resposta: 'are' },
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
              { personagem: 'Linda', texto: 'No, I am not okay. I am sad.' },
              { personagem: 'Glynda', texto: 'Why are you sad? Is everything ok?' },
              { personagem: 'Linda', texto: 'Today is a holiday and my family is here but my father can\'t come.' },
              { personagem: 'Glynda', texto: 'Really? Where is he?' },
              { personagem: 'Linda', texto: 'He is in Salvador.' },
              { personagem: 'Glynda', texto: 'Why is he there?' },
              { personagem: 'Linda', texto: 'Because he is a businessman.' },
              { personagem: 'Glynda', texto: 'What about your mother? Is she a businesswoman?' },
              { personagem: 'Linda', texto: 'No, she is a teacher.' },
              { personagem: 'Glynda', texto: 'Is she a good teacher?' },
              { personagem: 'Linda', texto: 'Yes, she is a very good teacher.' },
              { personagem: 'Glynda', texto: 'I have to go now. See you later. Bye, Linda.' },
              { personagem: 'Linda', texto: 'Bye, Glynda.' },
            ]
          },
          {
            type: 'verbos',
            titulo: '📘 Verbos da Aula',
            verbos: [
              { verbo: 'TO BE (ser/estar)', presente: 'am / is / are', passado: 'was / were', participio: 'been' },
              { verbo: 'TO COME (vir)', presente: 'come', passado: 'came', participio: 'come' },
              { verbo: 'TO HAVE (ter)', presente: 'have / has', passado: 'had', participio: 'had' },
              { verbo: 'TO GO (ir)', presente: 'go', passado: 'went', participio: 'gone' },
              { verbo: 'TO SEE (ver)', presente: 'see', passado: 'saw', participio: 'seen' },
              { verbo: 'TO UNDERSTAND (entender)', presente: 'understand', passado: 'understood', participio: 'understood' },
              { verbo: 'TO CALL (ligar/chamar)', presente: 'call', passado: 'called', participio: 'called' },
              { verbo: 'TO WORK (trabalhar)', presente: 'work', passado: 'worked', participio: 'worked' },
            ]
          },
          {
            type: 'vocabulario',
            titulo: '📖 Vocabulary',
            palavras: [
              { en: 'father', pt: 'pai' },
              { en: 'mother', pt: 'mãe' },
              { en: 'family', pt: 'família' },
              { en: 'children', pt: 'filhos / crianças' },
              { en: 'son', pt: 'filho' },
              { en: 'teacher', pt: 'professor(a)' },
              { en: 'businessman', pt: 'homem de negócios' },
              { en: 'businesswoman', pt: 'mulher de negócios' },
              { en: 'here', pt: 'aqui' },
              { en: 'there', pt: 'lá' },
              { en: 'holiday', pt: 'feriado' },
              { en: 'sad', pt: 'triste' },
              { en: 'happy', pt: 'feliz' },
              { en: 'okay / ok', pt: 'bem' },
              { en: 'busy', pt: 'ocupado' },
              { en: 'excited', pt: 'animado' },
              { en: 'Are you okay?', pt: 'Você está bem?' },
              { en: 'Where is he?', pt: 'Onde ele está?' },
              { en: 'Is he on vacation?', pt: 'Ele está de férias?' },
              { en: 'Is she a teacher?', pt: 'Ela é professora?' },
              { en: 'Are they happy?', pt: 'Eles estão felizes?' },
              { en: 'today', pt: 'hoje' },
              { en: 'now', pt: 'agora' },
              { en: 'with', pt: 'com' },
              { en: 'without', pt: 'sem' },
              { en: 'because', pt: 'porque' },
              { en: 'very', pt: 'muito' },
            ]
          },
          {
            type: 'exercicios',
            titulo: '✏️ Exercícios – Perguntas com To Be',
            grupos: [
              {
                instrucao: 'Forme perguntas (troque a ordem do sujeito e verbo):',
                questoes: [
                  { pergunta: 'She is sad. → ___ she sad?', resposta: 'Is' },
                  { pergunta: 'He is a businessman. → ___ he a businessman?', resposta: 'Is' },
                  { pergunta: 'They are here. → ___ they here?', resposta: 'Are' },
                  { pergunta: 'You are okay. → ___ you okay?', resposta: 'Are' },
                  { pergunta: 'It is a holiday. → ___ it a holiday?', resposta: 'Is' },
                ]
              },
              {
                instrucao: 'Complete com o verbo TO BE correto:',
                questoes: [
                  { pergunta: 'My father ___ in Salvador.', resposta: 'is' },
                  { pergunta: 'My parents ___ happy.', resposta: 'are' },
                  { pergunta: 'She ___ not a businesswoman.', resposta: 'is' },
                  { pergunta: 'I ___ not okay today.', resposta: 'am' },
                  { pergunta: 'Where ___ he?', resposta: 'is' },
                ]
              },
              {
                instrucao: 'Resposta curta (Yes/No):',
                questoes: [
                  { pergunta: 'Is Linda sad? → Yes, ___ ___', resposta: 'she is' },
                  { pergunta: 'Is her father in São Paulo? → No, ___ ___', resposta: 'he isn\'t' },
                  { pergunta: 'Is her mother a teacher? → Yes, ___ ___', resposta: 'she is' },
                  { pergunta: 'Are they at home? → No, ___ ___', resposta: 'they aren\'t' },
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};
