import { useState, useEffect, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Mic, LogOut, Users, ToggleLeft, ToggleRight, Search,
  Plus, Eye, X, Upload, FileText, Loader2,
  MessageCircle, BookMarked, Grid3x3, PenLine, GraduationCap,
  CreditCard, Crown, Zap, Bot, Video,
} from 'lucide-react';
import Trilha from './Trilha';
import { useAuth } from '../contexts/AuthContext';

// ── Bandeira dos EUA SVG inline ───────────────────────────────────────────────
const BandeiraEUA = ({ size = 32 }) => (
  <svg width={size} height={size * 0.526} viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 3, display: 'block' }}>
    {/* Listras */}
    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
      <rect key={i} x="0" y={i * 400/13} width="760" height={400/13}
        fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'} />
    ))}
    {/* Cantão azul */}
    <rect x="0" y="0" width="303" height={400 * 7/13} fill="#3C3B6E" />
    {/* Estrelas */}
    {Array.from({ length: 50 }).map((_, idx) => {
      const row = Math.floor(idx / 6) % 2 === 0 ? Math.floor(idx / 6) : Math.floor(idx / 5);
      const col = idx % (Math.floor(idx / 6) % 2 === 0 ? 6 : 5);
      const isOddRow = Math.floor(idx / 6) % 2 !== 0;
      const cx = isOddRow ? 30 + col * 50 + 25 : 30 + col * 50;
      const cy = Math.floor(idx / (isOddRow ? 5 : 6)) * 26 + (isOddRow ? 13 : 0) + 16;
      return <polygon key={idx} points="0,-9 2.6,-4 9,-4 4,0 6,6 0,3 -6,6 -4,0 -9,-4 -2.6,-4"
        transform={`translate(${cx},${cy})`} fill="white" />;
    })}
  </svg>
);
import { supabase } from '../lib/supabaseClient';
import NovaAula from './NovaAula';
import Planos from './Planos';
import VideoEducacional from '../components/VideoEducacional';
const GravacaoAula = lazy(() =>
  import('../components/GravacaoAula').catch(() => ({ default: () => <p style={{color:'#94a3b8',padding:'2rem'}}>Componente de gravação não encontrado. Verifique se GravacaoAula.jsx está em src/components/.</p> }))
);
import { SecaoDialogo }    from '../components/SecaoDialogo';
import { SecaoVerbos }     from '../components/SecaoVerbos';
import { SecaoVocabulario }from '../components/SecaoVocabulario';
import { SecaoExercicios } from '../components/SecaoExercicios';
import styles from './AdminDashboard.module.css';

// ── Agente IA: registra atividade automaticamente ────────────────────────────
const EDGE_URL = 'https://ppzvwhkvwupmfmijrkkl.supabase.co/functions/v1/registrar-atividade';

const dispararAgenteRegistro = async ({ aula_id, professor_id, titulo, subtitulo, tag, secoes, origem }) => {
  try {
    const resp = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aula_id, professor_id, titulo, subtitulo, tag, secoes, origem }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.registro || null;
  } catch { return null; }
};

// ── Pílulas de seção ──────────────────────────────────────────────────────────
const PILL_INFO = {
  dialogo:     { emoji: '💬', label: 'Diálogo',     icon: <MessageCircle size={12}/>, cor: '#8b5cf6' },
  verbos:      { emoji: '📘', label: 'Verbos',      icon: <BookMarked    size={12}/>, cor: '#06b6d4' },
  vocabulario: { emoji: '📖', label: 'Vocabulário', icon: <Grid3x3       size={12}/>, cor: '#ec4899' },
  exercicios:  { emoji: '✏️', label: 'Exercícios',  icon: <PenLine       size={12}/>, cor: '#f59e0b' },
};

// ── Preview de aulas ──────────────────────────────────────────────────────────
const PreviewAulas = ({ plano = 'basico' }) => {
  const [aulas, setAulas]         = useState([]);
  const [aulaAberta, setAulaAberta] = useState(null);
  const [secAberta, setSecAberta]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        console.warn('[AdminDashboard] Timeout de segurança atingido');
        setLoading(false);
      }
    }, 8000);

    (async () => {
      try {
        console.log('[AdminDashboard] Iniciando busca de aulas...');

        // Busca aulas com suas seções em uma única query otimizada
        const { data: soAulas, error: errAulas } = await supabase
          .from('aulas')
          .select('*, secoes(*)')
          .order('numero');

        console.log('[AdminDashboard] Aulas com seções:', soAulas, 'Erro:', errAulas);

        if (errAulas) {
          console.error('[AdminDashboard] Erro ao buscar aulas:', errAulas);
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          setAulas(soAulas || []);
          setLoading(false);
        }
      } catch (e) {
        console.error('[AdminDashboard] Exceção:', e);
        if (isMounted) setLoading(false);
      } finally {
        clearTimeout(safetyTimer);
      }
    })();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const renderSecao = (sec, idx, tituloAula) => {
    const dados = { ...sec.conteudo, titulo: sec.titulo };
    return (
      <div key={idx}>
        {/* Vídeo educacional gerado por IA para cada seção */}
        <VideoEducacional
          tituloAula={tituloAula}
          tipoSecao={sec.tipo}
          conteudoSecao={sec.conteudo}
          plano={plano}
        />
        {(() => {
          switch (sec.tipo) {
            case 'dialogo':     return <SecaoDialogo     section={dados}/>;
            case 'verbos':      return <SecaoVerbos      section={dados}/>;
            case 'vocabulario': return <SecaoVocabulario section={dados}/>;
            case 'exercicios':  return <SecaoExercicios  section={dados} aulaId={aulaAberta?.id}/>;
            default: return null;
          }
        })()}
      </div>
    );
  };

  const abrirSecao = (aula, tipo, e) => {
    e.stopPropagation();
    setAulaAberta(aula);
    setSecAberta(tipo);
  };

  const fecharModal = () => { setAulaAberta(null); setSecAberta(null); };

  const secoesModal = aulaAberta
    ? (aulaAberta.secoes || [])
        .sort((a, b) => a.ordem - b.ordem)
        .filter(s => !secAberta || s.tipo === secAberta)
    : [];

  const subtituloModal = secAberta
    ? (PILL_INFO[secAberta]?.emoji + ' ' + PILL_INFO[secAberta]?.label)
    : '📋 Aula completa';

  if (loading) return (
    <div>
      <p className={styles.loadingMsg}>Carregando aulas…</p>
      <p style={{color:'#64748b',fontSize:'0.75rem',textAlign:'center',marginTop:'0.5rem'}}>
        Se esta mensagem persistir por mais de 5 segundos, abra o Console (F12) e verifique os erros.
      </p>
    </div>
  );
  if (aulas.length === 0) return <p className={styles.emptyMsg}>Nenhuma aula cadastrada ainda.</p>;

  return (
    <div className={styles.previewContainer}>
      {aulas.map(aula => (
        <div key={aula.id} className={`glass-panel ${styles.aulaCard}`}>
          <div className={styles.aulaCardHeader}>
            <div className={styles.aulaNumero}>{String(aula.numero).padStart(2, '0')}</div>
            <div className={styles.aulaInfo}>
              <span className={`${styles.statusBadge} ${aula.publicada ? styles.ativo : styles.bloqueado}`}>
                {aula.publicada ? 'Publicada' : 'Rascunho'}
              </span>
              <h3>{aula.titulo}</h3>
              <p>{aula.subtitulo}</p>

              {/* ── Pílulas de seção ── */}
              {(aula.secoes || []).length > 0 && (
                <div className={styles.pillsRow}>
                  {(aula.secoes)
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((sec, si) => {
                      const info = PILL_INFO[sec.tipo];
                      if (!info) return null;
                      return (
                        <button
                          key={si}
                          className={styles.sectionPillBtn}
                          style={{ '--pill-cor': info.cor }}
                          onClick={(e) => abrirSecao(aula, sec.tipo, e)}
                          title={`Ver ${info.label}`}
                        >
                          {info.icon}
                          <span>{info.emoji} {info.label}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* ── Botão Ver (estilizado) ── */}
            <button
              className={styles.previewBtn}
              onClick={() => { setAulaAberta(aula); setSecAberta(null); }}
            >
              <Eye size={15}/>
              <span>Ver tudo</span>
            </button>
          </div>
        </div>
      ))}

      {/* ── Modal via Portal (evita bloqueio do backdrop-filter do glass-panel) ── */}
      {aulaAberta && createPortal(
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.aulaTag}>Aula {aulaAberta.numero}</span>
                <h2>{aulaAberta.titulo}</h2>
                <p>{aulaAberta.subtitulo}</p>
                <p className={styles.modalSubtitleSec}>{subtituloModal}</p>
              </div>
              <button className={styles.closeBtnModal} onClick={fecharModal} aria-label="Fechar">
                <X size={20}/>
              </button>
            </div>
            <div className={styles.modalBody}>
              {secoesModal.map((sec, idx) => renderSecao(sec, idx, aulaAberta.titulo))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ── Upload de Documento ───────────────────────────────────────────────────────
const UploadDocumento = ({ onSalvo }) => {
  const { user } = useAuth();
  const [arquivo, setArquivo]     = useState(null);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro]           = useState('');
  const [salvando, setSalvando]   = useState(false);
  const [sucesso, setSucesso]     = useState('');

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || f.type === 'text/plain'
      || f.name.endsWith('.docx')
      || f.name.endsWith('.txt');
    if (!ok) { setErro('Use um arquivo .docx ou .txt exportado do Word/Google Docs.'); return; }
    setArquivo(f); setErro(''); setResultado(null);
  };

  const salvar = async (publicar = false) => {
    if (!resultado) return;
    setSalvando(true); setErro('');
    try {
      const { data: aulasExist } = await supabase.from('aulas').select('numero').order('numero', { ascending: false }).limit(1);
      const numero = (aulasExist?.[0]?.numero || 0) + 1;

      const { data: aula, error: aulaErr } = await supabase
        .from('aulas')
        .insert({ numero, titulo: resultado.titulo, subtitulo: resultado.subtitulo || '', tag: 'Iniciante', publicada: publicar })
        .select().single();
      if (aulaErr) throw aulaErr;

      const secoesData = (resultado.secoes || []).map((s, i) => ({
        aula_id: aula.id,
        tipo: s.tipo,
        titulo: s.titulo,
        conteudo: s.conteudo,
        ordem: i,
      }));
      const { error: secErr } = await supabase.from('secoes').insert(secoesData);
      if (secErr) throw secErr;

      // ── Agente IA registra a atividade importada automaticamente ─────────
      dispararAgenteRegistro({
        aula_id: aula.id,
        professor_id: user?.id,
        titulo: resultado.titulo,
        subtitulo: resultado.subtitulo || '',
        tag: 'Iniciante',
        secoes: secoesData,
        origem: 'upload',
      }).catch(err => console.warn('[Upload] Erro ao disparar agente:', err));

      setSucesso(publicar ? 'Aula publicada!' : 'Salva como rascunho!');
      setTimeout(() => { setSucesso(''); onSalvo?.(); }, 2000);
    } catch (e) {
      setErro('Erro ao salvar: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadCard}>
        <div className={styles.uploadIcon}><Upload size={32}/></div>
        <h3>Importar Aula de Documento</h3>
        <p className={styles.uploadDesc}>
          Envie um arquivo <strong>.docx</strong> (Word / Google Docs exportado) ou <strong>.txt</strong>.
          Você poderá editar o conteúdo manualmente antes de salvar.
        </p>

        <label className={styles.fileLabel}>
          <FileText size={16}/>
          {arquivo ? arquivo.name : 'Escolher arquivo (.docx ou .txt)'}
          <input type="file" accept=".docx,.txt" onChange={handleFile} style={{ display: 'none' }}/>
        </label>

        {erro && <div className={styles.erroBox}>{erro}</div>}
        {sucesso && <div className={styles.sucessoBox}>{sucesso}</div>}
      </div>

      {/* Preview do resultado */}
      {resultado && (
        <div className={styles.resultadoCard}>
          <div className={styles.resultadoHeader}>
            <div>
              <h3>{resultado.titulo}</h3>
              {resultado.subtitulo && <p>{resultado.subtitulo}</p>}
            </div>
            <div className={styles.pillsRow}>
              {(resultado.secoes || []).map((s, i) => {
                const info = PILL_INFO[s.tipo];
                return info ? (
                  <span key={i} className={styles.sectionPillStatic} style={{ '--pill-cor': info.cor }}>
                    {info.emoji} {info.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          <p className={styles.resultadoInfo}>
            ✅ {resultado.secoes?.length || 0} seção(ões) detectada(s).
          </p>

          <div className={styles.resultadoBtns}>
            <button className={styles.salvarBtn} onClick={() => salvar(false)} disabled={salvando}>
              {salvando ? <Loader2 size={16} className={styles.spin}/> : <Plus size={16}/>}
              {salvando ? 'Salvando…' : 'Salvar como Rascunho'}
            </button>
            <button className={styles.publicarBtn} onClick={() => salvar(true)} disabled={salvando}>
              {salvando ? <Loader2 size={16} className={styles.spin}/> : <Eye size={16}/>}
              {salvando ? 'Publicando…' : 'Publicar Aula'}
            </button>
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
    let isMounted = true;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'aluno').order('created_at', { ascending: false });
      if (isMounted) {
        setAlunos(data || []);
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const toggleAtivo = async (aluno) => {
    await supabase.from('profiles').update({ ativo: !aluno.ativo }).eq('id', aluno.id);
    setAlunos(prev => prev.map(a => a.id === aluno.id ? { ...a, ativo: !a.ativo } : a));
  };

  const filtrados = alunos.filter(a =>
    (a.name || '').toLowerCase().includes(busca.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.alunosPanel}>
      <div className={styles.panelHeader}>
        <div className={styles.statsRow}>
          <span className={styles.statChip}><Users size={14}/> {alunos.length} total</span>
          <span className={styles.statChip} style={{ color: 'var(--color-success)' }}><ToggleRight size={14}/> {alunos.filter(a => a.ativo).length} ativos</span>
          <span className={styles.statChip} style={{ color: 'var(--color-danger)' }}><ToggleLeft size={14}/> {alunos.filter(a => !a.ativo).length} bloqueados</span>
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
                <div className={styles.alunoAvatar}>{(aluno.name || 'A').charAt(0).toUpperCase()}</div>
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

// ── Modo Ver como Aluno ───────────────────────────────────────────────────────
const ModoAluno = ({ onFechar }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 300,
    display: 'flex', flexDirection: 'column',
    background: 'var(--color-bg-primary, #0f172a)',
  }}>
    {/* Banner fixo */}
    <div style={{
      background: 'linear-gradient(135deg, #7c3aed, #db2777)',
      padding: '0.6rem 1.25rem',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '1rem',
      flexShrink: 0, zIndex: 400,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <GraduationCap size={18} color="#fff"/>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
          Modo Visualização — você está vendo como o aluno vê
        </span>
      </div>
      <button
        onClick={onFechar}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: '999px', padding: '0.35rem 0.9rem',
          color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
        }}
      >
        <X size={15}/> Voltar à área da professora
      </button>
    </div>
    {/* Trilha do aluno em modo somente-leitura */}
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <Trilha modoVisualizacao />
    </div>
  </div>
);

// ── Admin Principal ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [aba, setAba] = useState('aulas');
  const [modoAluno, setModoAluno] = useState(false);

  const plano = profile?.plano || 'basico';

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const ABAS = [
    { id: 'aulas',   label: 'Aulas',          icon: <Eye size={16}/> },
    { id: 'trilha',  label: 'Trilha do Aluno', icon: <GraduationCap size={16}/> },
    { id: 'nova',    label: 'Nova Aula',       icon: <Plus size={16}/> },
    { id: 'upload',  label: 'Importar Doc',    icon: <Upload size={16}/> },
    { id: 'gravar',  label: 'Gravar Aula',     icon: <Video size={16}/> },
    { id: 'alunos',  label: 'Alunos',          icon: <Users size={16}/> },
    { id: 'planos',  label: 'Planos',          icon: <CreditCard size={16}/> },
  ];

  const planoBadgeInfo = {
    basico: { label: 'Grátis', cor: '#64748b', icone: <Mic size={12}/> },
    pro:    { label: 'Pro',    cor: '#8b5cf6', icone: <Zap size={12}/> },
    escola: { label: 'Escola', cor: '#f59e0b', icone: <Crown size={12}/> },
  }[plano] || { label: 'Grátis', cor: '#64748b', icone: <Mic size={12}/> };

  return (
    <>
    {modoAluno && <ModoAluno onFechar={() => setModoAluno(false)}/>}
    <div className={styles.adminContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <div className={styles.logoMicWrapper}>
            <div className={styles.logoBandeira}>
              <BandeiraEUA size={42} />
            </div>
            <Mic size={26} className={styles.logoIcon}/>
          </div>
          <div>
            <h2>My Voice</h2>
            <span className={styles.roleTag}>Área da Professora</span>
          </div>
        </div>
        <div className={styles.navRight}>
          <button
            className={styles.planoBadgeBtn}
            style={{ '--plano-cor': planoBadgeInfo.cor }}
            onClick={() => setAba('planos')}
            title="Gerenciar plano"
          >
            {planoBadgeInfo.icone}
            <span>{planoBadgeInfo.label}</span>
          </button>
          <span className={styles.nomeProf}>Olá, {profile?.name?.split(' ')[0]} 👋</span>
          <button className={styles.verAlunoBtn} onClick={() => setModoAluno(true)}>
            <GraduationCap size={16}/> Ver como Aluno
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={18}/> Sair</button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.tabsBar}>
          {ABAS.map(a => (
            <button
              key={a.id}
              className={`${styles.tabBtn} ${aba === a.id ? styles.tabBtnActive : ''}`}
              onClick={() => setAba(a.id)}
            >
              {a.icon} {a.label}
              {a.id === 'planos' && plano === 'basico' && (
                <span className={styles.upgradeDot} />
              )}
            </button>
          ))}
        </div>

        {aba === 'aulas'  && <PreviewAulas plano={plano} />}
        {aba === 'trilha' && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '1rem', padding: '0.65rem 1rem',
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '12px', fontSize: '0.82rem', color: '#a78bfa', fontWeight: 600,
            }}>
              <GraduationCap size={16}/>
              Você está visualizando a Trilha exatamente como o aluno vê
            </div>
            <Trilha modoVisualizacao />
          </div>
        )}
        {aba === 'nova'   && <NovaAula onSalvo={() => setAba('aulas')} />}
        {aba === 'upload' && <UploadDocumento onSalvo={() => setAba('aulas')} />}
        {aba === 'gravar' && (
          <Suspense fallback={<p style={{color:'#94a3b8',padding:'2rem'}}>Carregando gravador…</p>}>
            <GravacaoAula />
          </Suspense>
        )}
        {aba === 'alunos' && <GerenciarAlunos />}
        {aba === 'planos' && (
          <Planos
            onMudarPlano={() => setAba('aulas')}
          />
        )}
      </main>
    </div>
    </>
  );
};

export default AdminDashboard;
