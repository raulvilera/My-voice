import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, LogOut, Users, BookOpen, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const navigate       = useNavigate();
  const { profile, signOut } = useAuth();
  const [alunos, setAlunos]  = useState([]);
  const [busca, setBusca]    = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAlunos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'aluno')
      .order('created_at', { ascending: false });
    setAlunos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAlunos(); }, []);

  const toggleAtivo = async (aluno) => {
    await supabase
      .from('profiles')
      .update({ ativo: !aluno.ativo })
      .eq('id', aluno.id);
    setAlunos(prev => prev.map(a => a.id === aluno.id ? { ...a, ativo: !a.ativo } : a));
  };

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const alunosFiltrados = alunos.filter(a =>
    a.name.toLowerCase().includes(busca.toLowerCase()) ||
    a.email.toLowerCase().includes(busca.toLowerCase())
  );

  const ativos   = alunos.filter(a => a.ativo).length;
  const inativos = alunos.length - ativos;

  return (
    <div className={styles.adminContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <Mic size={26} className={styles.logoIcon}/>
          <div>
            <h2>My Voice</h2>
            <span className={styles.roleTag}>Área da Professora</span>
          </div>
        </div>
        <div className={styles.navRight}>
          <span className={styles.nomeProf}>Olá, {profile?.name?.split(' ')[0]} 👋</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18}/> Sair
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={`glass-panel ${styles.statCard}`}>
            <Users size={22} className={styles.statIcon}/>
            <div>
              <span className={styles.statNum}>{alunos.length}</span>
              <span className={styles.statLabel}>Total de alunos</span>
            </div>
          </div>
          <div className={`glass-panel ${styles.statCard}`}>
            <ToggleRight size={22} className={styles.statIconGreen}/>
            <div>
              <span className={styles.statNum}>{ativos}</span>
              <span className={styles.statLabel}>Alunos ativos</span>
            </div>
          </div>
          <div className={`glass-panel ${styles.statCard}`}>
            <ToggleLeft size={22} className={styles.statIconRed}/>
            <div>
              <span className={styles.statNum}>{inativos}</span>
              <span className={styles.statLabel}>Inativas</span>
            </div>
          </div>
          <div className={`glass-panel ${styles.statCard}`}>
            <BookOpen size={22} className={styles.statIconPurple}/>
            <div>
              <span className={styles.statNum}>2</span>
              <span className={styles.statLabel}>Aulas publicadas</span>
            </div>
          </div>
        </div>

        {/* Lista de alunos */}
        <div className={`glass-panel ${styles.alunosPanel}`}>
          <div className={styles.panelHeader}>
            <h3>Alunos cadastrados</h3>
            <div className={styles.buscaField}>
              <Search size={16}/>
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail…"
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className={styles.loadingMsg}>Carregando alunos…</p>
          ) : alunosFiltrados.length === 0 ? (
            <p className={styles.emptyMsg}>Nenhum aluno encontrado.</p>
          ) : (
            <div className={styles.alunosList}>
              {alunosFiltrados.map(aluno => (
                <div key={aluno.id} className={`${styles.alunoRow} ${!aluno.ativo ? styles.inativo : ''}`}>
                  <div className={styles.alunoAvatar}>
                    {aluno.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.alunoInfo}>
                    <span className={styles.alunoNome}>{aluno.name}</span>
                    <span className={styles.alunoEmail}>{aluno.email}</span>
                  </div>
                  <div className={styles.alunoMeta}>
                    <span className={styles.alunoData}>
                      {new Date(aluno.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className={`${styles.statusBadge} ${aluno.ativo ? styles.ativo : styles.bloqueado}`}>
                      {aluno.ativo ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </div>
                  <button
                    className={`${styles.toggleBtn} ${aluno.ativo ? styles.toggleBtnAtivo : styles.toggleBtnInativo}`}
                    onClick={() => toggleAtivo(aluno)}
                    title={aluno.ativo ? 'Bloquear acesso' : 'Liberar acesso'}
                  >
                    {aluno.ativo ? <ToggleRight size={22}/> : <ToggleLeft size={22}/>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

