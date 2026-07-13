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
    { num: 0, titulo: 'Capa / Apresentação', icone: <BookOpen size={14}/> },
    { num: 1, titulo: 'Índice de Conteúdos', icone: <BookOpen size={14}/> },
    { num: 2, titulo: '1. Visão Geral do Dashboard', icone: <BookOpen size={14}/> },
    { num: 3, titulo: '2. Criando e Publicando Aulas', icone: <PlusSecaoIcone tipo="nova"/> },
    { num: 4, titulo: '3. Importação Rápida de Docs', icone: <Upload size={14}/> },
    { num: 5, titulo: '4. Gravação de Vídeo-Aulas', icone: <Video size={14}/> },
    { num: 6, titulo: '5. Transmissões Ao Vivo', icone: <Video size={14}/> },
    { num: 7, titulo: '6. Upload de Materiais de Apoio', icone: <Upload size={14}/> },
    { num: 8, titulo: '7. Compartilhamento Ao Vivo', icone: <Upload size={14}/> },
    { num: 9, titulo: '8. Gerenciamento de Alunos', icone: <Users size={14}/> },
    { num: 10, titulo: '9. Níveis de Planos e Upgrade', icone: <CreditCard size={14}/> },
    { num: 11, titulo: 'Contra-capa / Fim', icone: <HelpCircle size={14}/> },
  ];

  function PlusSecaoIcone({ tipo }) {
    if (tipo === 'nova') return <span style={{ color: '#d4af37', fontWeight: 800 }}>+</span>;
    return null;
  }

  // Helper para verificar qual página física está em exibição no mobile
  const activePageMobile = spread === 0 ? 0 : spread * 2 - 1;

  return (
    <div className={styles.manualContainer}>
      {/* ── NAVBAR SUPERIOR ── */}
      <header className={styles.navbar}>
        <div className={styles.logoInfo}>
          <img src="/my_voice_default.png" alt="Logo" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid #d4af37' }} />
          <div>
            <h2>My Voice</h2>
            <span className={styles.roleTag}>Manual de Recursos Tecnológicos</span>
          </div>
        </div>
        <div className={styles.navActions}>
          <button className={styles.backBtn} onClick={() => navigate('/admin')}>
            <ArrowLeft size={15} />
            <span>Voltar ao Painel</span>
          </button>
          <button className={styles.printBtn} onClick={handlePrint}>
            <Printer size={15} />
            <span>Salvar como PDF</span>
          </button>
        </div>
      </header>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className={styles.mainLayout}>
        
        {/* ── SIDEBAR: ÍNDICE INTERATIVO (Oculto em Impressão) ── */}
        <aside className={styles.sidebar}>
          <h3>Índice</h3>
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
        <div className={styles.bookWrapper}>
          
          <div className={styles.bookScene}>
            <div className={styles.bookContainer}>
              <div className={styles.spineCrease}></div>

              {/* ── FOLHA 0: CAPA (Frente: Pág 0, Verso: Pág 1) ── */}
              <div className={`${styles.sheet} ${spread > 0 ? styles.sheetFlipped : ''} ${spread === 0 ? styles.sheetActive : ''} ${activePageMobile === 0 ? styles.sheetActiveMobile : ''}`}>
                <div className={styles.pageShadow}></div>
                
                {/* Pág 0 (Frente): Capa */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.coverPage}>
                    <img src="/my_voice_default.png" alt="My Voice" className={styles.coverLogo} />
                    <span className={styles.coverBadge}>Guia de Funcionalidades</span>
                    <h1 className={styles.coverTitle}>Manual do Professor</h1>
                    <p className={styles.coverSubtitle}>
                      Tudo sobre a tecnologia da sua plataforma: gravações, transmissões, materiais e publicação de aulas.
                    </p>
                    <div className={styles.coverFooter}>
                      Plataforma de Reforço Escolar My Voice © 2026
                    </div>
                  </div>
                </div>

                {/* Pág 1 (Verso): Índice Interno do Livro */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Sumário</span>
                      <span className={styles.pageHeaderChapter}>Início</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Índice Analítico</h2>
                      <p>Use o sumário abaixo ou os botões de navegação inferiores para folhear o manual.</p>
                      
                      <div className={styles.tocList}>
                        <button className={styles.tocRow} onClick={() => jumpToPage(2)}>
                          <span className={styles.tocTitle}>1. Visão Geral do Dashboard</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 2</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(3)}>
                          <span className={styles.tocTitle}>2. Criando e Publicando Aulas</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 3</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(4)}>
                          <span className={styles.tocTitle}>3. Importação Rápida de Docs</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 4</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(5)}>
                          <span className={styles.tocTitle}>4. Gravação de Vídeo-Aulas</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 5</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(6)}>
                          <span className={styles.tocTitle}>5. Transmissões Ao Vivo (Live)</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 6</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(7)}>
                          <span className={styles.tocTitle}>6. Upload de Materiais de Apoio</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 7</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(8)}>
                          <span className={styles.tocTitle}>7. Compartilhamento Ao Vivo</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 8</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(9)}>
                          <span className={styles.tocTitle}>8. Gerenciamento de Alunos</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 9</span>
                        </button>
                        <button className={styles.tocRow} onClick={() => jumpToPage(10)}>
                          <span className={styles.tocTitle}>9. Níveis de Planos e Upgrade</span>
                          <span className={styles.tocDots}></span>
                          <span className={styles.tocPage}>Pág. 10</span>
                        </button>
                      </div>
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 1</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 1: VISÃO GERAL & CRIANDO AULAS (Frente: Pág 2, Verso: Pág 3) ── */}
              <div className={`${styles.sheet} ${spread > 1 ? styles.sheetFlipped : ''} ${spread === 1 ? styles.sheetActive : ''} ${activePageMobile === 2 ? styles.sheetActiveMobile : ''}`}>
                <div className={styles.pageShadow}></div>

                {/* Pág 2 (Frente): Visão Geral */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Capítulo 1</span>
                      <span className={styles.pageHeaderChapter}>Visão Geral</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Visão Geral do Painel</h2>
                      <p>
                        A Área da Professora foi estruturada para centralizar todos os recursos de controle pedagógico e de comunicação de forma intuitiva.
                      </p>
                      <p>Na barra superior, você tem acesso rápido a:</p>
                      <ul className={styles.featureList}>
                        <li><strong>Plano Ativo:</strong> Exibe se você está no plano Básico, Pro ou Escola.</li>
                        <li><strong>Olá, Professora:</strong> Identificação de perfil logado.</li>
                        <li><strong>Ver como Aluno:</strong> Entra no modo de simulação para ver exatamente como a trilha de aulas e os materiais aparecem para os estudantes.</li>
                      </ul>
                      <div className={styles.highlightBox}>
                        <strong>Acesso Rápido por Abas</strong>
                        O menu de abas logo abaixo da barra superior permite trocar instantaneamente entre visualização de aulas, painel de criação, gravador, transmissor de lives e gerenciador de alunos.
                      </div>
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 2</span>
                    </div>
                  </div>
                </div>

                {/* Pág 3 (Verso): Criando Aulas */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Capítulo 2</span>
                      <span className={styles.pageHeaderChapter}>Criação</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Criando e Publicando Aulas</h2>
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
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 3</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 2: IMPORTAÇÃO & GRAVAÇÃO (Frente: Pág 4, Verso: Pág 5) ── */}
              <div className={`${styles.sheet} ${spread > 2 ? styles.sheetFlipped : ''} ${spread === 2 ? styles.sheetActive : ''} ${activePageMobile === 4 ? styles.sheetActiveMobile : ''}`}>
                <div className={styles.pageShadow}></div>

                {/* Pág 4 (Frente): Importação de Documentos */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Capítulo 3</span>
                      <span className={styles.pageHeaderChapter}>Importação</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Importação Rápida (Aba Importar Doc)</h2>
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
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 4</span>
                    </div>
                  </div>
                </div>

                {/* Pág 5 (Verso): Gravação de Aulas */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Capítulo 4</span>
                      <span className={styles.pageHeaderChapter}>Gravação</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Gravação de Vídeo-Aulas</h2>
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
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 5</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 3: LIVE & UPLOAD DE MATERIAIS (Frente: Pág 6, Verso: Pág 7) ── */}
              <div className={`${styles.sheet} ${spread > 3 ? styles.sheetFlipped : ''} ${spread === 3 ? styles.sheetActive : ''} ${activePageMobile === 6 ? styles.sheetActiveMobile : ''}`}>
                <div className={styles.pageShadow}></div>

                {/* Pág 6 (Frente): Transmissões Ao Vivo */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle5}>Capítulo 5</span>
                      <span className={styles.pageHeaderChapter}>Transmissão</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Transmissões Ao Vivo</h2>
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
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 6</span>
                    </div>
                  </div>
                </div>

                {/* Pág 7 (Verso): Upload de Materiais */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Capítulo 6</span>
                      <span className={styles.pageHeaderChapter}>Materiais</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Upload de Materiais de Apoio</h2>
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
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 7</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 4: COMPARTILHAMENTO & ALUNOS (Frente: Pág 8, Verso: Pág 9) ── */}
              <div className={`${styles.sheet} ${spread > 4 ? styles.sheetFlipped : ''} ${spread === 4 ? styles.sheetActive : ''} ${activePageMobile === 8 ? styles.sheetActiveMobile : ''}`}>
                <div className={styles.pageShadow}></div>

                {/* Pág 8 (Frente): Compartilhamento Ao Vivo */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Capítulo 7</span>
                      <span className={styles.pageHeaderChapter}>Ao Vivo</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Compartilhamento em Tempo Real</h2>
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
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 8</span>
                    </div>
                  </div>
                </div>

                {/* Pág 9 (Verso): Gerenciamento de Alunos */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Capítulo 8</span>
                      <span className={styles.pageHeaderChapter}>Controle</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Gerenciamento de Alunos</h2>
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
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 9</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── FOLHA 5: PLANOS & CONTRA-CAPA (Frente: Pág 10, Verso: Pág 11) ── */}
              <div className={`${styles.sheet} ${spread === 5 ? styles.sheetActive : ''} ${activePageMobile === 10 ? styles.sheetActiveMobile : ''}`}>
                <div className={styles.pageShadow}></div>

                {/* Pág 10 (Frente): Planos */}
                <div className={`${styles.pageFace} ${styles.pageFaceFront}`}>
                  <div className={styles.contentPage}>
                    <div className={styles.pageHeader}>
                      <span className={styles.pageHeaderTitle}>Capítulo 9</span>
                      <span className={styles.pageHeaderChapter}>Planos</span>
                    </div>
                    <div className={styles.pageBody}>
                      <h2>Níveis de Planos e Upgrade</h2>
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
                    </div>
                    <div className={styles.pageFooter}>
                      <span>My Voice — Manual do Professor</span>
                      <span>Página 10</span>
                    </div>
                  </div>
                </div>

                {/* Pág 11 (Verso): Contra-capa / Final */}
                <div className={`${styles.pageFace} ${styles.pageFaceBack}`}>
                  <div className={styles.contentPage} style={{ background: '#091526', color: '#fff', height: '100%', margin: '-2.2rem', padding: '2.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={styles.pageHeader} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className={styles.pageHeaderTitle} style={{ color: '#94a3b8' }}>Fim</span>
                      <span className={styles.pageHeaderChapter} style={{ color: '#d4af37' }}>Suporte</span>
                    </div>
                    <div className={styles.pageBody} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
                      <HelpCircle size={48} style={{ color: '#d4af37', margin: '0 auto 1.5rem auto' }} />
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>Dúvidas ou Suporte?</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '85%', margin: '0 auto' }}>
                        Se encontrar qualquer dificuldade com a câmera, microfone, uploads de documentos ou se precisar de ajuda com o streaming de vídeo ao vivo, entre em contato com o nosso time de suporte técnico.
                      </p>
                      <p style={{ color: '#d4af37', fontSize: '0.85rem', fontWeight: 700, marginTop: '1.5rem' }}>
                        suporte@myvoice.com.br
                      </p>
                    </div>
                    <div className={styles.pageFooter} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                      <span>Plataforma My Voice</span>
                      <span>Página 11</span>
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
              aria-label="Página anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <span className={styles.pageIndicator}>
              Folha {spread + 1} de {totalSpreads} (Págs. {spread === 0 ? 'Capa' : spread * 2 - 1} - {spread === 0 ? '1' : spread * 2})
            </span>
            <button 
              className={styles.navArrow} 
              onClick={handleNext} 
              disabled={spread === totalSpreads - 1}
              aria-label="Próxima página"
            >
              <ChevronRight size={24} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
