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
  RotateCcw, Settings, Maximize2, Minimize2, Monitor, XCircle,
  Volume2, Download,
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

  // Estado dos controles profissionais (barra inferior)
  const [fonte, setFonte] = useState('camera');       // 'camera' | 'tela'
  const [micMutado, setMicMutado] = useState(false);
  const [cameraDesligada, setCameraDesligada] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // frontal/traseira
  const [qualidade, setQualidade] = useState('720p');   // '480p' | '720p' | '1080p'
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [contagem, setContagem] = useState(null);       // 3,2,1 antes de gravar
  const [telaCheia, setTelaCheia] = useState(false);
  const [nivelAudio, setNivelAudio] = useState(0);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

  // Refs
  const videoRef = useRef(null);         // preview ao vivo
  const previewRef = useRef(null);       // replay da gravação
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);     // fallback mobile nativo
  const videoBoxRef = useRef(null);      // container para tela cheia
  const contagemTimerRef = useRef(null);

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

  // ── Resolução conforme qualidade selecionada ─────────────────────────────
  const resolucaoIdeal = useCallback(() => {
    switch (qualidade) {
      case '480p': return { width: 640, height: 480 };
      case '1080p': return { width: 1920, height: 1080 };
      default: return { width: 1280, height: 720 };
    }
  }, [qualidade]);

  // ── Inicia câmera ────────────────────────────────────────────────────────
  const iniciarCamera = useCallback(async () => {
    setIniciando(true);
    setErro('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador ou conexão (HTTP/origem não segura) não suporta gravação de mídia. Por favor, certifique-se de acessar via HTTPS.');
      }

      const { width, height } = resolucaoIdeal();
      const constraints = {
        video: !semCamera ? { 
          width: { ideal: width }, 
          height: { ideal: height }, 
          facingMode 
        } : false,
        audio: !semMic,
      };
      
      let s;
      try {
        s = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn('[GravacaoAula] Falha nas constraints ideais, tentando genérico...', err);
        // Fallback genérico caso o dispositivo rejeite a resolução ou facingMode
        s = await navigator.mediaDevices.getUserMedia({ video: !semCamera, audio: !semMic });
      }
      setStream(s);
      setMicMutado(false);
      setCameraDesligada(false);
      
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
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        mensagem = 'Permissão negada. No celular, vá em Configurações > Aplicativos > seu Navegador (Chrome/Safari) > Permissões e libere Câmera/Microfone. (Ou abra no Chrome ao invés de redes sociais).';
      } else if (e.name === 'NotFoundError') {
        mensagem = 'Nenhum dispositivo de câmera ou microfone físico foi encontrado.';
      } else if (e.name === 'NotReadableError') {
        mensagem = 'A câmera ou o microfone já está em uso por outro aplicativo ou aba.';
      } else if (e.name === 'OverconstrainedError') {
        mensagem = 'A câmera do dispositivo não suporta os requisitos de vídeo solicitados.';
      }
      
      setErro(mensagem);
    } finally {
      setIniciando(false);
    }
  }, [semCamera, semMic, facingMode, resolucaoIdeal]);

  // ── Inicia compartilhamento de tela (para aulas com slides/quadro) ───────
  const iniciarTela = useCallback(async () => {
    setIniciando(true);
    setErro('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Seu navegador não suporta compartilhamento de tela.');
      }
      const telaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

      let audioTrack = null;
      if (!semMic) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioTrack = audioStream.getAudioTracks()[0];
        } catch (e) {
          console.warn('[GravacaoAula] Microfone indisponível para narrar a tela:', e);
        }
      }

      const tracks = [...telaStream.getVideoTracks()];
      if (audioTrack) tracks.push(audioTrack);
      else tracks.push(...telaStream.getAudioTracks());

      const combinado = new MediaStream(tracks);

      // Se a professora parar o compartilhamento pelo painel do navegador,
      // finaliza a gravação automaticamente em vez de travar a tela.
      telaStream.getVideoTracks()[0].addEventListener('ended', () => {
        pararGravacao();
      });

      setStream(combinado);
      setMicMutado(false);
      setCameraDesligada(false);

      if (videoRef.current) {
        videoRef.current.srcObject = combinado;
        try { await videoRef.current.play(); } catch { /* silencioso */ }
      }
    } catch (e) {
      console.error('[GravacaoAula] Erro ao compartilhar tela:', e);
      const mensagem = (e.name === 'NotAllowedError')
        ? 'Permissão para compartilhar a tela foi negada ou cancelada.'
        : (e.message || 'Não foi possível iniciar o compartilhamento de tela.');
      setErro(mensagem);
    } finally {
      setIniciando(false);
    }
  }, [semMic]);

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
      clearInterval(contagemTimerRef.current);
      if (urlPreview) URL.revokeObjectURL(urlPreview);
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try { recorderRef.current.stop(); } catch { /* já finalizado */ }
      }
    };
  }, [stream, urlPreview]);

  // Se o navegador não suporta pause()/resume() nativos do MediaRecorder
  // (alguns WebViews/Safari antigos), escondemos o botão de pausa em vez de
  // deixar a professora clicar num botão que nunca funciona.
  const [pausaSuportada, setPausaSuportada] = useState(true);

  // Escolhe o melhor mimeType SUPORTADO DE FATO pelo navegador atual.
  // Importante: nunca "chutar" um mimeType não verificado (ex: 'video/mp4'
  // sem checar isTypeSupported) — em Chrome/Firefox isso faz o construtor
  // do MediaRecorder lançar NotSupportedError e a gravação nem começa.
  const escolherMimeType = () => {
    const candidatos = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
    ];
    for (const tipo of candidatos) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported?.(tipo)) return tipo;
    }
    return ''; // deixa o navegador decidir como último recurso
  };

  // ── Iniciar gravação ─────────────────────────────────────────────────────
  const iniciarGravacao = () => {
    if (!stream) return;

    if (!window.MediaRecorder) {
      setErro('Este navegador não suporta gravação de vídeo (MediaRecorder indisponível). Tente atualizar o navegador ou use o botão de câmera nativa do celular abaixo.');
      return;
    }

    chunksRef.current = [];
    const mimeType = escolherMimeType();

    try {
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const mimeFinal = rec.mimeType || mimeType || 'video/webm';

      // Detecta suporte real a pause/resume neste navegador
      setPausaSuportada(typeof rec.pause === 'function' && typeof rec.resume === 'function');

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      rec.onstop = () => {
        if (chunksRef.current.length === 0) {
          setErro('A gravação não produziu nenhum dado de vídeo. Tente novamente.');
          setEtapa('gravar');
          return;
        }
        const blob = new Blob(chunksRef.current, { type: mimeFinal });
        setBlobGravado(blob);
        const url = URL.createObjectURL(blob);
        setUrlPreview(url);
        setEtapa('revisar');
      };

      rec.onerror = (e) => {
        console.error('[GravacaoAula] Erro no MediaRecorder:', e);
        setErro('Erro durante a gravação: ' + (e.error?.message || e.error || 'erro desconhecido'));
      };

      // NÃO passar um "timeslice" (ex: rec.start(1000)) aqui.
      // Vários navegadores (principalmente Chrome) têm um bug conhecido em
      // que gravar com timeslice + pause()/resume() corrompe o trecho
      // gravado após a retomada, gerando um vídeo que não reproduz na
      // revisão. Gravando em um único blob (sem timeslice) evita esse bug.
      rec.start();
      recorderRef.current = rec;

      setGravando(true);
      setPausado(false);
      setDuracao(0);

      const inicioMs = Date.now();
      timerRef.current = setInterval(() => {
        const decorridos = Math.floor((Date.now() - inicioMs) / 1000);
        setDuracao(decorridos);
        if (decorridos >= MAX_DURACAO_SEG) {
          pararGravacao();
        }
      }, 1000);
    } catch (e) {
      console.error('[GravacaoAula] Erro ao iniciar gravação:', e);
      setErro(
        'Erro ao iniciar gravação: ' + (e.message || 'formato de vídeo não suportado por este navegador.') +
        ' Tente usar o botão de câmera nativa do celular abaixo.'
      );
    }
  };

  // ── Pausar / Retomar ─────────────────────────────────────────────────────
  const togglePausa = () => {
    const rec = recorderRef.current;
    if (!rec) return;

    try {
      if (pausado) {
        if (rec.state !== 'paused') {
          setPausado(false);
          return;
        }
        rec.resume();
        const inicioMs = Date.now() - duracao * 1000;
        timerRef.current = setInterval(() => {
          setDuracao(Math.floor((Date.now() - inicioMs) / 1000));
        }, 1000);
        setPausado(false);
      } else {
        if (rec.state !== 'recording') {
          setPausado(rec.state === 'paused');
          return;
        }
        rec.pause();
        clearInterval(timerRef.current);
        setPausado(true);
      }
    } catch (e) {
      console.error('[GravacaoAula] Erro ao pausar/retomar:', e);
      setErro('Não foi possível pausar/retomar a gravação neste navegador. Você ainda pode clicar em "Parar e Revisar".');
    }
  };

  // ── Silenciar / Ativar microfone (funciona antes e durante a gravação) ───
  const alternarMic = () => {
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = micMutado; // se estava mutado, liga; senão desliga
    setMicMutado(m => !m);
  };

  // ── Ligar / Desligar câmera (funciona antes e durante a gravação) ────────
  const alternarCamera = () => {
    if (!stream || fonte === 'tela') return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = cameraDesligada;
    setCameraDesligada(c => !c);
  };

  // ── Trocar câmera frontal/traseira (celular) ─────────────────────────────
  const trocarCamera = async () => {
    if (!stream || gravando || fonte === 'tela') return;
    const novoFacing = facingMode === 'user' ? 'environment' : 'user';
    try {
      const { width, height } = resolucaoIdeal();
      const s = await navigator.mediaDevices.getUserMedia({
        video: !semCamera ? { facingMode: novoFacing, width: { ideal: width }, height: { ideal: height } } : false,
        audio: !semMic,
      });
      stream.getTracks().forEach(t => t.stop());
      setFacingMode(novoFacing);
      setStream(s);
      setMicMutado(false);
      setCameraDesligada(false);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.error('[GravacaoAula] Erro ao trocar câmera:', e);
      setErro('Não foi possível alternar a câmera neste dispositivo.');
    }
  };

  // ── Contagem regressiva profissional antes de iniciar (3, 2, 1) ──────────
  const iniciarComContagem = () => {
    if (!stream || contagem) return;
    setErro('');
    let n = 3;
    setContagem(n);
    contagemTimerRef.current = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(contagemTimerRef.current);
        setContagem(null);
        iniciarGravacao();
      } else {
        setContagem(n);
      }
    }, 800);
  };

  // ── Cancelar gravação em andamento (exige confirmação) ───────────────────
  const cancelarGravacao = () => {
    if (!confirmandoDescarte) {
      setConfirmandoDescarte(true);
      setTimeout(() => setConfirmandoDescarte(false), 4000);
      return;
    }
    clearInterval(timerRef.current);
    const rec = recorderRef.current;
    if (rec) {
      rec.ondataavailable = null;
      rec.onstop = null;
      if (rec.state !== 'inactive') { try { rec.stop(); } catch { /* já finalizado */ } }
    }
    chunksRef.current = [];
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setGravando(false);
    setPausado(false);
    setDuracao(0);
    setConfirmandoDescarte(false);
    setEtapa('gravar');
  };

  // ── Baixar cópia local de segurança (backup) ─────────────────────────────
  const baixarCopiaLocal = () => {
    if (!blobGravado) return;
    const ext = blobGravado.type?.includes('mp4') ? 'mp4' : 'webm';
    const url = URL.createObjectURL(blobGravado);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aula-gravada-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Tela cheia no preview de vídeo ────────────────────────────────────────
  const alternarTelaCheia = async () => {
    const el = videoBoxRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (e) {
      console.warn('[GravacaoAula] Tela cheia indisponível:', e);
    }
  };

  useEffect(() => {
    const handler = () => setTelaCheia(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Atalhos de teclado: Espaço pausa/retoma, Esc finaliza ────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (etapa !== 'gravar' || !gravando) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePausa();
      } else if (e.key === 'Escape') {
        pararGravacao();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa, gravando, pausado]);

  // ── Medidor de nível de áudio (feedback visual profissional) ─────────────
  useEffect(() => {
    const audioTrack = stream?.getAudioTracks?.()[0];
    if (!audioTrack) { setNivelAudio(0); return; }

    let raf;
    let ctx;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const media = data.reduce((a, b) => a + b, 0) / data.length;
        setNivelAudio(Math.min(100, Math.round((media / 128) * 100)));
        raf = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn('[GravacaoAula] Medidor de áudio indisponível:', e);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ctx?.close?.().catch(() => {});
    };
  }, [stream]);

  // ── Parar gravação ───────────────────────────────────────────────────────
  const pararGravacao = () => {
    try {
      clearInterval(timerRef.current);
      const rec = recorderRef.current;
      // stop() em estado 'inactive' lança InvalidStateError — evita o erro.
      if (rec && rec.state !== 'inactive') {
        rec.stop();
      }
      setGravando(false);
      setPausado(false);
      stream?.getTracks().forEach(t => t.stop());
      setStream(null);
    } catch (e) {
      console.error('[GravacaoAula] Erro ao parar gravação:', e);
      setErro('Erro ao finalizar a gravação: ' + (e.message || ''));
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditorSave = (editedBlob, metadata) => {
    setBlobGravado(editedBlob);
    setTituloVideo(metadata.titulo);
    setEtapa('publicar');
  };

  // ── Fallback de Gravação Nativa (Mobile) ──────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBlobGravado(file);
    setUrlPreview(URL.createObjectURL(file));
    setDuracao(0); // Duração pode não ser exata por upload nativo
    setEtapa('revisar');
    setErro('');
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
              <h3 className={styles.subTitle}>Fonte de Gravação</h3>
              <div className={styles.toggleRow}>
                <button
                  className={`${styles.toggleDev} ${fonte === 'camera' ? styles.toggleOn : ''}`}
                  onClick={() => setFonte('camera')}
                >
                  <Camera size={16} />
                  <span>Câmera</span>
                </button>
                <button
                  className={`${styles.toggleDev} ${fonte === 'tela' ? styles.toggleOn : ''}`}
                  onClick={() => setFonte('tela')}
                >
                  <Monitor size={16} />
                  <span>Compartilhar Tela (slides/quadro)</span>
                </button>
              </div>

              {fonte === 'camera' && (
                <>
                  <h3 className={styles.subTitle} style={{ marginTop: '0.5rem' }}>Configurar Dispositivos</h3>
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
                </>
              )}

              <h3 className={styles.subTitle} style={{ marginTop: '0.5rem' }}>Qualidade de Vídeo</h3>
              <div className={styles.toggleRow}>
                {['480p', '720p', '1080p'].map(q => (
                  <button
                    key={q}
                    className={`${styles.toggleDev} ${qualidade === q ? styles.toggleOn : ''}`}
                    onClick={() => setQualidade(q)}
                  >
                    <span>{q}{q === '720p' ? ' (recomendado)' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Área de vídeo ao vivo */}
          <div className={styles.videoBox} ref={videoBoxRef}>
            {!stream && !gravando ? (
              <div className={styles.videoPlaceholder}>
                {fonte === 'tela' ? <Monitor size={48} className={styles.placeholderIcon} /> : <Camera size={48} className={styles.placeholderIcon} />}
                <p>{fonte === 'tela' ? 'Tela não compartilhada' : 'Câmera não iniciada'}</p>
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

            {contagem && (
              <div className={styles.contagemOverlay}>
                <span>{contagem}</span>
              </div>
            )}
          </div>

          {/* Botão inicial (ligar câmera/tela) — só aparece antes do stream existir */}
          {!stream && !gravando && (
            <div className={styles.controles}>
              <button
                className={styles.btnPrimary}
                onClick={fonte === 'tela' ? iniciarTela : iniciarCamera}
                disabled={iniciando}
              >
                {iniciando ? <Loader2 size={18} className={styles.spin} /> : (fonte === 'tela' ? <Monitor size={18} /> : <Camera size={18} />)}
                {iniciando ? 'Iniciando...' : (fonte === 'tela' ? 'Iniciar Compartilhamento' : 'Ligar Câmera')}
              </button>
            </div>
          )}

          {/* ══════════ Barra de Controle Profissional ══════════ */}
          {stream && (
            <div className={styles.barraPro}>
              <div className={styles.barraProGrupo}>
                <button
                  className={`${styles.miniBtn} ${micMutado ? styles.miniBtnOff : ''}`}
                  onClick={alternarMic}
                  title={micMutado ? 'Ativar microfone' : 'Silenciar microfone'}
                >
                  {micMutado ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  className={`${styles.miniBtn} ${cameraDesligada ? styles.miniBtnOff : ''}`}
                  onClick={alternarCamera}
                  disabled={fonte === 'tela'}
                  title={fonte === 'tela' ? 'Indisponível ao compartilhar tela' : (cameraDesligada ? 'Ligar câmera' : 'Desligar câmera')}
                >
                  {cameraDesligada ? <VideoOff size={18} /> : <Camera size={18} />}
                </button>
                <button
                  className={styles.miniBtn}
                  onClick={trocarCamera}
                  disabled={gravando || fonte === 'tela'}
                  title="Trocar câmera (frontal/traseira)"
                >
                  <RotateCcw size={18} />
                </button>
                <div className={styles.medidorAudio} title="Nível de áudio captado">
                  <Volume2 size={14} />
                  <div className={styles.medidorBarra}>
                    <div className={styles.medidorNivel} style={{ width: `${nivelAudio}%` }} />
                  </div>
                </div>
              </div>

              <div className={styles.barraProCentro}>
                <span className={styles.tempoGrande}>{formatarTempo(duracao)}</span>

                {!gravando ? (
                  <button
                    className={styles.btnRecRedondo}
                    onClick={iniciarComContagem}
                    disabled={!!contagem}
                    title="Iniciar gravação (Espaço)"
                  >
                    <div className={styles.recCirculo} />
                  </button>
                ) : (
                  <>
                    {pausaSuportada && (
                      <button className={styles.miniBtn} onClick={togglePausa} title={pausado ? 'Retomar (Espaço)' : 'Pausar (Espaço)'}>
                        {pausado ? <Play size={18} /> : <Pause size={18} />}
                      </button>
                    )}
                    <button
                      className={styles.btnRecRedondo}
                      onClick={pararGravacao}
                      title="Finalizar gravação e revisar (Esc)"
                    >
                      <div className={styles.stopQuadrado} />
                    </button>
                  </>
                )}
              </div>

              <div className={styles.barraProGrupo}>
                {gravando && (
                  <button
                    className={`${styles.miniBtn} ${confirmandoDescarte ? styles.miniBtnAlerta : ''}`}
                    onClick={cancelarGravacao}
                    title={confirmandoDescarte ? 'Clique novamente para confirmar o cancelamento' : 'Cancelar gravação'}
                  >
                    <XCircle size={18} />
                  </button>
                )}
                {!gravando && (
                  <button
                    className={styles.miniBtn}
                    onClick={() => setMostrarConfig(c => !c)}
                    title="Qualidade de vídeo"
                  >
                    <Settings size={18} />
                  </button>
                )}
                <button className={styles.miniBtn} onClick={alternarTelaCheia} title={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}>
                  {telaCheia ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>
          )}

          {mostrarConfig && !gravando && (
            <div className={styles.configDispositivo}>
              <h3 className={styles.subTitle}>Qualidade de Vídeo</h3>
              <div className={styles.toggleRow}>
                {['480p', '720p', '1080p'].map(q => (
                  <button
                    key={q}
                    className={`${styles.toggleDev} ${qualidade === q ? styles.toggleOn : ''}`}
                    onClick={() => setQualidade(q)}
                  >
                    <span>{q}{q === '720p' ? ' (recomendado)' : ''}</span>
                  </button>
                ))}
              </div>
              <p className={styles.dica}>A nova qualidade vale a partir da próxima vez que ligar a câmera.</p>
            </div>
          )}

          <p className={styles.dica}>
            Atalhos de teclado: <b>Espaço</b> pausa/retoma a gravação · <b>Esc</b> finaliza e leva para a revisão.
          </p>

          {erro && (
            <div className={styles.erroBox} style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={16} /> <span>{erro}</span>

              {/* Botão de Fallback para App de Câmera Nativa do Celular */}
              <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '8px', color: '#cbd5e1' }}>
                  Não quer mexer nas configurações? Grave usando a câmera nativa do seu celular:
                </p>
                <button 
                  className={styles.btnPrimary} 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#8b5cf6' }}
                >
                  <Camera size={18} /> Usar Câmera do Celular
                </button>
                <input 
                  type="file" 
                  accept="video/*" 
                  capture="environment" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />
              </div>
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
            <button className={styles.btnSecundario} onClick={baixarCopiaLocal}>
              <Download size={18} /> Baixar cópia (backup)
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
