import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, LogOut, Users, ToggleLeft, ToggleRight, Search,
  Plus, Eye, X, Upload, FileText, Loader2,
  MessageCircle, BookMarked, Grid3x3, PenLine, GraduationCap,
  CreditCard, Crown, Zap, Bot,
  Video, Play, Pause, Square, Download, Volume2, VolumeX,
  Maximize, Save, Type, Camera, Trash2, CheckCircle,
} from 'lucide-react';
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
            case 'exercicios':  return <SecaoExercicios  section={dados}/>;
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
              {secoesModal.map((sec, idx) => renderSecao(sec, idx, aulaAberta.titulo))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Upload de Documento ───────────────────────────────────────────────────────
const UploadDocumento = ({ onSalvo }) => {
  const { user } = useAuth();
  const [arquivo, setArquivo]     = useState(null);
  const [convertendo, setConvert] = useState(false);
  const [resultado, setResultado] = useState(null); // estrutura convertida
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
        "personagens": ["Linda", "Glynda"],
        "falas": [
          { "personagem": "Linda", "texto": "Hello!" },
          { "personagem": "Glynda", "texto": "Hi there!" }
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

      // ── Agente IA registra a atividade importada automaticamente ─────────
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

      {/* Feedback do Agente IA após salvar */}
      {registroIA && (
        <div className={styles.agenteCard}>
          <div className={styles.agenteHeader}>
            <Bot size={16} style={{ color: '#8b5cf6' }} />
            <strong>Agente IA registrou sua atividade importada</strong>
          </div>
          <p className={styles.agenteResumo}>{registroIA.resumo}</p>
          {registroIA.sugestao_uso && (
            <p className={styles.agenteSugestao}>💡 {registroIA.sugestao_uso}</p>
          )}
          {registroIA.tags_automaticas?.length > 0 && (
            <div className={styles.agenteTags}>
              {registroIA.tags_automaticas.map((t, i) => (
                <span key={i} className={styles.agenteTag}>{t}</span>
              ))}
            </div>
          )}
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

// ── VideoRecorder ─────────────────────────────────────────────────────────────
const VideoRecorderInline = ({ onRecordingComplete, onClose }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(0);
  const streamRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true })
      .then(stream => {
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; }
        setCameraReady(true);
      })
      .catch(() => setError('Não foi possível acessar câmera/microfone. Verifique as permissões do navegador.'));
    return () => {
      mounted = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
    const mr = new MediaRecorder(streamRef.current, { mimeType });
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setIsPreviewing(true);
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setIsRecording(true);
    startTimeRef.current = Date.now();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  };

  const reset = () => { setRecordedBlob(null); setIsPreviewing(false); setDuration(0); };

  const downloadRecording = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url; a.download = `video-${Date.now()}.webm`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const mins = String(Math.floor(duration / 60)).padStart(2, '0');
  const secs = String(duration % 60).padStart(2, '0');

  return (
    <div className={styles.videoRecorderWrap}>
      <h3 className={styles.videoSectionTitle}><Camera size={18}/> Gravar Novo Vídeo</h3>
      {error && <div className={styles.erroBox}>{error}</div>}
      {!isPreviewing ? (
        <>
          <div className={styles.videoPreviewBox}>
            <video ref={videoRef} autoPlay playsInline muted className={styles.videoEl}/>
            {isRecording && (
              <div className={styles.recBadge}>
                <span className={styles.recDot}/>
                Gravando {mins}:{secs}
              </div>
            )}
            {!cameraReady && !error && (
              <div className={styles.videoPlaceholder}><Loader2 size={32} className={styles.spin}/><span>Iniciando câmera…</span></div>
            )}
          </div>
          <div className={styles.videoControls}>
            {!isRecording
              ? <button className={styles.recBtn} onClick={startRecording} disabled={!cameraReady}><Mic size={18}/> Iniciar Gravação</button>
              : <button className={styles.stopBtn} onClick={stopRecording}><Square size={18}/> Parar Gravação</button>
            }
            {onClose && <button className={styles.cancelBtn} onClick={onClose}><X size={16}/> Cancelar</button>}
          </div>
        </>
      ) : (
        <>
          <div className={styles.videoPreviewBox}>
            <video src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''} controls className={styles.videoEl}/>
          </div>
          <div className={styles.videoInfoRow}>
            <span>⏱ {mins}:{secs}</span>
            <span>💾 {(recordedBlob?.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className={styles.videoControls}>
            <button className={styles.confirmBtn} onClick={() => { onRecordingComplete?.(recordedBlob, duration); reset(); }}>
              <CheckCircle size={16}/> Confirmar e Editar
            </button>
            <button className={styles.outlineBtn} onClick={downloadRecording}><Download size={16}/> Baixar</button>
            <button className={styles.cancelBtn} onClick={reset}><Trash2 size={15}/> Regravar</button>
          </div>
        </>
      )}
    </div>
  );
};

// ── VideoEditor ───────────────────────────────────────────────────────────────
const VideoEditorInline = ({ videoBlob, onSave, onCancel }) => {
  const videoRef = useRef(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [legenda, setLegenda] = useState('');
  const [volume, setVolume] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [duration, setDuration] = useState(0);
  const videoUrl = videoBlob ? URL.createObjectURL(videoBlob) : '';

  const formatTime = s => { const m = Math.floor(s/60); return `${m}:${String(Math.floor(s%60)).padStart(2,'0')}`; };

  const handleSave = async () => {
    if (!titulo) return;
    setIsSaving(true);
    try {
      if (videoRef.current) videoRef.current.volume = volume / 100;
      onSave?.(videoBlob, { titulo, descricao, legenda, volume });
    } finally { setIsSaving(false); }
  };

  return (
    <div className={styles.videoEditorWrap}>
      <h3 className={styles.videoSectionTitle}><Type size={18}/> Editar Vídeo</h3>
      <div className={styles.videoPreviewBox}>
        <video ref={videoRef} src={videoUrl} controls onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)} className={styles.videoEl}/>
      </div>
      <div className={styles.videoInfoRow}>
        <span>⏱ {formatTime(duration)}</span>
        <span>💾 {(videoBlob?.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
      <div className={styles.videoForm}>
        <label className={styles.videoLabel}>Título *</label>
        <input className={styles.videoInput} placeholder="Ex: Aula de Verbos Irregulares" value={titulo} onChange={e => setTitulo(e.target.value)}/>

        <label className={styles.videoLabel}>Descrição</label>
        <textarea className={styles.videoTextarea} placeholder="Descreva o conteúdo do vídeo…" value={descricao} onChange={e => setDescricao(e.target.value)}/>

        <label className={styles.videoLabel}><Type size={14}/> Legenda / Transcrição (opcional)</label>
        <textarea className={styles.videoTextarea} placeholder="Adicione legendas ou transcrição…" value={legenda} onChange={e => setLegenda(e.target.value)}/>

        <label className={styles.videoLabel}><Volume2 size={14}/> Volume: {volume}%</label>
        <input type="range" min="0" max="150" step="5" value={volume} onChange={e => setVolume(Number(e.target.value))} className={styles.videoRange}/>
      </div>
      <div className={styles.videoControls}>
        <button className={styles.publishBtn} onClick={handleSave} disabled={isSaving || !titulo}>
          {isSaving ? <><Loader2 size={15} className={styles.spin}/> Salvando…</> : <><Save size={15}/> Salvar e Publicar</>}
        </button>
        <button className={styles.cancelBtn} onClick={onCancel}><X size={15}/> Cancelar</button>
      </div>
    </div>
  );
};

// ── VideoPlayer ───────────────────────────────────────────────────────────────
const VideoPlayerInline = ({ video, onDelete }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const timeoutRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };
  const toggleMute = () => { if (videoRef.current) videoRef.current.muted = !isMuted; setIsMuted(!isMuted); };
  const formatTime = s => { if (!isFinite(s)) return '0:00'; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(timeoutRef.current);
    if (isPlaying) timeoutRef.current = setTimeout(() => setShowControls(false), 2500);
  };

  const videoUrl = video.url || (video.blob ? URL.createObjectURL(video.blob) : '');

  return (
    <div className={styles.videoCard}>
      <div className={styles.videoPlayerBox} onMouseMove={handleMouseMove} onMouseLeave={() => isPlaying && setShowControls(false)}>
        <video
          ref={videoRef}
          src={videoUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          className={styles.videoEl}
          crossOrigin="anonymous"
        />
        {/* Controls overlay */}
        <div className={`${styles.playerControls} ${showControls ? styles.visible : styles.hidden}`}>
          <input type="range" min="0" max={duration||0} value={currentTime}
            onChange={e => { const t = parseFloat(e.target.value); if (videoRef.current) videoRef.current.currentTime = t; setCurrentTime(t); }}
            className={styles.progressBar}/>
          <div className={styles.controlsRow}>
            <button className={styles.iconBtn} onClick={togglePlay}>{isPlaying ? <Pause size={18}/> : <Play size={18}/>}</button>
            <button className={styles.iconBtn} onClick={toggleMute}>{isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button>
            <span className={styles.timeLabel}>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>
        {!isPlaying && (
          <div className={styles.playOverlay} onClick={togglePlay}><Play size={52} className={styles.playIcon}/></div>
        )}
      </div>
      <div className={styles.videoCardInfo}>
        <div>
          <p className={styles.videoCardTitle}>{video.titulo}</p>
          {video.descricao && <p className={styles.videoCardDesc}>{video.descricao}</p>}
          {video.legenda && <p className={styles.videoCardLegenda}>{video.legenda}</p>}
        </div>
        {onDelete && (
          <button className={styles.deleteBtn} onClick={() => onDelete(video.id)} title="Remover vídeo"><Trash2 size={15}/></button>
        )}
      </div>
    </div>
  );
};

// ── Gerenciar Vídeos ──────────────────────────────────────────────────────────
const GerenciarVideos = () => {
  const { user } = useAuth();
  const [etapa, setEtapa] = useState('lista'); // 'lista' | 'gravar' | 'editar'
  const [blobPendente, setBlobPendente] = useState(null);
  const [videos, setVideos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  // Carrega vídeos do Supabase (tabela videos)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (data) {
        // Gera URL pública para cada vídeo armazenado
        const comUrl = data.map(v => {
          if (v.storage_path) {
            const { data: urlData } = supabase.storage.from('videos').getPublicUrl(v.storage_path);
            return { ...v, url: urlData?.publicUrl || '' };
          }
          return v;
        });
        setVideos(comUrl);
      }
    })();
  }, [sucesso]);

  const handleRecordingComplete = (blob) => {
    setBlobPendente(blob);
    setEtapa('editar');
  };

  const handleSave = async (blob, metadata) => {
    setSalvando(true); setErro('');
    try {
      // 1. Upload do blob no Supabase Storage
      const nomeArquivo = `${user?.id || 'anon'}-${Date.now()}.webm`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('videos')
        .upload(nomeArquivo, blob, { contentType: 'video/webm', upsert: false });
      if (uploadErr) throw uploadErr;

      // 2. Salva metadados na tabela videos
      const { error: dbErr } = await supabase.from('videos').insert({
        professor_id: user?.id,
        titulo: metadata.titulo,
        descricao: metadata.descricao || '',
        legenda: metadata.legenda || '',
        volume: metadata.volume,
        storage_path: uploadData.path,
      });
      if (dbErr) throw dbErr;

      setSucesso('Vídeo publicado com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
      setBlobPendente(null);
      setEtapa('lista');
    } catch (e) {
      setErro('Erro ao publicar: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (id) => {
    const video = videos.find(v => v.id === id);
    if (!video) return;
    if (video.storage_path) {
      await supabase.storage.from('videos').remove([video.storage_path]);
    }
    await supabase.from('videos').delete().eq('id', id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className={styles.videosContainer}>
      {etapa === 'lista' && (
        <>
          <div className={styles.videosHeader}>
            <div>
              <h2 className={styles.videosSectionH2}><Video size={20}/> Vídeos Educacionais</h2>
              <p className={styles.videosSubtitle}>{videos.length} vídeo(s) publicado(s)</p>
            </div>
            <button className={styles.publishBtn} onClick={() => setEtapa('gravar')}>
              <Camera size={16}/> Gravar Novo Vídeo
            </button>
          </div>
          {sucesso && <div className={styles.sucessoBox}>{sucesso}</div>}
          {erro && <div className={styles.erroBox}>{erro}</div>}
          {videos.length === 0
            ? (
              <div className={styles.videosEmpty}>
                <Video size={48} style={{ opacity: 0.3 }}/>
                <p>Nenhum vídeo publicado ainda.</p>
                <button className={styles.convertBtn} onClick={() => setEtapa('gravar')}><Camera size={16}/> Gravar primeiro vídeo</button>
              </div>
            )
            : (
              <div className={styles.videosGrid}>
                {videos.map(v => <VideoPlayerInline key={v.id} video={v} onDelete={handleDelete}/>)}
              </div>
            )
          }
        </>
      )}
      {etapa === 'gravar' && (
        <VideoRecorderInline
          onRecordingComplete={handleRecordingComplete}
          onClose={() => setEtapa('lista')}
        />
      )}
      {etapa === 'editar' && blobPendente && (
        <VideoEditorInline
          videoBlob={blobPendente}
          onSave={handleSave}
          onCancel={() => { setBlobPendente(null); setEtapa('lista'); }}
        />
      )}
      {salvando && (
        <div className={styles.savingOverlay}>
          <Loader2 size={36} className={styles.spin}/>
          <p>Publicando vídeo…</p>
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
  const [modoAluno, setModoAluno] = useState(false);

  // Plano lido diretamente do perfil Supabase (persiste entre sessões)
  const plano = profile?.plano || 'basico';

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const ABAS = [
    { id: 'aulas',   label: 'Aulas',        icon: <Eye size={16}/> },
    { id: 'nova',    label: 'Nova Aula',     icon: <Plus size={16}/> },
    { id: 'upload',  label: 'Importar Doc',  icon: <Upload size={16}/> },
    { id: 'videos',  label: 'Vídeos',        icon: <Video size={16}/> },
    { id: 'alunos',  label: 'Alunos',        icon: <Users size={16}/> },
    { id: 'planos',  label: 'Planos',        icon: <CreditCard size={16}/> },
  ];

  // Badge visual do plano na navbar
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
          <Mic size={26} className={styles.logoIcon}/>
          <div>
            <h2>My Voice</h2>
            <span className={styles.roleTag}>Área da Professora</span>
          </div>
        </div>
        <div className={styles.navRight}>
          {/* Badge clicável do plano atual */}
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
              {/* Ponto de notificação para upgrade */}
              {a.id === 'planos' && plano === 'basico' && (
                <span className={styles.upgradeDot} />
              )}
            </button>
          ))}
        </div>

        {aba === 'aulas'  && <PreviewAulas plano={plano} />}
        {aba === 'nova'   && <NovaAula onSalvo={() => setAba('aulas')} />}
        {aba === 'upload' && <UploadDocumento onSalvo={() => setAba('aulas')} />}
        {aba === 'videos' && <GerenciarVideos />}
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
