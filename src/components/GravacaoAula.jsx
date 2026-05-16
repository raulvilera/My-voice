/**
 * GravacaoAula.jsx
 * Sistema de gravação de vídeo-aula pela professora.
 * Permite gravar diretamente pelo navegador (câmera/microfone),
 * revisar, editar e publicar vinculado a uma aula específica.
 * O vídeo é salvo no Supabase Storage e a URL é registrada na
 * tabela `videos_aulas`.
 *
 * Funciona tanto na plataforma web quanto no PWA (app).
 */

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import {
  Video, StopCircle, Play, Pause, Trash2, Upload,
  CheckCircle, Loader2, Camera, Mic, MicOff, VideoOff,
  ChevronDown, BookOpen, AlertCircle, RefreshCw, Eye, Edit3,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import VideoEditor from '../../VideoEditor';
import styles from './GravacaoAula.module.css';

// ── Constantes ────────────────────────────────────────────────────────────────
const MAX_DURACAO_SEG = 30 * 60; // 30 minutos máximo

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatarTempo(seg) {
  const m = Math.floor(seg / 60).toString().padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function GravacaoAula() {
  const { user } = useAuth();

  // Estado da câmera/microfone
  const [stream, setStream] = useState(null);
  const [semCamera, setSemCamera] = useState(false);
  const [semMic, setSemMic] = useState(false);
  const [iniciando, setIniciando] = useState(false);

  // Estado da gravação
  const [gravando, setGravando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [duracao, setDuracao] = useState(0);
  const [blobGravado, setBlobGravado] = useState(null);
  const [urlPreview, setUrlPreview] = useState(null);

  // Estado de publicação
  const [aulas, setAulas] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState('');
  const [tituloVideo, setTituloVideo] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [etapa, setEtapa] = useState('gravar'); // 'gravar' | 'revisar' | 'editar' | 'publicar' | 'concluido'

  // Refs
  const videoRef = useRef(null);         // preview ao vivo
  const previewRef = useRef(null);       // replay da gravação
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // ── Busca aulas cadastradas ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        console.log('[GravacaoAula] Buscando aulas...');
        const { data, error } = await supabase
          .from('aulas')
          .select('id, numero, titulo')
          .order('numero', { ascending: true });
        
        if (error) {
          console.error('[GravacaoAula] Erro ao buscar aulas:', error);
        } else {
          console.log('[GravacaoAula] Aulas carregadas:', data);
          setAulas(data || []);
        }
      } catch (e) {
        console.error('[GravacaoAula] Exceção:', e);
      }
    })();
  }, []);

  // ── Inicia câmera ────────────────────────────────────────────────────────
  const iniciarCamera = useCallback(async () => {
    setIniciando(true);
    setErro('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador ou conexão (HTTP/origem não segura) não suporta gravação de mídia. Por favor, certifique-se de acessar via HTTPS.');
      }

      const constraints = {
        video: !semCamera ? { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: 'user' 
        } : false,
        audio: !semMic,
      };
      
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(s);
      
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('[GravacaoAula] Erro ao reproduzir preview:', e);
        }
      }
    } catch (e) {
      console.error('[GravacaoAula] Erro ao acessar dispositivos:', e);
      
      let mensagem = e.message || 'Não foi possível acessar câmera/microfone.';
      if (e.name === 'NotAllowedError') {
        mensagem = 'Permissão negada para acessar a câmera ou microfone. Verifique as configurações de permissão do navegador.';
      } else if (e.name === 'NotFoundError') {
        mensagem = 'Nenhum dispositivo de câmera ou microfone físico foi encontrado.';
      } else if (e.name === 'NotReadableError') {
        mensagem = 'A câmera ou o microfone já está em uso por outro aplicativo ou aba.';
      }
      
      setErro(mensagem);
    } finally {
      setIniciando(false);
    }
  }, [semCamera, semMic]);

  // Conecta stream ao elemento de vídeo quando stream muda
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Limpa stream ao desmontar
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
      if (urlPreview) URL.revokeObjectURL(urlPreview);
    };
  }, [stream, urlPreview]);

  // ── Iniciar gravação ─────────────────────────────────────────────────────
  const iniciarGravacao = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

    try {
      const rec = new MediaRecorder(stream, { mimeType });
      
      rec.ondataavailable = (e) => { 
        if (e.data.size > 0) chunksRef.current.push(e.data); 
      };
      
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setBlobGravado(blob);
        const url = URL.createObjectURL(blob);
        setUrlPreview(url);
        setEtapa('revisar');
      };
      
      rec.onerror = (e) => {
        console.error('[GravacaoAula] Erro no MediaRecorder:', e);
        setErro('Erro ao gravar: ' + e.error);
      };
      
      rec.start(1000);
      recorderRef.current = rec;

      setGravando(true);
      setPausado(false);
      setDuracao(0);
      timerRef.current = setInterval(() => {
        setDuracao(d => {
          if (d + 1 >= MAX_DURACAO_SEG) {
            pararGravacao();
            return d + 1;
          }
          return d + 1;
        });
      }, 1000);
    } catch (e) {
      console.error('[GravacaoAula] Erro ao iniciar gravação:', e);
      setErro('Erro ao iniciar gravação: ' + e.message);
    }
  };

  // ── Pausar / Retomar ─────────────────────────────────────────────────────
  const togglePausa = () => {
    if (!recorderRef.current) return;
    try {
      if (pausado) {
        recorderRef.current.resume();
        timerRef.current = setInterval(() => setDuracao(d => d + 1), 1000);
      } else {
        recorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setPausado(p => !p);
    } catch (e) {
      console.error('[GravacaoAula] Erro ao pausar/retomar:', e);
      setErro('Erro ao pausar/retomar gravação');
    }
  };

  // ── Parar gravação ───────────────────────────────────────────────────────
  const pararGravacao = () => {
    try {
      clearInterval(timerRef.current);
      recorderRef.current?.stop();
      setGravando(false);
      stream?.getTracks().forEach(t => t.stop());
      setStream(null);
    } catch (e) {
      console.error('[GravacaoAula] Erro ao parar gravação:', e);
    }
  };

  // ── Descartar e regravar ─────────────────────────────────────────────────
  const descartar = () => {
    if (urlPreview) URL.revokeObjectURL(urlPreview);
    setBlobGravado(null);
    setUrlPreview(null);
    setDuracao(0);
    setEtapa('gravar');
    setErro('');
  };

  const handleEditorSave = (editedBlob, metadata) => {
    setBlobGravado(editedBlob);
    setTituloVideo(metadata.titulo);
    setEtapa('publicar');
  };

  // ── Publicar vídeo ───────────────────────────────────────────────────────
  const publicar = async () => {
    if (!blobGravado) {
      setErro('Nenhuma gravação encontrada.');
      return;
    }
    if (!aulaSelecionada) {
      setErro('Selecione a aula para vincular o vídeo.');
      return;
    }
    if (!tituloVideo.trim()) {
      setErro('Informe um título para o vídeo.');
      return;
    }
    if (!user?.id) {
      setErro('Usuário não autenticado.');
      return;
    }

    setPublicando(true);
    setErro('');
    
    try {
      // 1. Upload para Supabase Storage
      const ext = blobGravado.type.includes('mp4') ? 'mp4' : 'webm';
      const nomeArquivo = `aula-${aulaSelecionada}-${Date.now()}.${ext}`;
      const caminho = `videos_aulas/${nomeArquivo}`;

      console.log('[GravacaoAula] Iniciando upload:', caminho);

      const { error: uploadErr } = await supabase.storage
        .from('videos')
        .upload(caminho, blobGravado, { 
          contentType: blobGravado.type, 
          upsert: false 
        });
      
      if (uploadErr) {
        console.error('[GravacaoAula] Erro de upload:', uploadErr);
        throw new Error('Erro ao fazer upload: ' + uploadErr.message);
      }

      // 2. Obtém URL pública
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(caminho);
      
      const videoUrl = urlData?.publicUrl;
      if (!videoUrl) {
        throw new Error('URL do vídeo não foi gerada.');
      }

      console.log('[GravacaoAula] URL gerada:', videoUrl);

      // 3. Registra na tabela `videos_aulas`
      const { error: dbErr } = await supabase
        .from('videos_aulas')
        .insert({
          aula_id: parseInt(aulaSelecionada),
          professor_id: user.id,
          titulo: tituloVideo.trim(),
          url: videoUrl,
          duracao_seg: duracao,
          publicado: true,
        });
      
      if (dbErr) {
        console.error('[GravacaoAula] Erro ao registrar no banco:', dbErr);
        throw new Error('Erro ao registrar vídeo: ' + dbErr.message);
      }

      console.log('[GravacaoAula] Vídeo registrado com sucesso');

      setSucesso('Vídeo publicado com sucesso! Os alunos já podem assistir na área de exercícios.');
      setEtapa('concluido');
    } catch (e) {
      console.error('[GravacaoAula] Erro ao publicar:', e);
      setErro(e.message || 'Erro ao publicar vídeo');
    } finally {
      setPublicando(false);
    }
  };

  // ── Nova gravação ────────────────────────────────────────────────────────
  const novaGravacao = () => {
    descartar();
    setSucesso('');
    setAulaSelecionada('');
    setTituloVideo('');
    setEtapa('gravar');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>

      {/* ── Cabeçalho ── */}
      <div className={styles.header}>
        <div className={styles.headerIcon}><Video size={22} /></div>
        <div>
          <h2 className={styles.headerTitle}>Gravar Vídeo-Aula</h2>
          <p className={styles.headerDesc}>
            Grave, revise, edite e publique sua aula. O vídeo aparecerá ao lado dos exercícios na área do aluno.
          </p>
        </div>
      </div>

      {/* ── Indicador de Etapas ── */}
      <div className={styles.etapas}>
        {['gravar', 'revisar', 'editar', 'publicar', 'concluido'].map((e, i) => {
          const labels = ['1. Gravar', '2. Revisar', '3. Editar', '4. Publicar', '✓ Concluído'];
          const ativo = etapa === e;
          const feito = ['gravar', 'revisar', 'editar', 'publicar', 'concluido'].indexOf(etapa) > i;
          return (
            <div key={e} className={`${styles.etapaItem} ${ativo ? styles.etapaAtiva : ''} ${feito ? styles.etapaFeita : ''}`}>
              {labels[i]}
            </div>
          );
        })}
      </div>

      {/* ════════════ ETAPA 1: GRAVAR ════════════ */}
      {etapa === 'gravar' && (
        <div className={styles.secao}>

          {/* Configurações de dispositivo */}
          {!stream && !gravando && (
            <div className={styles.configDispositivo}>
              <h3 className={styles.subTitle}>Configurar Dispositivos</h3>
              <div className={styles.toggleRow}>
                <button
                  className={`${styles.toggleDev} ${semCamera ? styles.toggleOff : styles.toggleOn}`}
                  onClick={() => setSemCamera(c => !c)}
                >
                  {semCamera ? <VideoOff size={16} /> : <Camera size={16} />}
                  <span>{semCamera ? 'Câmera desligada (só áudio)' : 'Câmera ligada'}</span>
                </button>
                <button
                  className={`${styles.toggleDev} ${semMic ? styles.toggleOff : styles.toggleOn}`}
                  onClick={() => setSemMic(m => !m)}
                >
                  {semMic ? <MicOff size={16} /> : <Mic size={16} />}
                  <span>{semMic ? 'Microfone desligado' : 'Microfone ligado'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Área de vídeo ao vivo */}
          <div className={styles.videoBox}>
            {!stream && !gravando ? (
              <div className={styles.videoPlaceholder}>
                <Camera size={48} className={styles.placeholderIcon} />
                <p>Câmera não iniciada</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                className={styles.videoEl}
                autoPlay
                muted
                playsInline
              />
            )}

            {gravando && (
              <div className={styles.recBadge}>
                <div className={styles.recDot} />
                <span>REC {formatarTempo(duracao)}</span>
              </div>
            )}
          </div>

          {/* Controles */}
          <div className={styles.controles}>
            {!stream && !gravando && (
              <button className={styles.btnPrimary} onClick={iniciarCamera} disabled={iniciando}>
                {iniciando ? <Loader2 size={18} className={styles.spin} /> : <Camera size={18} />}
                {iniciando ? 'Iniciando...' : 'Ligar Câmera'}
              </button>
            )}

            {stream && !gravando && (
              <button className={styles.btnRec} onClick={iniciarGravacao}>
                <Mic size={18} /> Iniciar Gravação
              </button>
            )}

            {gravando && (
              <>
                <button className={styles.btnPause} onClick={togglePausa}>
                  {pausado ? <Play size={18} /> : <Pause size={18} />}
                  {pausado ? 'Retomar' : 'Pausar'}
                </button>
                <button className={styles.btnStop} onClick={pararGravacao}>
                  <StopCircle size={18} /> Parar e Revisar
                </button>
              </>
            )}
          </div>

          {erro && (
            <div className={styles.erroBox} style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={16} /> <span>{erro}</span>
            </div>
          )}

          <p className={styles.dica}>
            Dica: Certifique-se de estar em um ambiente iluminado e com pouco ruído.
          </p>
        </div>
      )}

      {/* ════════════ ETAPA 2: REVISAR ════════════ */}
      {etapa === 'revisar' && urlPreview && (
        <div className={styles.secao}>
          <h3 className={styles.subTitle}>Revisar Gravação</h3>
          
          <div className={styles.videoBox}>
            <video
              ref={previewRef}
              src={urlPreview}
              className={styles.videoEl}
              controls
            />
          </div>

          <div className={styles.miniInfo}>
            <Video size={14} />
            <span>Duração: {formatarTempo(duracao)}</span>
          </div>

          <div className={styles.controles}>
            <button className={styles.btnPrimary} onClick={() => setEtapa('editar')}>
              <Edit3 size={18} /> Editar vídeo
            </button>
            <button className={styles.btnSecundario} onClick={() => setEtapa('publicar')}>
              <CheckCircle size={18} /> Pular edição e publicar
            </button>
            <button className={styles.btnSecundario} onClick={descartar}>
              <Trash2 size={18} /> Descartar e regravar
            </button>
          </div>
        </div>
      )}

      {/* ════════════ ETAPA 3: EDITAR ════════════ */}
      {etapa === 'editar' && blobGravado && (
        <div className={styles.secao}>
          <VideoEditor 
            videoBlob={blobGravado} 
            onSave={handleEditorSave}
            onCancel={() => setEtapa('revisar')}
          />
        </div>
      )}

      {/* ════════════ ETAPA 4: PUBLICAR ════════════ */}
      {etapa === 'publicar' && (
        <div className={styles.secao}>
          <h3 className={styles.subTitle}>Vincular à Aula</h3>

          <div className={styles.miniPreview}>
            <video src={urlPreview} className={styles.miniVideoEl} />
            <div>
              <p style={{fontWeight:700, fontSize:'0.9rem', marginBottom:'4px'}}>Sua gravação</p>
              <p style={{fontSize:'0.75rem', color:'#94a3b8'}}>{formatarTempo(duracao)} • { (blobGravado.size / (1024*1024)).toFixed(1) } MB</p>
            </div>
          </div>

          <div className={styles.formPublicacao}>
            <div className={styles.campo}>
              <label className={styles.label}>Selecione a Aula</label>
              <div className={styles.selectWrapper}>
                <select 
                  className={styles.select}
                  value={aulaSelecionada}
                  onChange={e => setAulaSelecionada(e.target.value)}
                >
                  <option value="">Escolha uma aula...</option>
                  {aulas.map(a => (
                    <option key={a.id} value={a.id}>Aula {a.numero}: {a.titulo}</option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} size={18} />
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Título do Vídeo</label>
              <input 
                type="text" 
                className={styles.input}
                placeholder="Ex: Explicação do Diálogo - Aula 1"
                value={tituloVideo}
                onChange={e => setTituloVideo(e.target.value)}
              />
            </div>

            {erro && <div className={styles.erroBox}><AlertCircle size={16}/> {erro}</div>}

            <div className={styles.controles} style={{marginTop:'1rem'}}>
              <button 
                className={styles.btnPublicar} 
                onClick={publicar}
                disabled={publicando}
              >
                {publicando ? <Loader2 size={18} className={styles.spin} /> : <Upload size={18} />}
                {publicando ? 'Publicando...' : 'Publicar Vídeo'}
              </button>
              <button className={styles.btnSecundario} onClick={() => setEtapa('revisar')} disabled={publicando}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ ETAPA 5: CONCLUÍDO ════════════ */}
      {etapa === 'concluido' && (
        <div className={styles.secao}>
          <div className={styles.sucessoCard}>
            <div className={styles.sucessoIcon}><CheckCircle size={64} /></div>
            <h3>Vídeo Publicado!</h3>
            <p>{sucesso}</p>
            <p className={styles.sucessoDetalhe}>
              O vídeo foi vinculado à aula selecionada e já está disponível para os alunos na seção de exercícios.
            </p>
            <button className={styles.btnPrimary} onClick={novaGravacao} style={{marginTop:'1.5rem'}}>
              <RefreshCw size={18} /> Gravar outro vídeo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
