import { useState, useEffect, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Mic, LogOut, Users, ToggleLeft, ToggleRight, Search,
  Plus, Eye, X, Upload, FileText, Loader2,
  MessageCircle, BookMarked, Grid3x3, PenLine, GraduationCap,
  CreditCard, Crown, Zap, Bot, Video,
} from 'lucide-react';
import { myVoiceData } from '../data/myvoiceData';
import Trilha from './Trilha';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import NovaAula from './NovaAula';
import Planos from './Planos';
import VideoEducacional from '../components/VideoEducacional';
import { SecaoDialogo }    from '../components/SecaoDialogo';
import { SecaoVerbos }     from '../components/SecaoVerbos';
import { SecaoVocabulario }from '../components/SecaoVocabulario';
import { SecaoExercicios } from '../components/SecaoExercicios';
import styles from './AdminDashboard.module.css';

// Lazy loading do componente de gravação para performance
const GravacaoAula = lazy(() => import('../components/GravacaoAula'));

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
        const { data, error } = await supabase
          .from('aulas')
          .select('*, secoes(*)')
          .order('numero', { ascending: true });

        if (error) {
          console.error('[AdminDashboard] Erro ao buscar aulas:', error);
        } else {
          if (isMounted) {
            // Sincroniza aulas do aluno (hardcoded) com as do banco
            const aulasDB = data || [];
            const aulasHardcoded = (myVoiceData?.basico?.aulas || []).map(a => ({
              ...a,
              id: `hc-${a.id}`,
              publicada: true,
              secoes: a.sections?.map((s, i) => ({
                tipo: s.type,
                titulo: s.titulo,
                conteudo: s,
                ordem: i
              })) || []
            }));

            setAulas([...aulasHardcoded, ...aulasDB].sort((a, b) => a.numero - b.numero));
          }
        }
      } catch (e) {
        console.error('[AdminDashboard] Exceção:', e);
      } finally {
        if (isMounted) setLoading(false);
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

  if (loading) return <p className={styles.loadingMsg}>Carregando aulas…</p>;
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
  const [convertendo, setConvert] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro]           = useState('');
  const [salvando, setSalvando]   = useState(false);
  const [sucesso, setSucesso]     = useState('');
  const [registroIA, setRegistroIA] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || f.type === 'text/plain'
      || f.name.endsWith('.docx')
      || f.name.endsWith('.txt');
    if (!ok) { setErro('Use um arquivo .docx ou .txt.'); return; }
    setArquivo(f); setErro(''); setResultado(null);
  };

  const converter = async () => {
    if (!arquivo) return;
    setConvert(true); setErro('');
    try {
      const texto = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsText(arquivo);
      });

      const prompt = `Converta este conteúdo de aula para JSON My Voice. CONTEÚDO: ${texto.slice(0, 5000)}`;

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await resp.json();
      const raw = data.content?.find(b => b.type === 'text')?.text || '';
      const clean = raw.replace(/```json|```/g, '').trim();
      setResultado(JSON.parse(clean));
    } catch (e) {
      setErro('Erro ao converter: ' + e.message);
    } finally {
      setConvert(false);
    }
  };

  const salvar = async (publicar = false) => {
    if (!resultado) return;
    setSalvando(true);
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
      await supabase.from('secoes').insert(secoesData);

      dispararAgenteRegistro({
        aula_id: aula.id,
        professor_id: user?.id,
        titulo: resultado.titulo,
        subtitulo: resultado.subtitulo || '',
        tag: 'Iniciante',
        secoes: secoesData,
        origem: 'upload',
      }).then(reg => { if (reg) setRegistroIA(reg); });

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
        <label className={styles.fileLabel}>
          <FileText size={16}/>
          {arquivo ? arquivo.name : 'Escolher arquivo'}
          <input type="file" accept=".docx,.txt" onChange={handleFile} style={{ display: 'none' }}/>
        </label>
        {arquivo && !resultado && (
          <button className={styles.convertBtn} onClick={converter} disabled={convertendo}>
            {convertendo ? <Loader2 size={16} className={styles.spin}/> : 'Converter com Claude'}
          </button>
        )}
        {erro && <div className={styles.erroBox}>{erro}</div>}
        {sucesso && <div className={styles.sucessoBox}>{sucesso}</div>}
      </div>

      {resultado && (
        <div className={styles.resultadoCard}>
          <h3>{resultado.titulo}</h3>
          <div className={styles.resultadoBtns}>
            <button className={styles.salvarBtn} onClick={() => salvar(false)} disabled={salvando}>Salvar Rascunho</button>
            <button className={styles.publishBtn} onClick={() => salvar(true)} disabled={salvando}>Publicar Aula</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Gerenciar Alunos ──────────────────────────────────────────────────────────
const GerenciarAlunos = () => {
  const [alunos, setAlunos]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'aluno').order('created_at', { ascending: false });
      setAlunos(data || []);
      setLoading(false);
    })();
  }, []);

  const toggleAtivo = async (aluno) => {
    await supabase.from('profiles').update({ ativo: !aluno.ativo }).eq('id', aluno.id);
    setAlunos(prev => prev.map(a => a.id === aluno.id ? { ...a, ativo: !a.ativo } : a));
  };

  return (
    <div className={styles.alunosPanel}>
      {loading ? <p>Carregando…</p> : (
        <div className={styles.alunosList}>
          {alunos.map(aluno => (
            <div key={aluno.id} className={styles.alunoRow}>
              <span>{aluno.name || aluno.email}</span>
              <button onClick={() => toggleAtivo(aluno)}>
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
  <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
    <div style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', padding: '0.6rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 700 }}>Modo Visualização</span>
      <button onClick={onFechar} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer' }}>Fechar</button>
    </div>
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

  const handleLogout = async () => { await signOut(); navigate('/login', { replace: true }); };

  const ABAS = [
    { id: 'aulas',    label: 'Aulas',        icon: <Eye size={16}/> },
    { id: 'nova',     label: 'Nova Aula',     icon: <Plus size={16}/> },
    { id: 'gravacao', label: 'Gravar Aula',   icon: <Video size={16}/> },
    { id: 'upload',   label: 'Importar Doc',  icon: <Upload size={16}/> },
    { id: 'alunos',   label: 'Alunos',        icon: <Users size={16}/> },
    { id: 'planos',   label: 'Planos',        icon: <CreditCard size={16}/> },
  ];

  return (
    <>
    {modoAluno && <ModoAluno onFechar={() => setModoAluno(false)}/>}
    <div className={styles.adminContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logoInfo}>
          <Mic size={26}/>
          <div><h2>My Voice</h2><span>Área da Professora</span></div>
        </div>
        <div className={styles.navRight}>
          <span className={styles.nomeProf}>Olá, {profile?.name?.split(' ')[0]} 👋</span>
          <button className={styles.verAlunoBtn} onClick={() => setModoAluno(true)}>Ver como Aluno</button>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
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

        {aba === 'aulas'    && <PreviewAulas plano={plano} />}
        {aba === 'nova'     && <NovaAula onSalvo={() => setAba('aulas')} />}
        {aba === 'gravacao' && (
          <Suspense fallback={<div className={styles.loadingMsg}><Loader2 size={24} className={styles.spin}/> Carregando gravador...</div>}>
            <GravacaoAula />
          </Suspense>
        )}
        {aba === 'upload'   && <UploadDocumento onSalvo={() => setAba('aulas')} />}
        {aba === 'alunos'   && <GerenciarAlunos />}
        {aba === 'planos'   && <Planos onMudarPlano={() => setAba('aulas')} />}
      </main>
    </div>
    </>
  );
};

// ESTA LINHA É A MAIS IMPORTANTE PARA CORRIGIR O ERRO DA VERCEL:
export default AdminDashboard;
