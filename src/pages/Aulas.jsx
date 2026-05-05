import { useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, BarChart, ChevronRight } from 'lucide-react';
import styles from './Aulas.module.css';

const modulos = [
  { id: 1, titulo: 'Frações e Porcentagem', progresso: 80, tipo: 'video', duracao: '15 min' },
  { id: 2, titulo: 'Equações do 1º Grau', progresso: 45, tipo: 'simulador', duracao: 'Prática' },
  { id: 3, titulo: 'Geometria Espacial', progresso: 0, tipo: 'misto', duracao: '30 min' },
];

const Aulas = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.aulasContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <BookOpen className={styles.logoIcon} />
          <h2>My voice</h2>
        </div>
        <div className={styles.navActions}>
          <span className={styles.badgeInfo}>Matemática - 8º Ano</span>
          <button className={styles.logoutBtn} onClick={() => navigate('/dashboard')}>
            Voltar
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <div>
            <h1>Seus Módulos de Estudo</h1>
            <p className={styles.subtitle}>Continue de onde parou e conquiste seus objetivos!</p>
          </div>
          <div className={styles.stats}>
            <div className={`glass-panel ${styles.statBox}`}>
              <BarChart className={styles.statIcon} />
              <div>
                <strong>Nível 5</strong>
                <span>Mestre das Frações</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modulosGrid}>
          {modulos.map((mod) => (
            <div key={mod.id} className={`glass-panel ${styles.moduloCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <PlayCircle size={32} />
                </div>
                {mod.progresso === 100 && <span className={styles.badgeConcluido}>Concluído</span>}
              </div>
              
              <h3>{mod.titulo}</h3>
              <p className={styles.info}>{mod.duracao} • {mod.tipo}</p>
              
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${mod.progresso}%` }}></div>
              </div>
              <span className={styles.progressText}>{mod.progresso}% Completo</span>

              <button 
                className={`btn-primary ${styles.playBtn}`}
                onClick={() => navigate(`/modulo/${mod.id}`)}
              >
                {mod.progresso > 0 ? 'Continuar' : 'Iniciar'}
                <ChevronRight size={20} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Aulas;
