import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, LogOut, Users, BookOpen, ToggleLeft, ToggleRight, Search, Plus, Eye, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import NovaAula from './NovaAula';
import { SecaoDialogo } from '../components/SecaoDialogo';
import { SecaoVerbos } from '../components/SecaoVerbos';
import { SecaoVocabulario } from '../components/SecaoVocabulario';
import { SecaoExercicios } from '../components/SecaoExercicios';
import styles from './AdminDashboard.module.css';

// ── Preview de aulas (igual ao aluno) ────────────────────────────────────────
const PreviewAulas = () => {
  const [aulas, setAulas] = useState([]);
  const [aulaAberta, setAulaAberta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAulas = async () => {
      const { data } = await supabase
        .from('aulas')
        .select('*, secoes(*)')
        .order('numero');
      setAulas(data || []);
      setLoading(false);
    };
    fetchAulas();
  }, []);

  const renderSecao = (sec, idx) => {
    const dados = { ...sec.conteudo, titulo: sec.titulo };
    switch (sec.tipo) {
      case 'dialogo':     return <SecaoDialogo     key={idx} section={dados}/>;
      case 'verbos':      return <SecaoVerbos      key={idx} section={dados}/>;
      case 'vocabulario': return <SecaoVocabulario key={idx} section={dados}/>;
      case 'exercicios':  return <SecaoExercicios  key={idx} section={dados}/>;
      default: return null;
    }
  };

  if (loading) return <p className={styles.loadingMsg}>Carregando aulas…</p>;
  if (aulas.length === 0) return <p className={styles.emptyMsg}>Nenhuma aula cadastrada ainda.</p>;

  return (
    <div className={styles.previewContainer}>
      {aulas.map(aula => (
        <div key={aula.id} className={`glass-panel ${styles.aulaCard}`}>
          <div className={styles.aulaCardHeader}>
            <div className={styles.aulaNumero}>{String(aula.numero).padStart(2,'0')}</div>
            <div className={styles.aulaInfo}>
              <span className={`${styles.statusBadge} ${aula.publicada ? styles.ativo : styles.bloqueado}`}>
                {aula.publicada ? 'Publicada' : 'Rascunho'}
              </span>
              <h3>{aula.titulo}</h3>
              <p>{aula.subtitulo}</p>
            </div>
            <button className={styles.previewBtn} onClick={() => setAulaAberta(aula)}>
              <Eye size={16}/> Ver
            </button>
          </div>
        </div>
      ))}

      {aulaAberta && (
        <div className={styles.modalOverlay} onClick={() => setAulaAberta(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.aulaTag}>Aula {aulaAberta.numero}</span>
                <h2>{aulaAberta.titulo}</h2>
                <p>{aulaAberta.subtitulo}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setAulaAberta(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {(aulaAberta.secoes || [])
                .sort((a,b) => a.ordem - b.ordem)
                .map((sec, idx) => renderSecao(sec, idx))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Gerenciar Alunos ──────────────────────────────────────────────────────────
const GerenciarAlunos = () => {
  const [alunos, setAlunos]   = useState([]);
  const [busca, setBusca]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role','aluno').order('created_at', { ascending: false });
      setAlunos(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleAtivo = async (aluno) => {
    await supabase.from('profiles').update({ ativo: !aluno.ativo }).eq('id', aluno.id);
    setAlunos(prev => prev.map(a => a.id === aluno.id ? { ...a, ativo: !a.ativo } : a));
  };

  const filtrados = alunos.filter(a =>
    (a.name||'').toLowerCase().includes(busca.toLowerCase()) ||
    (a.email||'').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.alunosPanel}>
      <div className={styles.panelHeader}>
        <div className={styles.statsRow}>
          <span className={styles.statChip}><Users size={14}/> {alunos.length} total</span>
          <span className={styles.statChip} style={{color:'var(--color-success)'}}><ToggleRight size={14}/> {alunos.filter(a=>a.ativo).length} ativos</span>
          <span className={styles.statChip} style={{color:'var(--color-danger)'}}><ToggleLeft size={14}/> {alunos.filter(a=>!a.ativo).length} bloqueados</span>
        </div>
        <div className={styles.buscaField}>
          <Search size={16}/>
          <input type="text" placeholder="Buscar…" value={busca} onChange={e => setBusca(e.target.value)}/>
        </div>
      </div>

      {loading ? <p className={styles.loadingMsg}>Carregando alunos…</p>
      : filtrados.length === 0 ? <p className={styles.emptyMsg}>Nenhum aluno encontrado.</p>
      : (
        <div className={styles.alunosList}>
          {filtrados.map(aluno => (
            <div key={aluno.id} className={`${styles.alunoRow} ${!aluno.ativo ? styles.inativo : ''}`}>
              <div className={styles.alunoAvatar}>{(aluno.name||'A').charAt(0).toUpperCase()}</div>
              <div className={styles.alunoInfo}>
                <span className={styles.alunoNome}>{aluno.name || 'Sem nome'}</span>
                <span className={styles.alunoEmail}>{aluno.email}</span>
              </div>
              <div className={styles.alunoMeta}>
                <span className={styles.alunoData}>{new Date(aluno.created_at).toLocaleDateString('pt-BR')}</span>
                <span className={`${styles.statusBadge} ${aluno.ativo ? styles.ativo : styles.bloqueado}`}>
                  {aluno.ativo ? 'Ativo' : 'Bloqueado'}
                </span>
              </div>
              <button
                className={`${styles.toggleBtn} ${aluno.ativo ? styles.toggleBtnAtivo : styles.toggleBtnInativo}`}
                onClick={() => toggleAtivo(aluno)}
              >
                {aluno.ativo ? <ToggleRight size={22}/> : <ToggleLeft size={22}/>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Admin Principal ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [aba, setAba] = useState('aulas');

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const ABAS = [
    { id: 'aulas',    label: 'Aulas',         icon: <Eye size={16}/> },
    { id: 'nova',     label: 'Nova Aula',      icon: <Plus size={16}/> },
    { id: 'alunos',   label: 'Alunos',         icon: <Users size={16}/> },
  ];

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
          <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={18}/> Sair</button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.tabsBar}>
          {ABAS.map(a => (
            <button key={a.id} className={`${styles.tabBtn} ${aba === a.id ? styles.tabBtnActive : ''}`} onClick={() => setAba(a.id)}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>

        {aba === 'aulas'  && <PreviewAulas />}
        {aba === 'nova'   && <NovaAula onSalvo={() => setAba('aulas')} />}
        {aba === 'alunos' && <GerenciarAlunos />}
      </main>
    </div>
  );
};

export default AdminDashboard;
