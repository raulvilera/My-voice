import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, ChevronRight, GraduationCap, Sparkles } from 'lucide-react';
import styles from './Dashboard.module.css';

const anos = ['6º Ano', '7º Ano', '8º Ano', '9º Ano'];
const disciplinas = [
  { id: 'mat', nome: 'Matemática', cor: 'var(--color-primary)', icone: '📐' },
  { id: 'por', nome: 'Português', cor: 'var(--color-secondary)', icone: '📚' },
  { id: 'cie', nome: 'Ciências', cor: 'var(--color-success)', icone: '🔬' },
  { id: 'his', nome: 'História', cor: 'var(--color-warning)', icone: '🏛️' },
  { id: 'geo', nome: 'Geografia', cor: 'var(--color-tertiary)', icone: '🌍' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('');

  const handleContinuar = () => {
    if (anoSelecionado && disciplinaSelecionada) {
      navigate('/trilha', { state: { ano: anoSelecionado, disciplina: disciplinaSelecionada } });
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <BookOpen className={styles.logoIcon} />
          <h2>EduReforço</h2>
        </div>
        <button className={styles.logoutBtn} onClick={() => navigate('/login')}>
          <LogOut size={20} />
          Sair
        </button>
      </nav>

      <main className={styles.mainContent}>
        <header className={styles.welcomeHeader}>
          <h1 className="text-gradient">Monte seu Reforço Ideal <Sparkles className={styles.sparkle} /></h1>
          <p>Escolha o ano e a disciplina que você quer dominar.</p>
        </header>

        <div className={styles.selectionArea}>
          {/* Seleção de Ano */}
          <section className={`glass-panel ${styles.section}`}>
            <h3><GraduationCap size={24} /> 1. Qual o seu ano escolar?</h3>
            <div className={styles.gridBtn}>
              {anos.map((ano) => (
                <button
                  key={ano}
                  className={`${styles.optionBtn} ${anoSelecionado === ano ? styles.selected : ''}`}
                  onClick={() => setAnoSelecionado(ano)}
                >
                  {ano}
                </button>
              ))}
            </div>
          </section>

          {/* Seleção de Disciplina */}
          <section className={`glass-panel ${styles.section} ${!anoSelecionado ? styles.disabled : ''}`}>
            <h3><BookOpen size={24} /> 2. Escolha a disciplina</h3>
            <div className={styles.gridCards}>
              {disciplinas.map((disc) => (
                <div
                  key={disc.id}
                  className={`${styles.cardDisciplina} ${disciplinaSelecionada === disc.id ? styles.cardSelected : ''}`}
                  style={{ '--card-color': disc.cor }}
                  onClick={() => anoSelecionado && setDisciplinaSelecionada(disc.id)}
                >
                  <span className={styles.cardIcon}>{disc.icone}</span>
                  <span className={styles.cardName}>{disc.nome}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.actionArea}>
          <button 
            className={`btn-primary ${styles.proceedBtn}`}
            disabled={!anoSelecionado || !disciplinaSelecionada}
            onClick={handleContinuar}
          >
            Acessar Módulos
            <ChevronRight size={24} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
