import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mic, BookOpen, Star, ChevronRight, Sparkles } from 'lucide-react';
import styles from './Dashboard.module.css';

const cursos = [
  {
    id: 'basico',
    nome: 'Inglês Básico',
    descricao: 'Do zero à primeira conversa. Comece aqui.',
    icone: '🟢',
    nivel: 'Iniciante',
    aulas: 2,
    disponivel: true,
  },
  {
    id: 'intermediario1',
    nome: 'Inglês Intermediário 1',
    descricao: 'Expanda seu vocabulário e gramática.',
    icone: '🔵',
    nivel: 'Intermediário',
    aulas: 0,
    disponivel: false,
  },
  {
    id: 'intermediario2',
    nome: 'Inglês Intermediário 2',
    descricao: 'Conversação e compreensão avançada.',
    icone: '🟣',
    nivel: 'Intermediário',
    aulas: 0,
    disponivel: false,
  },
  {
    id: 'avancado',
    nome: 'Avançado',
    descricao: 'Fluência e domínio completo do idioma.',
    icone: '🟡',
    nivel: 'Avançado',
    aulas: 0,
    disponivel: false,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleAcessar = (curso) => {
    if (curso.disponivel) {
      navigate('/trilha', { state: { curso: curso.id } });
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <Mic className={styles.logoIcon} size={26} />
          <h2>My Voice</h2>
        </div>
        <button className={styles.logoutBtn} onClick={() => navigate('/login')}>
          <LogOut size={20} />
          Sair
        </button>
      </nav>

      <main className={styles.mainContent}>
        <header className={styles.welcomeHeader}>
          <h1 className="text-gradient">
            Sua voz em inglês começa aqui <Sparkles className={styles.sparkle} size={24} />
          </h1>
          <p>Escolha seu curso e inicie sua jornada de aprendizado.</p>
        </header>

        <div className={styles.cursosGrid}>
          {cursos.map((curso) => (
            <div
              key={curso.id}
              className={`glass-panel ${styles.cursoCard} ${!curso.disponivel ? styles.bloqueado : ''}`}
              onClick={() => handleAcessar(curso)}
            >
              <div className={styles.cardTop}>
                <span className={styles.cursoIcone}>{curso.icone}</span>
                <span className={`${styles.nivelBadge} ${styles[`nivel_${curso.nivel.toLowerCase().replace(' ', '_')}`]}`}>
                  {curso.nivel}
                </span>
              </div>
              <h3>{curso.nome}</h3>
              <p>{curso.descricao}</p>
              <div className={styles.cardFooter}>
                {curso.disponivel ? (
                  <>
                    <span className={styles.aulasInfo}>
                      <BookOpen size={14} /> {curso.aulas} aula{curso.aulas !== 1 ? 's' : ''} disponíveis
                    </span>
                    <span className={styles.acessarBtn}>
                      Acessar <ChevronRight size={16} />
                    </span>
                  </>
                ) : (
                  <span className={styles.breve}>🔒 Em breve</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={`glass-panel ${styles.motivaBox}`}>
          <Star size={18} className={styles.motivaStar} />
          <p>"Prática com propósito. Sua voz em inglês começa aqui."</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
