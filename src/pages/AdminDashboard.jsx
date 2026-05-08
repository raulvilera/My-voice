import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, LogOut, Users, ToggleLeft, ToggleRight, Search,
  Plus, Eye, X, Upload, FileText, Loader2,
  MessageCircle, BookMarked, Grid3x3, PenLine,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import NovaAula from './NovaAula';
import { SecaoDialogo }    from '../components/SecaoDialogo';
import { SecaoVerbos }     from '../components/SecaoVerbos';
import { SecaoVocabulario }from '../components/SecaoVocabulario';
import { SecaoExercicios } from '../components/SecaoExercicios';
import styles from './AdminDashboard.module.css';

// ── Pílulas de seção ──────────────────────────────────────────────────────────
const PILL_INFO = {
  dialogo:     { emoji: '💬', label: 'Diálogo',     icon: <MessageCircle size={12}/>, cor: '#8b5cf6' },
  verbos:      { emoji: '📘', label: 'Verbos',      icon: <BookMarked    size={12}/>, cor: '#06b6d4' },
  vocabulario: { emoji: '📖', label: 'Vocabulário', icon: <Grid3x3       size={12}/>, cor: '#ec4899' },
  exercicios:  { emoji: '✏️', label: 'Exercícios',  icon: <PenLine       size={12}/>, cor: '#f59e0b' },
};

// ── Preview de aulas ──────────────────────────────────────────────────────────
const PreviewAulas = () => {
  const [aulas, setAulas]         = useState([]);
  const [aulaAberta, setAulaAberta] = useState(null);
  const [secAberta, setSecAberta]   = useState(null); // tipo de seção aberta individualmente
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('aulas')
        .select('*, secoes(*)')
        .order('numero');
      setAulas(data || []);
      setLoading(false);
    })();
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

  const abrirSecao = (aula, tipo, e) => {
    e.stopPropagation();
    setAulaAberta(aula);
    setSecAberta(tipo);
  };

  const fecharModal = () => { setAulaAberta(null); setSecAberta(null); };

  // Filtra seções do modal conforme pílula clicada (null = todas)
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

      {/* ── Modal ── */}
      {aulaAberta && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.aulaTag}>Aula {aulaAberta.numero}</span>
                <h2>{aulaAberta.titulo}</h2>
                <p>{aulaAberta.subtitulo}</p>
                <p className={styles.modalSubtitleSec}>{subtituloModal}</p>
              </div>
              {/* ── Botão fechar estilizado ── */}
              <button className={styles.closeBtnModal} onClick={fecharModal} aria-label="Fechar">
                <X size={20}/>
              </button>
            </div>
            <div className={styles.modalBody}>
              {secoesModal.map((sec, idx) => renderSecao(sec, idx))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Upload de Documento ───────────────────────────────────────────────────────
const UploadDocumento = ({ onSalvo }) => {
  const [arquivo, setArquivo]     = useState(null);
  const [convertendo, setConvert] = useState(false);
  const [resultado, setResultado] = useState(null); // estrutura convertida
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

  const converter = async () => {
    if (!arquivo) return;
    setConvert(true); setErro('');
    try {
      // Lê o arquivo como texto
      const texto = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        // .docx é binário, mas vamos tentar extrair texto bruto; .txt lê direto
        if (arquivo.name.endsWith('.txt')) r.readAsText(arquivo);
        else r.readAsText(arquivo); // fallback: texto bruto do docx
      });

      const prompt = `Você é um assistente pedagógico da plataforma "My Voice" de ensino de inglês.
Analise o conteúdo abaixo de um documento de aula criado pela professora e converta para JSON estruturado.

Retorne APENAS um JSON válido, sem markdown, sem explicações, no formato:
{
  "titulo": "Título da aula",
  "subtitulo": "Subtítulo ou tema",
  "secoes": [
    {
      "tipo": "dialogo",
      "titulo": "Título da seção",
      "conteudo": {
        "personagens": ["Linda", "Glinda"],
        "falas": [
          { "personagem": "Linda", "texto": "Hello!" },
          { "personagem": "Glinda", "texto": "Hi there!" }
        ]
      }
    },
    {
      "tipo": "verbos",
      "titulo": "Verbos da Aula",
      "conteudo": {
        "verbos": [
          { "verbo": "TO BE (ser/estar)", "presente": "am/is/are", "passado": "was/were", "participio": "been" }
        ]
      }
    },
    {
      "tipo": "vocabulario",
      "titulo": "Vocabulário",
      "conteudo": {
        "palavras": [
          { "en": "Hello", "pt": "Olá" }
        ]
      }
    },
    {
      "tipo": "exercicios",
      "titulo": "Exercícios",
      "conteudo": {
        "grupos": [
          {
            "instrucao": "Complete as frases:",
            "questoes": [
              { "pergunta": "She ___ a teacher.", "resposta": "is" }
            ]
          }
        ]
      }
    }
  ]
}

Inclua apenas as seções que existirem no conteúdo. Use os tipos: dialogo, verbos, vocabulario, exercicios.
Para exercícios com lacuna, use ___ na pergunta.

CONTEÚDO DO DOCUMENTO:
${texto.slice(0, 8000)}`;

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await resp.json();
      const raw = data.content?.find(b => b.type === 'text')?.text || '';
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setResultado(parsed);
    } catch (e) {
      setErro('Erro ao converter: ' + e.message + '. Tente um arquivo .txt.');
    } finally {
      setConvert(false);
    }
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
          O Claude irá converter automaticamente para o padrão da plataforma.
        </p>

        <label className={styles.fileLabel}>
          <FileText size={16}/>
          {arquivo ? arquivo.name : 'Escolher arquivo (.docx ou .txt)'}
          <input type="file" accept=".docx,.txt" onChange={handleFile} style={{ display: 'none' }}/>
        </label>

        {arquivo && !resultado && (
          <button className={styles.convertBtn} onClick={converter} disabled={convertendo}>
            {convertendo
              ? <><Loader2 size={16} className={styles.spin}/> Convertendo com IA…</>
              : <><Mic size={16}/> Converter com Claude</>}
          </button>
        )}

        {erro && <div className={styles.erroBox}>{erro}</div>}
        {sucesso && <div className={styles.sucessoBox}>{sucesso}</div>}
      </div>

      {/* Preview do resultado convertido */}
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
            ✅ {resultado.secoes?.length || 0} seção(ões) detectada(s). Revise abaixo antes de salvar.
          </p>

          {/* Prévia das seções */}
          <div className={styles.resultadoSecoes}>
            {(resultado.secoes || []).map((s, i) => {
              const info = PILL_INFO[s.tipo];
              return (
                <div key={i} className={styles.secaoPreviewChip} style={{ '--pill-cor': info?.cor || '#8b5cf6' }}>
                  {info?.icon} <strong>{s.titulo}</strong>
                  <span className={styles.secaoTipoTag}>{s.tipo}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.saveBar}>
            <button className={styles.saveRascunhoBtn} onClick={() => salvar(false)} disabled={salvando}>
              {salvando ? <Loader2 size={15} className={styles.spin}/> : null}
              Salvar Rascunho
            </button>
            <button className={styles.publishBtn} onClick={() => salvar(true)} disabled={salvando}>
              <Eye size={15}/> Publicar Aula
            </button>
            <button className={styles.resetUploadBtn} onClick={() => { setArquivo(null); setResultado(null); }}>
              <X size={15}/> Recomeçar
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

// ── Admin Principal ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [aba, setAba] = useState('aulas');

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const ABAS = [
    { id: 'aulas',   label: 'Aulas',        icon: <Eye size={16}/> },
    { id: 'nova',    label: 'Nova Aula',     icon: <Plus size={16}/> },
    { id: 'upload',  label: 'Importar Doc',  icon: <Upload size={16}/> },
    { id: 'alunos',  label: 'Alunos',        icon: <Users size={16}/> },
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
            <button
              key={a.id}
              className={`${styles.tabBtn} ${aba === a.id ? styles.tabBtnActive : ''}`}
              onClick={() => setAba(a.id)}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>

        {aba === 'aulas'  && <PreviewAulas />}
        {aba === 'nova'   && <NovaAula onSalvo={() => setAba('aulas')} />}
        {aba === 'upload' && <UploadDocumento onSalvo={() => setAba('aulas')} />}
        {aba === 'alunos' && <GerenciarAlunos />}
      </main>
    </div>
  );
};

export default AdminDashboard;
