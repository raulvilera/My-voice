import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Gamepad2, FileText, CheckCircle } from 'lucide-react';
import styles from './Modulo.module.css';

const tabs = [
  { id: 'video', label: 'Vídeo Aula', icon: Video },
  { id: 'simulador', label: 'Simulador / Jogo', icon: Gamepad2 },
  { id: 'resumo', label: 'Infográfico', icon: FileText },
  { id: 'exercicios', label: 'Praticar', icon: CheckCircle },
];

const Modulo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('video');

  // Dados mockados baseados no ID (em um app real viria de uma API)
  const moduloInfo = {
    titulo: 'Frações e Porcentagem - Aplicações Reais',
    descricao: 'Aprenda como utilizar frações para calcular descontos e juros em situações do dia a dia.',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'video':
        return (
          <div className={`${styles.contentWrapper} animate-fade-in`}>
            <div className={styles.videoContainer}>
              <div className={styles.placeholderVideo}>
                <Video size={64} color="var(--color-primary)" />
                <p>O vídeo da aula seria carregado aqui.</p>
              </div>
            </div>
            <h3>{moduloInfo.titulo}</h3>
            <p className={styles.description}>{moduloInfo.descricao}</p>
          </div>
        );
      case 'simulador':
        return (
          <div className={`${styles.contentWrapper} animate-fade-in`}>
            <div className={styles.gameContainer}>
              <div className={styles.placeholderGame}>
                <Gamepad2 size={64} color="var(--color-tertiary)" className="animate-pulse-glow" style={{ borderRadius: '50%' }} />
                <h3>Mercadinho das Frações</h3>
                <p>Simulador interativo: calcule o troco e os descontos!</p>
                <button className="btn-primary" style={{ marginTop: '1rem' }}>Iniciar Simulador</button>
              </div>
            </div>
          </div>
        );
      case 'resumo':
        return (
          <div className={`${styles.contentWrapper} animate-fade-in`}>
            <div className={styles.infographicContainer}>
              <div className={styles.placeholderInfo}>
                <FileText size={64} color="var(--color-warning)" />
                <h3>Mapa Mental Resumo</h3>
                <div className={styles.fakeImage}>Gráfico Rico Visualmente</div>
              </div>
            </div>
          </div>
        );
      case 'exercicios':
        return (
          <div className={`${styles.contentWrapper} animate-fade-in`}>
            <div className={`glass-panel ${styles.quizContainer}`}>
              <h3>Quiz Contextualizado</h3>
              <p>Se uma pizza custa R$ 40,00 e você tem um desconto de 25%, quanto você irá pagar?</p>
              <div className={styles.quizOptions}>
                <button className={styles.quizBtn}>R$ 10,00</button>
                <button className={styles.quizBtn}>R$ 30,00</button>
                <button className={styles.quizBtn}>R$ 25,00</button>
                <button className={styles.quizBtn}>R$ 35,00</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.moduloPage}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/aulas')}>
          <ArrowLeft size={24} />
          Voltar às Aulas
        </button>
        <h2>Módulo {id}</h2>
      </header>

      <main className={styles.mainContainer}>
        {/* Sidebar Tabs */}
        <aside className={`glass-panel ${styles.sidebar}`}>
          <div className={styles.tabsList}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <section className={`glass-panel ${styles.contentArea}`}>
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default Modulo;
