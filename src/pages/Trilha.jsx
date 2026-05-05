import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, ChevronDown, ChevronUp, PlayCircle, Gamepad2, X } from 'lucide-react';
import { bnccData } from '../data/bnccData';
import styles from './Trilha.module.css';

const ModalTema = ({ tema, onClose }) => {
  if (!tema) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`glass-panel ${styles.modalContent}`} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2 className={styles.modalTitle}>{tema.titulo}</h2>
        
        <div className={styles.modalBody}>
          <div className={styles.videoSection}>
            {tema.videoUrl ? (
              <iframe 
                className={styles.videoIframe}
                src={tema.videoUrl} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div className={styles.placeholderMedia}>Vídeo não disponível</div>
            )}
          </div>

          <div className={styles.infoSection}>
            <div className={styles.explicacaoCard}>
              <h3>Resumo</h3>
              <p>{tema.explicacao}</p>
            </div>
            
            {tema.imagemUrl && (
              <div className={styles.imageCard}>
                <img src={tema.imagemUrl} alt={tema.titulo} />
              </div>
            )}

            {tema.gameUrl && (
              <a href={tema.gameUrl} target="_blank" rel="noopener noreferrer" className={`btn-primary ${styles.gameLink}`}>
                <Gamepad2 size={20} />
                Praticar com Gamificação
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Trilha = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ano, disciplina } = location.state || {};

  const [bimestreExpandido, setBimestreExpandido] = useState(1);
  const [temaSelecionado, setTemaSelecionado] = useState(null);

  // Fallback seguro caso o usuário acesse a rota direto
  if (!ano || !disciplina) {
    return (
      <div className={styles.errorContainer}>
        <h2>Ops! Você precisa escolher um ano e disciplina primeiro.</h2>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</button>
      </div>
    );
  }

  const dadosAno = bnccData[ano] || {};
  const dadosDisciplina = dadosAno[disciplina] || null;

  const toggleBimestre = (id) => {
    setBimestreExpandido(bimestreExpandido === id ? null : id);
  };

  return (
    <div className={styles.trilhaContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <BookOpen className={styles.logoIcon} />
          <h2>My voice</h2>
        </div>
        <div className={styles.navActions}>
          <span className={styles.badgeInfo}>{ano}</span>
          <button className={styles.logoutBtn} onClick={() => navigate('/dashboard')}>
            <LogOut size={20} />
            Voltar
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className="text-gradient">
            Trilha de {dadosDisciplina ? dadosDisciplina.nome : 'Disciplina'}
          </h1>
          <p>Conteúdos baseados nas diretrizes da BNCC, divididos por bimestre.</p>
        </header>

        {!dadosDisciplina ? (
          <div className={`glass-panel ${styles.noData}`}>
            <h3>Conteúdos em breve!</h3>
            <p>Estamos preparando os materiais de {disciplina} para o {ano}.</p>
          </div>
        ) : (
          <div className={styles.accordionContainer}>
            {dadosDisciplina.bimestres.map((bim) => (
              <div key={bim.id} className={`glass-panel ${styles.bimestreCard}`}>
                <button 
                  className={styles.bimestreHeader} 
                  onClick={() => toggleBimestre(bim.id)}
                >
                  <h3>{bim.nome}</h3>
                  {bimestreExpandido === bim.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>

                {bimestreExpandido === bim.id && (
                  <div className={`${styles.temasList} animate-fade-in`}>
                    {bim.temas && bim.temas.length > 0 ? (
                      bim.temas.map((tema) => (
                        <div 
                          key={tema.id} 
                          className={styles.temaItem}
                          onClick={() => setTemaSelecionado(tema)}
                        >
                          <div className={styles.temaIcon}>
                            <PlayCircle size={24} />
                          </div>
                          <div className={styles.temaInfo}>
                            <h4>{tema.titulo}</h4>
                            <p>Clique para acessar vídeo, resumo e jogos.</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyTemas}>Nenhum tema cadastrado para este bimestre ainda.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Renderiza o Modal se houver um tema selecionado */}
      <ModalTema tema={temaSelecionado} onClose={() => setTemaSelecionado(null)} />
    </div>
  );
};

export default Trilha;
