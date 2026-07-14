import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Printer, BookOpen, 
  MessageCircle, BookMarked, Grid3x3, PenLine, 
  Video, Upload, Users, CreditCard, ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import styles from './Manual.module.css';

// ── Síntese de Som Física (Web Audio API) ───────────────────────────────────
const playPageTurnSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const bufferSize = audioCtx.sampleRate * 0.45; // ~0.45 segundos de som
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Criação de ruído branco para simular o atrito do papel
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Filtro Bandpass para focar nas frequências de atrito de papel (médio-altas)
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(2.5, audioCtx.currentTime);
    // Variação de frequência simulando a folha se deslocando no ar
    bandpass.frequency.setValueAtTime(1400, audioCtx.currentTime);
    bandpass.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + 0.4);
    
    // Controle de volume (Envelope ADSR básico)
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.43);
    
    // Som grave secundário ("Whoosh") para simular o volume/massa do papel virando
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.4);
    
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
    oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.43);
    
    // Conexões
    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    
    // Tocar
    noiseSource.start();
    osc.start();
    
    noiseSource.stop(audioCtx.currentTime + 0.45);
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (err) {
    console.warn('[Manual] Falha ao sintetizar som da página:', err);
  }
};

export default function Manual() {
  const navigate = useNavigate();
  
  // O manual possui 12 páginas (0 a 11), representadas em 6 folhas/sheets (0 a 5)
  // Estado atual correspondente ao spread do livro: 0 (Capa), 1 (Págs 1-2), 2 (Págs 3-4), etc.
  const [spread, setSpread] = useState(0);
  const totalSpreads = 6;

  // Idioma do manual: 'pt' (Português) ou 'en' (English)
  const [lang, setLang] = useState('pt');
  // Helper: retorna o conteúdo no idioma ativo — L(portugues, ingles)
  const L = (pt, en) => (lang === 'en' ? en : pt);

  // Controla o modo de página expandida (ativado por duplo clique sobre o livro)
  const [isExpanded, setIsExpanded] = useState(false);

  // Alterna o modo expandido ao dar duplo clique sobre a página.
  // Ignora duplo clique em botões/links internos (navegação do sumário, setas, etc.)
  // para não atrapalhar a navegação normal do usuário.
  const toggleExpand = (e) => {
    if (e.target.closest('button, a')) return;
    setIsExpanded(prev => !prev);
  };

  // Enquanto expandido: permite fechar com a tecla ESC e trava o scroll do fundo
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded]);

  // Toca o som quando muda de página/spread
  useEffect(() => {
    if (spread > 0) {
      playPageTurnSound();
    }
  }, [spread]);

  const handleNext = () => {
    if (spread < totalSpreads - 1) {
      setSpread(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (spread > 0) {
      setSpread(prev => prev - 1);
    }
  };

  // Função para saltar para uma página específica através do índice
  const jumpToPage = (pageNum) => {
    // Mapeia o número da página para o respectivo spread:
    // Pág 0 -> Spread 0
    // Pág 1 ou 2 -> Spread 1
    // Pág 3 ou 4 -> Spread 2
    // Pág 5 ou 6 -> Spread 3
    // Pág 7 ou 8 -> Spread 4
    // Pág 9 ou 10 -> Spread 5
    // Pág 11 -> Spread 5
    if (pageNum === 0) setSpread(0);
    else if (pageNum === 11) setSpread(5);
    else setSpread(Math.ceil(pageNum / 2));
  };

  // Imprimir manual / Salvar como PDF
  const handlePrint = () => {
    window.print();
  };

  // Lista de tópicos para renderizar no Índice Lateral e na página do sumário
  const topicos = [
    { num: 0, titulo: L('Capa / Apresentação', 'Cover / Introduction'), icone: <BookOpen size={14}/> },
    { num: 1, titulo: L('Índice de Conteúdos', 'Table of Contents'), icone: <BookOpen size={14}/> },
    { num: 2, titulo: L('1. Visão Geral do Dashboard', '1. Dashboard Overview'), icone: <BookOpen size={14}/> },
    { num: 3, titulo: L('2. Criando e Publicando Aulas', '2. Creating and Publishing Lessons'), icone: <PlusSecaoIcone tipo="nova"/> },
    { num: 4, titulo: L('3. Importação Rápida de Docs', '3. Quick Document Import'), icone: <Upload size={14}/> },
    { num: 5, titulo: L('4. Gravação de Vídeo-Aulas', '4. Recording Video Lessons'), icone: <Video size={14}/> },
    { num: 6, titulo: L('5. Transmissões Ao Vivo', '5. Live Streaming'), icone: <Video size={14}/> },
    { num: 7, titulo: L('6. Upload de Materiais de Apoio', '6. Uploading Support Materials'), icone: <Upload size={14}/> },
    { num: 8, titulo: L('7. Compartilhamento Ao Vivo', '7. Live Sharing'), icone: <Upload size={14}/> },
    { num: 9, titulo: L('8. Gerenciamento de Alunos', '8. Student Management'), icone: <Users size={14}/> },
    { num: 10, titulo: L('9. Níveis de Planos e Upgrade', '9. Plan Tiers and Upgrades'), icone: <CreditCard size={14}/> },
    { num: 11, titulo: L('Contra-capa / Fim', 'Back Cover / End'), icone: <HelpCircle size={14}/> },
  ];

  function PlusSecaoIcone({ tipo }) {
    if (tipo === 'nova') return <span style={{ color: '#d4af37', fontWeight: 800 }}>+</span>;
    return null;
  }

  // Helper para verificar qual página física está em exibição no mobile
  const activePageMobile = spread * 2;

  return (
    <div className={styles.manualContainer}>
      {/* ── NAVBAR SUPERIOR ── */}
      <header className={styles.navbar}>
        <div className={styles.logoInfo}>
          <img src="/my_voice_default.png" alt="Logo" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid #d4af37' }} />
          <div>
            <h2>The Lenz Voice</h2>
            <span className={styles.roleTag}>{L('Manual de Recursos Tecnológicos', 'Technology Resource Manual')}</span>
          </div>
        </div>
        <div className={styles.navActions}>
          <button className={styles.backBtn} onClick={() => navigate('/admin')}>
            <ArrowLeft size={15} />
            <span>{L('Voltar ao Painel', 'Back to Dashboard')}</span>
          </button>
          <button className={styles.printBtn} onClick={handlePrint}>
            <Printer size={15} />
            <span>{L('Salvar como PDF', 'Save as PDF')}</span>
          </button>
          <button className={styles.printBtn} onClick={() => setLang(l => l === 'pt' ? 'en' : 'pt')}>
            <span style={{ fontWeight: 800 }}>{lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT'}</span>
          </button>
        </div>
      </header>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className={styles.mainLayout}>
        
        {/* ── SIDEBAR: ÍNDICE INTERATIVO (Oculto em Impressão) ── */}
        <aside className={styles.sidebar}>
          <h3>{L('Índice', 'Contents')}</h3>
          <ul className={styles.indexList}>
            {topicos.map((t, idx) => {
              // Determina se o tópico está no spread ativo atualmente
              const isActive = (spread === 0 && t.num === 0) ||
                               (spread === 1 && (t.num === 1 || t.num === 2)) ||
                               (spread === 2 && (t.num === 3 || t.num === 4)) ||
                               (spread === 3 && (t.num === 5 || t.num === 6)) ||
                               (spread === 4 && (t.num === 7 || t.num === 8)) ||
                               (spread === 5 && (t.num === 9 || t.num === 10 || t.num === 11));
              return (
                <li key={idx}>
                  <button
                    className={`${styles.indexItem} ${isActive ? styles.indexItemActive : ''}`}
                    onClick={() => jumpToPage(t.num)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {t.icone}
                      {t.titulo}
                    </span>
                    <span className={styles.pageNumBadge}>{t.num}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── CONTEÚDO DO LIVRO (FLIPBOOK 3D) ── */}
        <div className={`${styles.bookWrapper} ${isExpanded ? styles.bookWrapperExpanded : ''}`}>

          {isExpanded && (
            <button
              className={styles.expandCloseBtn}
              onClick={() => setIsExpanded(false)}
              aria-label={L('Fechar visualização ampliada', 'Close expanded view')}
            >
              ✕
            </button>
          )}

          <div
            className={styles.bookScene}
            onDoubleClick={toggleExpand}
            title={L('Duplo clique para ampliar a página', 'Double-click to zoom the page')}
          >
            <div className={styles.bookContainer}>
              <div className={styles.spineCrease}></div>

              {/* ── FOLHA 0: CAPA (Frente: Pág 0, Verso: Pág 1) ── */}
              <div className={`${styles.sheet} ${spread > 0 ? styles.sheetFlipped : ''} ${spread === 0 ? styles.sheetActive : ''} ${activePageMobile === 0 ? styles.sheetActiveMobile : ''}`} style={{ zIndex: spread > 0 ? 0 : (5 - 0) }}>
                <div className={styles.pageShadow}></div>
                
                {/* Pág 0 (Frente): Capa */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.coverPage}>
                    <img src="/my_voice_default.png" alt="The Lenz Voice" className={styles.coverLogo} />
                    <span className={styles.coverBadge}>{L('Guia de Funcionalidades', 'Feature Guide')}</span>
                    <h1 className={styles.coverTitle}>{L('Manual do Professor', "Teacher's Manual")}</h1>
                    <p className={styles.coverSubtitle}>
                      {L(
                        'Tudo sobre a tecnologia da sua plataforma: gravações, transmissões, materiais e publicação de aulas.',
                        'Everything about your platform\'s technology: recordings, live streams, materials, and publishing lessons.'
                      )}
                    </p>
                    <div className={styles.coverFooter}>
                      {L('Plataforma de Reforço Escolar The Lenz Voice © 2026', 'The Lenz Voice Tutoring Platform © 2026')}
                    </div>
                  </div>
                </div>

                {/* Pág 1 (Verso): Índice Interno do Livro */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Sumário', 'Contents')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Início', 'Start')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Índice Analítico', 'Table of Contents')}</h2>
                      <p>{L('Use o sumário abaixo ou os botões de navegação inferiores para folhear o manual.', 'Use the contents below or the navigation buttons at the bottom to flip through the manual.')}</p>
                      
                      <div className={styles.tocList}>
                        <button className={styles.tocRow} onClick={() => jumpToPage(2)}>
                          <span className={styles.tocTitle}>{L('1. Visão Geral do Dashboard', '1. Dashboard Overview')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 2', 'Page 2')}</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(3)}>
                          <span className={styles.tocTitle}>{L('2. Criando e Publicando Aulas', '2. Creating and Publishing Lessons')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 3', 'Page 3')}</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(4)}>
                          <span className={styles.tocTitle}>{L('3. Importação Rápida de Docs', '3. Quick Document Import')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 4', 'Page 4')}</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(5)}>
                          <span className={styles.tocTitle}>{L('4. Gravação de Vídeo-Aulas', '4. Recording Video Lessons')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 5', 'Page 5')}</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(6)}>
                          <span className={styles.tocTitle}>{L('5. Transmissões Ao Vivo (Live)', '5. Live Streaming')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 6', 'Page 6')}</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(7)}>
                          <span className={styles.tocTitle}>{L('6. Upload de Materiais de Apoio', '6. Uploading Support Materials')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 7', 'Page 7')}</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(8)}>
                          <span className={styles.tocTitle}>{L('7. Compartilhamento Ao Vivo', '7. Live Sharing')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 8', 'Page 8')}</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(9)}>
                          <span className={styles.tocTitle}>{L('8. Gerenciamento de Alunos', '8. Student Management')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 9', 'Page 9')}</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(10)}>
                          <span className={styles.tocTitle}>{L('9. Níveis de Planos e Upgrade', '9. Plan Tiers and Upgrades')}</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>{L('Pág. 10', 'Page 10')}</span>
                        </button>
                      </div>
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 1', 'Page 1')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 1: VISÃO GERAL & CRIANDO AULAS (Frente: Pág 2, Verso: Pág 3) ── */}
              <div className={`${styles.sheet} ${spread > 1 ? styles.sheetFlipped : ''} ${spread === 1 ? styles.sheetActive : ''} ${activePageMobile === 2 ? styles.sheetActiveMobile : ''}`} style={{ zIndex: spread > 1 ? 1 : (5 - 1) }}>
                <div className={styles.pageShadow}></div>

                {/* Pág 2 (Frente): Visão Geral */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Capítulo 1', 'Chapter 1')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Visão Geral', 'Overview')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Visão Geral do Painel', 'Dashboard Overview')}</h2>
                      <p>
                        {L(
                          'A Área da Professora foi estruturada para centralizar todos os recursos de controle pedagógico e de comunicação de forma intuitiva.',
                          "The Teacher's Area was designed to bring together all your teaching-control and communication tools in one intuitive place."
                        )}
                      </p>
                      <p>{L('Na barra superior, você tem acesso rápido a:', 'In the top bar, you have quick access to:')}</p>
                      <ul className={styles.featureList}>
                        <li><strong>{L('Plano Ativo:', 'Active Plan:')}</strong> {L('Exibe se você está no plano Básico, Pro ou Escola.', 'Shows whether you are on the Basic, Pro, or School plan.')}</li>
                        <li><strong>{L('Olá, Professora:', 'Hello, Teacher:')}</strong> {L('Identificação de perfil logado.', 'Shows which profile is currently logged in.')}</li>
                        <li><strong>{L('Ver como Aluno:', 'View as Student:')}</strong> {L('Entra no modo de simulação para ver exatamente como a trilha de aulas e os materiais aparecem para os estudantes.', 'Enters preview mode to see exactly how the lesson track and materials appear to students.')}</li>
                      </ul>
                      <div className={styles.highlightBox}>
                        <strong>{L('Acesso Rápido por Abas', 'Quick Tab Access')}</strong>
                        {L(
                          'O menu de abas logo abaixo da barra superior permite trocar instantaneamente entre visualização de aulas, painel de criação, gravador, transmissor de lives e gerenciador de alunos.',
                          'The tab menu right below the top bar lets you instantly switch between lesson view, the creation panel, the recorder, the live-streaming tool, and student management.'
                        )}
                      </div>
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 2', 'Page 2')}</span>
                    </div>
                  </div>
                </div>

                {/* Pág 3 (Verso): Criando Aulas */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Capítulo 2', 'Chapter 2')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Criação', 'Creation')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Criando e Publicando Aulas', 'Creating and Publishing Lessons')}</h2>
                      {lang === 'en' ? (
                        <>
                          <p>
                            In the <strong>Nova Aula</strong> (New Lesson) tab, you can build an interactive lesson from scratch. Fill in the lesson number, the main title (e.g., "At the Airport"), an explanatory subtitle, and the level tag.
                          </p>
                          <p>Add structured sections to build out the methodology:</p>
                          <ul className={styles.featureList}>
                            <li>💬 <strong>Diálogo (Dialogue):</strong> Enter the names of two characters and build their conversation script, creating new lines with associated audio.</li>
                            <li>📘 <strong>Verbos (Verbs):</strong> Register key verbs with their base, present, past, and participle forms.</li>
                            <li>📖 <strong>Vocabulário (Vocabulary):</strong> Add new English words and their translations.</li>
                            <li>✏️ <strong>Exercícios (Exercises):</strong> Create fill-in-the-blank or multiple-choice questions. Tip: use <code>___</code> (three underscores) to create blanks in sentences.</li>
                          </ul>
                          <p>
                            When finished, you can <strong>Salvar como Rascunho</strong> (Save as Draft) to keep editing later, or click <strong>Publicar Aula</strong> (Publish Lesson) to release it to students' tracks.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            Na aba <strong>Nova Aula</strong>, você pode criar uma aula interativa do zero. Preencha o número da aula, o título principal (Ex: "At the Airport"), um subtítulo explicativo e a tag de nível.
                          </p>
                          <p>Adicione seções estruturadas para compor a metodologia:</p>
                          <ul className={styles.featureList}>
                            <li>💬 <strong>Diálogo:</strong> Insira o nome de dois personagens e construa o roteiro da conversa deles, criando novas falas com áudio associado.</li>
                            <li>📘 <strong>Verbos:</strong> Cadastre verbos chaves com sua forma base, presente, passado e particípio.</li>
                            <li>📖 <strong>Vocabulário:</strong> Insira novas palavras em inglês e suas respectivas traduções.</li>
                            <li>✏️ <strong>Exercícios:</strong> Crie questões de preenchimento ou múltipla escolha. Dica: use <code>___</code> (três sublinhados) para criar lacunas nas frases.</li>
                          </ul>
                          <p>
                            Ao final, você pode <strong>Salvar como Rascunho</strong> (para continuar editando depois) ou clicar em <strong>Publicar Aula</strong> para liberá-la na trilha dos alunos.
                          </p>
                        </>
                      )}
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 3', 'Page 3')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 2: IMPORTAÇÃO & GRAVAÇÃO (Frente: Pág 4, Verso: Pág 5) ── */}
              <div className={`${styles.sheet} ${spread > 2 ? styles.sheetFlipped : ''} ${spread === 2 ? styles.sheetActive : ''} ${activePageMobile === 4 ? styles.sheetActiveMobile : ''}`} style={{ zIndex: spread > 2 ? 2 : (5 - 2) }}>
                <div className={styles.pageShadow}></div>

                {/* Pág 4 (Frente): Importação de Documentos */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Capítulo 3', 'Chapter 3')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Importação', 'Import')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Importação Rápida (Aba Importar Doc)', 'Quick Import (Importar Doc Tab)')}</h2>
                      {lang === 'en' ? (
                        <>
                          <p>
                            If you already have a lesson planned out in a text file, there's no need to type it all again. The platform has built-in AI that can read and convert documents.
                          </p>
                          <p><strong>How to import:</strong></p>
                          <ul className={styles.featureList}>
                            <li>Prepare the file as <strong>.docx</strong> (Word/Google Docs) or <strong>.txt</strong>.</li>
                            <li>In the <strong>Importar Doc</strong> (Import Doc) tab, click to choose the file and upload it.</li>
                            <li>The AI will read the document and automatically fill in the New Lesson form, splitting the text into Dialogue, Verbs, Vocabulary, and Exercises sections.</li>
                            <li>A structured preview will appear on screen. You can correct fields, add new lines, or delete blocks.</li>
                          </ul>
                          <p>
                            Once you're happy with the result, save the lesson to the database and publish it to the track.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            Se você já tem uma aula planejada em um arquivo de texto, não precisa digitar tudo de novo. A plataforma possui uma IA integrada capaz de ler e converter documentos.
                          </p>
                          <p><strong>Como fazer a importação:</strong></p>
                          <ul className={styles.featureList}>
                            <li>Prepare o arquivo nos formatos <strong>.docx</strong> (Word/Google Docs) ou <strong>.txt</strong>.</li>
                            <li>Na aba <strong>Importar Doc</strong>, clique em escolher arquivo e envie-o.</li>
                            <li>A IA lerá o documento e preencherá automaticamente o formulário de Nova Aula, dividindo o texto em seções de Diálogo, Verbos, Vocabulário e Exercícios.</li>
                            <li>Um preview estruturado aparecerá na tela. Você pode corrigir os campos, adicionar novas linhas ou deletar blocos.</li>
                          </ul>
                          <p>
                            Quando estiver satisfeito com o resultado, salve a aula na base de dados e publique-a na trilha.
                          </p>
                        </>
                      )}
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 4', 'Page 4')}</span>
                    </div>
                  </div>
                </div>

                {/* Pág 5 (Verso): Gravação de Aulas */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Capítulo 4', 'Chapter 4')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Gravação', 'Recording')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Gravação de Vídeo-Aulas', 'Recording Video Lessons')}</h2>
                      {lang === 'en' ? (
                        <>
                          <p>
                            The built-in screen and camera recorder lets you create professional video lessons right from your browser, with no need to install other apps.
                          </p>
                          <p><strong>Step by step for recording:</strong></p>
                          <ul className={styles.featureList}>
                            <li>Go to the <strong>Gravar Aula</strong> (Record Lesson) tab.</li>
                            <li>Choose the source: <strong>Câmera</strong> (Camera — just your face) or <strong>Tela</strong> (Screen — great for showing presentations, slides, and a digital whiteboard).</li>
                            <li>Select the ideal quality (480p, 720p HD, or 1080p Full HD) based on your internet connection.</li>
                            <li>Click <strong>Iniciar Gravação</strong> (Start Recording). You can pause temporarily and continue.</li>
                            <li>Once the lesson is done, review it in the video player or use the <strong>built-in Video Editor</strong> to make precise cuts.</li>
                          </ul>
                          <p>
                            Give the recording a title, select which registered lesson it belongs to, and click <strong>Publicar Vídeo</strong> (Publish Video) to make it available to students.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            O gravador de tela e câmera integrado permite criar videoaulas profissionais direto do seu navegador, sem precisar instalar outros aplicativos.
                          </p>
                          <p><strong>Passo a passo para gravação:</strong></p>
                          <ul className={styles.featureList}>
                            <li>Vá para a aba <strong>Gravar Aula</strong>.</li>
                            <li>Escolha a fonte: <strong>Câmera</strong> (só o seu rosto) ou <strong>Tela</strong> (ótimo para mostrar apresentações, slides e lousa digital).</li>
                            <li>Selecione a qualidade ideal (480p, 720p HD ou 1080p Full HD) de acordo com sua internet.</li>
                            <li>Clique em <strong>Iniciar Gravação</strong>. É possível pausar temporariamente e continuar.</li>
                            <li>Finalizada a aula, revise no reprodutor de vídeo ou use o <strong>Editor de Vídeo Integrado</strong> para realizar cortes precisos.</li>
                          </ul>
                          <p>
                            Dê um título para a gravação, selecione a qual aula cadastrada ela pertence e clique em <strong>Publicar Vídeo</strong> para disponibilizá-lo para os alunos.
                          </p>
                        </>
                      )}
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 5', 'Page 5')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 3: LIVE & UPLOAD DE MATERIAIS (Frente: Pág 6, Verso: Pág 7) ── */}
              <div className={`${styles.sheet} ${spread > 3 ? styles.sheetFlipped : ''} ${spread === 3 ? styles.sheetActive : ''} ${activePageMobile === 6 ? styles.sheetActiveMobile : ''}`} style={{ zIndex: spread > 3 ? 3 : (5 - 3) }}>
                <div className={styles.pageShadow}></div>

                {/* Pág 6 (Frente): Transmissões Ao Vivo */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle5}>{L('Capítulo 5', 'Chapter 5')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Transmissão', 'Streaming')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Transmissões Ao Vivo', 'Live Streaming')}</h2>
                      {lang === 'en' ? (
                        <>
                          <p>
                            Teach interactive real-time lessons using the high-speed streaming system built on <strong>LiveKit</strong>.
                          </p>
                          <p><strong>How to start your stream:</strong></p>
                          <ul className={styles.featureList}>
                            <li>Go to the <strong>Ao Vivo</strong> (Live) tab in the top menu.</li>
                            <li>From the dropdown, select the <strong>matching lesson</strong> for the broadcast.</li>
                            <li>The browser will ask for camera and microphone permission. Click "Allow".</li>
                            <li>A preview of your video will appear in the box. When you're ready, click <strong>Iniciar Transmissão</strong> (Start Streaming).</li>
                          </ul>
                          <div className={styles.highlightBox}>
                            <strong>Notice for students</strong>
                            As soon as you start streaming, the matching lesson on the student's track gets a flashing red "LIVE" tag. When they click it, they're connected to your video room.
                          </div>
                        </>
                      ) : (
                        <>
                          <p>
                            Dê aulas interativas em tempo real utilizando o sistema de streaming de alta velocidade baseado no <strong>LiveKit</strong>.
                          </p>
                          <p><strong>Como iniciar a sua transmissão:</strong></p>
                          <ul className={styles.featureList}>
                            <li>Acesse a aba <strong>Ao Vivo</strong> no menu superior.</li>
                            <li>Selecione no menu suspenso qual é a <strong>Aula correspondente</strong> para a transmissão.</li>
                            <li>O navegador solicitará permissões de acesso à câmera e microfone. Clique em "Permitir".</li>
                            <li>Um preview do seu vídeo aparecerá no quadrado. Quando estiver pronta, clique em <strong>Iniciar Transmissão</strong>.</li>
                          </ul>
                          <div className={styles.highlightBox}>
                            <strong>Aviso para os alunos</strong>
                            Assim que você inicia a transmissão, a aula correspondente na trilha do aluno ganha uma tag vermelha piscante escrita "AO VIVO". Ao clicarem nela, eles são conectados à sua sala de vídeo.
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 6', 'Page 6')}</span>
                    </div>
                  </div>
                </div>

                {/* Pág 7 (Verso): Upload de Materiais */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Capítulo 6', 'Chapter 6')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Materiais', 'Materials')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Upload de Materiais de Apoio', 'Uploading Support Materials')}</h2>
                      {lang === 'en' ? (
                        <>
                          <p>
                            You can enrich the learning experience by attaching handouts, exercise lists, PDF slides, images, or external links.
                          </p>
                          <p><strong>How to send support material:</strong></p>
                          <ul className={styles.featureList}>
                            <li>In the <strong>Ao Vivo</strong> (Live) tab, find the <strong>Anexar Material à Aula</strong> (Attach Material to Lesson) panel.</li>
                            <li>Select the desired lesson at the top.</li>
                            <li>Enter a descriptive title for the material (e.g., "Vocabulary Handout - Lesson 4").</li>
                            <li>You can either <strong>upload a file</strong> (such as a PDF or image) or <strong>paste an external link</strong> from Google Drive/YouTube.</li>
                            <li>Click <strong>Enviar Material</strong> (Send Material). The file goes straight to Supabase Storage.</li>
                          </ul>
                          <p>
                            <strong>Student View:</strong> The material stays permanently saved in the matching lesson track. The student accesses it by clicking the materials tab on their profile.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            Você pode enriquecer a experiência pedagógica anexando apostilas, listas de exercícios, slides em PDF, imagens ou links externos.
                          </p>
                          <p><strong>Como enviar o material de apoio:</strong></p>
                          <ul className={styles.featureList}>
                            <li>Na aba <strong>Ao Vivo</strong>, localize o painel <strong>Anexar Material à Aula</strong>.</li>
                            <li>Selecione a aula desejada no topo.</li>
                            <li>Insira um título descritivo para o material (Ex: "Apostila de Vocabulário - Aula 4").</li>
                            <li>Você pode escolher entre fazer o <strong>upload de um arquivo</strong> (como um PDF ou imagem) ou <strong>colar um link externo</strong> do Google Drive/Youtube.</li>
                            <li>Clique em <strong>Enviar Material</strong>. O arquivo vai direto para o Supabase Storage.</li>
                          </ul>
                          <p>
                            <strong>Visualização do Aluno:</strong> O material fica salvo de forma permanente na trilha da aula correspondente. O aluno o acessa clicando na aba de materiais no seu perfil.
                          </p>
                        </>
                      )}
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 7', 'Page 7')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 4: COMPARTILHAMENTO & ALUNOS (Frente: Pág 8, Verso: Pág 9) ── */}
              <div className={`${styles.sheet} ${spread > 4 ? styles.sheetFlipped : ''} ${spread === 4 ? styles.sheetActive : ''} ${activePageMobile === 8 ? styles.sheetActiveMobile : ''}`} style={{ zIndex: spread > 4 ? 4 : (5 - 4) }}>
                <div className={styles.pageShadow}></div>

                {/* Pág 8 (Frente): Compartilhamento Ao Vivo */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Capítulo 7', 'Chapter 7')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Ao Vivo', 'Live')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Compartilhamento em Tempo Real', 'Real-Time Sharing')}</h2>
                      {lang === 'en' ? (
                        <>
                          <p>
                            During live streams, dynamic interaction is essential. You can make files and references available to the class instantly.
                          </p>
                          <p><strong>How it works in practice:</strong></p>
                          <ul className={styles.featureList}>
                            <li>While you're streaming, the attachments panel in the <strong>Ao Vivo</strong> (Live) tab stays active on the side.</li>
                            <li>If you want to point to extra reading or provide presentation slides mid-explanation, upload the file in that panel.</li>
                            <li>As soon as you click send, the file uploads and appears in the student's profile instantly, with no need for them to reload the stream page.</li>
                          </ul>
                          <div className={styles.highlightBox}>
                            Students watching the live lesson can click the download button and open the material in a separate tab while following along with your live explanation.
                          </div>
                        </>
                      ) : (
                        <>
                          <p>
                            Durante as transmissões ao vivo, a interação dinâmica é essencial. Você pode disponibilizar arquivos e referências para a turma instantaneamente.
                          </p>
                          <p><strong>Como funciona na prática:</strong></p>
                          <ul className={styles.featureList}>
                            <li>Enquanto você está transmitindo, o painel de anexos na aba <strong>Ao Vivo</strong> continua ativo na lateral.</li>
                            <li>Se você deseja indicar uma leitura extra ou fornecer os slides da apresentação no meio da explicação, faça o upload do arquivo nesse painel.</li>
                            <li>Assim que você clica em enviar, o arquivo é carregado e aparece no perfil do aluno instantaneamente, sem que ele precise recarregar a página da transmissão.</li>
                          </ul>
                          <div className={styles.highlightBox}>
                            Os alunos que estão assistindo à aula ao vivo podem clicar no botão de download e abrir o material em uma aba paralela, acompanhando sua explicação ao vivo.
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 8', 'Page 8')}</span>
                    </div>
                  </div>
                </div>

                {/* Pág 9 (Verso): Gerenciamento de Alunos */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Capítulo 8', 'Chapter 8')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Controle', 'Control')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Gerenciamento de Alunos', 'Student Management')}</h2>
                      {lang === 'en' ? (
                        <>
                          <p>
                            The <strong>Alunos</strong> (Students) tab gives you full access control over students enrolled in your tutoring platform.
                          </p>
                          <p><strong>Management features:</strong></p>
                          <ul className={styles.featureList}>
                            <li><strong>Smart Search:</strong> Quickly find any student by typing part of their name or login email in the search bar.</li>
                            <li><strong>Profile View:</strong> See the profile photo/avatar, registered email, and the date the student signed up.</li>
                            <li><strong>Active vs. Blocked Status:</strong> Each student shows a green (Active) or red (Blocked) indicator.</li>
                            <li><strong>Toggle Button:</strong> Click the switch icon next to the student's name to block or unblock their access to the platform.</li>
                          </ul>
                        </>
                      ) : (
                        <>
                          <p>
                            A aba <strong>Alunos</strong> oferece o controle total de acesso aos estudantes inscritos na sua plataforma de reforço escolar.
                          </p>
                          <p><strong>Funcionalidades de gerenciamento:</strong></p>
                          <ul className={styles.featureList}>
                            <li><strong>Busca Inteligente:</strong> Procure rapidamente qualquer estudante digitando parte do seu nome ou do seu e-mail de login na barra de pesquisa.</li>
                            <li><strong>Visualização de Cadastro:</strong> Veja a foto de perfil/avatar, o e-mail cadastrado e a data em que o estudante se registrou no sistema.</li>
                            <li><strong>Status Ativo vs Bloqueado:</strong> Cada aluno exibe uma sinalização verde (Ativo) ou vermelha (Bloqueado).</li>
                            <li><strong>Botão Toggle (Interruptor):</strong> Clique no botão de chave ao lado do nome do estudante para bloquear ou desbloquear o acesso dele à plataforma.</li>
                          </ul>
                        </>
                      )}
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 9', 'Page 9')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 5: PLANOS & CONTRA-CAPA (Frente: Pág 10, Verso: Pág 11) ── */}
              <div className={`${styles.sheet} ${spread === 5 ? styles.sheetActive : ''} ${activePageMobile === 10 ? styles.sheetActiveMobile : ''}`} style={{ zIndex: spread > 5 ? 5 : 0 }}>
                <div className={styles.pageShadow}></div>

                {/* Pág 10 (Frente): Planos */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>{L('Capítulo 9', 'Chapter 9')}</span>
                      <span className={styles.pageHeaderChapter}>{L('Planos', 'Plans')}</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>{L('Níveis de Planos e Upgrade', 'Plan Tiers and Upgrades')}</h2>
                      {lang === 'en' ? (
                        <>
                          <p>
                            Manage your tutoring platform's technical capacity through the <strong>Planos</strong> (Plans) tab.
                          </p>
                          <p>Each plan tier offers features suited to your needs:</p>
                          <ul className={styles.featureList}>
                            <li>🥉 <strong>Basic Plan (Free):</strong> Ideal for trying things out. Allows an initial number of students and simple recordings of up to 15 minutes.</li>
                            <li>🥈 <strong>Pro Plan:</strong> For independent teachers. Unlimited recordings of up to 30 minutes, live-streaming support for full classrooms, and more storage space.</li>
                            <li>🥇 <strong>School Plan:</strong> For institutions. Control over multiple teachers, detailed student-attendance statistics reports, and priority support.</li>
                          </ul>
                          <p>
                            Visit the <strong>Planos</strong> (Plans) tab anytime to check your status and upgrade instantly.
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            Gerencie a capacidade tecnológica de sua plataforma de reforço escolar através da aba <strong>Planos</strong>.
                          </p>
                          <p>Cada nível de plano oferece recursos ajustados às suas necessidades:</p>
                          <ul className={styles.featureList}>
                            <li>🥉 <strong>Plano Básico (Grátis):</strong> Ideal para experimentação. Permite cadastrar um número inicial de alunos e fazer gravações simples de até 15 minutos.</li>
                            <li>🥈 <strong>Plano Pro:</strong> Para professoras independentes. Gravações ilimitadas de até 30 minutos, suporte a lives para salas cheias e mais espaço em disco.</li>
                            <li>🥇 <strong>Plano Escola:</strong> Para instituições. Controle de múltiplos professores, relatórios estatísticos detalhados de presença dos alunos e suporte priorizado.</li>
                          </ul>
                          <p>
                            Acesse a aba <strong>Planos</strong> a qualquer momento para ver o seu status e realizar o upgrade imediato.
                          </p>
                        </>
                      )}
                    </div>
                    <div className={styles.pageFooter}>
                      <span>{L('The Lenz Voice — Manual do Professor', "The Lenz Voice — Teacher's Manual")}</span>
                      <span>{L('Página 10', 'Page 10')}</span>
                    </div>
                  </div>
                </div>

                {/* Pág 11 (Verso): Contra-capa / Final */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage} style={{ background: '#091526', color: '#fff', height: '100%', margin: '-2.2rem', padding: '2.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={styles.pageHeader} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className={styles.pageHeaderTitle} style={{ color: '#94a3b8' }}>{L('Fim', 'End')}</span>
                      <span className={styles.pageHeaderChapter} style={{ color: '#d4af37' }}>{L('Suporte', 'Support')}</span>
                    </div>
                    <div className={styles.pageBody} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
                      <HelpCircle size={48} style={{ color: '#d4af37', margin: '0 auto 1.5rem auto' }} />
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>{L('Dúvidas ou Suporte?', 'Questions or Support?')}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '85%', margin: '0 auto' }}>
                        {L(
                          'Se encontrar qualquer dificuldade com a câmera, microfone, uploads de documentos ou se precisar de ajuda com o streaming de vídeo ao vivo, entre em contato com o nosso time de suporte técnico.',
                          'If you run into any difficulty with the camera, microphone, document uploads, or need help with live video streaming, get in touch with our technical support team.'
                        )}
                      </p>
                      <p style={{ color: '#d4af37', fontSize: '0.85rem', fontWeight: 700, marginTop: '1.5rem' }}>
                        raulvilera@gmail.com
                      </p>
                      <p style={{ color: '#d4af37', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.35rem' }}>
                        WhatsApp: (11) 96838-0160
                      </p>
                    </div>
                    <div className={styles.pageFooter} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                      <span>{L('Plataforma The Lenz Voice', 'The Lenz Voice Platform')}</span>
                      <span>{L('Página 11', 'Page 11')}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ── CONTROLES DE NAVEGAÇÃO DO LIVRO ── */}
          <div className={styles.controls}>
            <button 
              className={styles.navArrow} 
              onClick={handlePrev} 
              disabled={spread === 0}
              aria-label={L('Página anterior', 'Previous page')}
            >
              <ChevronLeft size={24} />
            </button>
            <span className={styles.pageIndicator}>
              {L(
                `Folha ${spread + 1} de ${totalSpreads} (Págs. ${spread === 0 ? 'Capa' : spread * 2 - 1} - ${spread === 0 ? '1' : spread * 2})`,
                `Sheet ${spread + 1} of ${totalSpreads} (Pages ${spread === 0 ? 'Cover' : spread * 2 - 1} - ${spread === 0 ? '1' : spread * 2})`
              )}
            </span>
            <button 
              className={styles.navArrow} 
              onClick={handleNext} 
              disabled={spread === totalSpreads - 1}
              aria-label={L('Próxima página', 'Next page')}
            >
              <ChevronRight size={24} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
