/**
 * TransmissaoAoVivo.jsx
 * Sala de aula ao vivo em TELA DIVIDIDA com dois apresentadores
 * (professora + professor/marido) conectados por WebRTC ponto-a-ponto,
 * usando o Supabase Realtime (Broadcast) apenas como canal de sinalização
 * (troca de offer/answer/ICE) — sem precisar de nenhuma tabela nova no banco.
 *
 * Como funciona:
 *  1. A professora clica em "Criar Sala" → gera um código de 6 dígitos.
 *  2. O professor abre esta mesma tela em outro dispositivo, digita o
 *     código e entra como convidado.
 *  3. As duas câmeras aparecem lado a lado (tela dividida) para os dois,
 *     ao vivo, em tempo real.
 *  4. Opcionalmente, a anfitriã pode gravar a tela dividida (composição via
 *     <canvas>) e publicar o resultado como vídeo-aula — reaproveitando o
 *     mesmo Storage/tabela usados em "Gravar Vídeo-Aula".
 *
 * IMPORTANTE — limitação técnica honesta:
 *  Esta conexão é PONTO-A-PONTO (WebRTC direto) entre a professora e o
 *  professor. Ela NÃO transmite ao vivo para os alunos assistindo ao mesmo
 *  tempo (isso exigiria um servidor de mídia/SFU dedicado, como LiveKit,
 *  Mux ou Agora). O que os alunos recebem hoje na plataforma é o vídeo
 *  GRAVADO e publicado (ver `VideoAulaProfessora.jsx`). Por isso este
 *  componente também permite gravar a transmissão em tela dividida e
 *  publicá-la — assim o conteúdo da aula com os dois professores chega
 *  até os alunos mesmo sem um servidor de streaming dedicado.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Users,
  Loader2, AlertCircle, Circle, StopCircle, Upload, CheckCircle,
  ChevronDown, RadioTower,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styles from './TransmissaoAoVivo.module.css';

// Servidores STUN públicos para atravessar NAT. Sem um servidor TURN,
// a conexão pode falhar em redes corporativas/muito restritas — nesse
// caso o ideal é adicionar um TURN pago (ex: Twilio, Metered.ca).
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const MAX_DURACAO_SEG = 45 * 60; // 45 minutos máximo de gravação da transmissão

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatarTempo(seg) {
  const m = Math.floor(seg / 60).toString().padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TransmissaoAoVivo() {
  const { user } = useAuth();

  // ── Estado geral ──────────────────────────────────────────────────────
  const [etapa, setEtapa] = useState('inicio'); // inicio | conectando | ao-vivo | gravado | publicar | concluido
  const [papel, setPapel] = useState(null);      // 'anfitriao' | 'convidado'
  const [codigoSala, setCodigoSala] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [statusConexao, setStatusConexao] = useState(''); // texto de progresso
  const [parceiroConectado, setParceiroConectado] = useState(false);
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);

  // ── Controles locais ──────────────────────────────────────────────────
  const [micMudo, setMicMudo] = useState(false);
  const [cameraDesligada, setCameraDesligada] = useState(false);

  // ── Gravação da tela dividida ─────────────────────────────────────────
  const [gravando, setGravando] = useState(false);
  const [duracaoGravacao, setDuracaoGravacao] = useState(0);
  const [blobGravado, setBlobGravado] = useState(null);
  const [urlPreviewGravacao, setUrlPreviewGravacao] = useState(null);

  // ── Publicação ────────────────────────────────────────────────────────
  const [aulas, setAulas] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState('');
  const [tituloVideo, setTituloVideo] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  // ── Refs ──────────────────────────────────────────────────────────────
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const pcRef = useRef(null);
  const channelRef = useRef(null);
  const iceQueueRef = useRef([]); // candidatos recebidos antes de remoteDescription estar pronta

  const canvasRef = useRef(null);
  const canvasStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const rafRef = useRef(null);

  // ── Busca aulas cadastradas (para publicar depois) ───────────────────
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('aulas')
        .select('id, numero, titulo')
        .order('numero', { ascending: true });
      if (!error) setAulas(data || []);
    })();
  }, []);

  // ── Limpeza geral ao desmontar ────────────────────────────────────────
  useEffect(() => {
    return () => encerrarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const encerrarTudo = useCallback(() => {
    clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop(); } catch { /* já finalizado */ }
    }
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    canvasStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    pcRef.current = null;
    channelRef.current = null;
    localStreamRef.current = null;
    canvasStreamRef.current = null;
  }, []);

  // ── Cria a conexão WebRTC + canal de sinalização ─────────────────────
  const criarConexao = useCallback((codigo, sourceRole) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    localStreamRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
      setParceiroConectado(true);
      setStatusConexao('');
      setEtapa('ao-vivo');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        setParceiroConectado(false);
      }
    };

    const channel = supabase.channel(`aula-ao-vivo-${codigo}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({
          type: 'broadcast',
          event: 'sinal',
          payload: { tipo: 'candidate', de: sourceRole, dados: event.candidate },
        });
      }
    };

    channel.on('broadcast', { event: 'sinal' }, async ({ payload }) => {
      if (!payload || payload.de === sourceRole) return;
      try {
        if (payload.tipo === 'join' && sourceRole === 'anfitriao') {
          // Convidado entrou: anfitriã cria a oferta.
          setStatusConexao('Convidado entrou. Conectando vídeo...');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: 'broadcast',
            event: 'sinal',
            payload: { tipo: 'offer', de: sourceRole, dados: offer },
          });
        } else if (payload.tipo === 'offer' && sourceRole === 'convidado') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.dados));
          for (const cand of iceQueueRef.current) await pc.addIceCandidate(cand);
          iceQueueRef.current = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: 'broadcast',
            event: 'sinal',
            payload: { tipo: 'answer', de: sourceRole, dados: answer },
          });
        } else if (payload.tipo === 'answer' && sourceRole === 'anfitriao') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.dados));
          for (const cand of iceQueueRef.current) await pc.addIceCandidate(cand);
          iceQueueRef.current = [];
        } else if (payload.tipo === 'candidate') {
          const cand = new RTCIceCandidate(payload.dados);
          if (pc.remoteDescription) await pc.addIceCandidate(cand);
          else iceQueueRef.current.push(cand);
        } else if (payload.tipo === 'bye') {
          setParceiroConectado(false);
          setStatusConexao('O outro participante saiu da sala.');
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        }
      } catch (e) {
        console.error('[TransmissaoAoVivo] Erro de sinalização:', e);
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && sourceRole === 'convidado') {
        channel.send({ type: 'broadcast', event: 'sinal', payload: { tipo: 'join', de: sourceRole } });
      }
    });
  }, []);

  // ── Pega câmera/microfone locais ──────────────────────────────────────
  const obterMidiaLocal = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Este navegador não suporta acesso à câmera (verifique se o acesso é via HTTPS).');
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      await localVideoRef.current.play().catch(() => {});
    }
    return stream;
  };

  // ── Anfitriã cria a sala ──────────────────────────────────────────────
  const criarSala = async () => {
    setErro('');
    setEtapa('conectando');
    setStatusConexao('Ligando câmera...');
    try {
      await obterMidiaLocal();
      const codigo = gerarCodigo();
      setCodigoSala(codigo);
      setPapel('anfitriao');
      setStatusConexao('Sala criada. Aguardando o outro professor entrar...');
      criarConexao(codigo, 'anfitriao');
    } catch (e) {
      console.error('[TransmissaoAoVivo] Erro ao criar sala:', e);
      setErro(e.message || 'Não foi possível acessar câmera/microfone.');
      setEtapa('inicio');
    }
  };

  // ── Professor entra na sala ────────────────────────────────────────────
  const entrarNaSala = async () => {
    setErro('');
    const codigo = codigoDigitado.trim();
    if (!/^\d{6}$/.test(codigo)) {
      setErro('Digite o código de 6 dígitos enviado pela professora.');
      return;
    }
    setEtapa('conectando');
    setStatusConexao('Ligando câmera...');
    try {
      await obterMidiaLocal();
      setCodigoSala(codigo);
      setPapel('convidado');
      setStatusConexao('Conectando com a professora...');
      criarConexao(codigo, 'convidado');
    } catch (e) {
      console.error('[TransmissaoAoVivo] Erro ao entrar na sala:', e);
      setErro(e.message || 'Não foi possível acessar câmera/microfone.');
      setEtapa('inicio');
    }
  };

  // ── Controles de mídia local ──────────────────────────────────────────
  const alternarMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = micMudo; });
    setMicMudo(m => !m);
  };

  const alternarCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = cameraDesligada; });
    setCameraDesligada(c => !c);
  };

  const sairDaSala = () => {
    channelRef.current?.send({ type: 'broadcast', event: 'sinal', payload: { tipo: 'bye', de: papel } });
    encerrarTudo();
    setEtapa('inicio');
    setPapel(null);
    setCodigoSala('');
    setCodigoDigitado('');
    setParceiroConectado(false);
    setStatusConexao('');
  };

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigoSala);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* clipboard indisponível */ }
  };

  // ── Compositor de tela dividida (canvas) + gravação ───────────────────
  const desenharFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, w, h);

    const localEl = localVideoRef.current;
    const remoteEl = remoteVideoRef.current;
    const metade = w / 2;

    if (localEl && localEl.readyState >= 2) {
      ctx.drawImage(localEl, 0, 0, metade, h);
    }
    if (remoteEl && remoteEl.readyState >= 2) {
      ctx.drawImage(remoteEl, metade, 0, metade, h);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(metade, 0, metade, h);
      ctx.fillStyle = '#64748b';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aguardando o outro professor...', metade + metade / 2, h / 2);
    }

    // linha divisória
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(metade - 1, 0, 2, h);

    rafRef.current = requestAnimationFrame(desenharFrame);
  }, []);

  const iniciarGravacaoTela = () => {
    if (!window.MediaRecorder || !canvasRef.current) {
      setErro('Gravação não suportada neste navegador.');
      return;
    }
    setErro('');
    canvasRef.current.width = 1280;
    canvasRef.current.height = 720;
    rafRef.current = requestAnimationFrame(desenharFrame);

    const canvasStream = canvasRef.current.captureStream(30);
    // Mistura o áudio local (e do parceiro, se disponível) no stream gravado
    const audioTracks = [
      ...(localStreamRef.current?.getAudioTracks() || []),
      ...(remoteVideoRef.current?.srcObject?.getAudioTracks?.() || []),
    ];
    audioTracks.forEach(t => canvasStream.addTrack(t));
    canvasStreamRef.current = canvasStream;

    const candidatos = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const mimeType = candidatos.find(t => MediaRecorder.isTypeSupported?.(t)) || '';

    chunksRef.current = [];
    const rec = mimeType ? new MediaRecorder(canvasStream, { mimeType }) : new MediaRecorder(canvasStream);
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'video/webm' });
      setBlobGravado(blob);
      setUrlPreviewGravacao(URL.createObjectURL(blob));
      setEtapa('gravado');
    };
    rec.start();
    recorderRef.current = rec;

    setGravando(true);
    setDuracaoGravacao(0);
    const inicioMs = Date.now();
    timerRef.current = setInterval(() => {
      const decorridos = Math.floor((Date.now() - inicioMs) / 1000);
      setDuracaoGravacao(decorridos);
      if (decorridos >= MAX_DURACAO_SEG) pararGravacaoTela();
    }, 1000);
  };

  const pararGravacaoTela = () => {
    clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setGravando(false);
  };

  // ── Publicar gravação da tela dividida ─────────────────────────────────
  const publicar = async () => {
    if (!blobGravado || !aulaSelecionada || !tituloVideo.trim() || !user?.id) {
      setErro('Preencha a aula e o título antes de publicar.');
      return;
    }
    setPublicando(true);
    setErro('');
    try {
      const nomeArquivo = `aula-${aulaSelecionada}-live-${Date.now()}.webm`;
      const caminho = `videos_aulas/${nomeArquivo}`;
      const { error: uploadErr } = await supabase.storage
        .from('videos')
        .upload(caminho, blobGravado, { contentType: blobGravado.type, upsert: false });
      if (uploadErr) throw new Error('Erro ao fazer upload: ' + uploadErr.message);

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(caminho);
      if (!urlData?.publicUrl) throw new Error('URL do vídeo não foi gerada.');

      const { error: dbErr } = await supabase.from('videos_aulas').insert({
        aula_id: parseInt(aulaSelecionada),
        professor_id: user.id,
        titulo: tituloVideo.trim(),
        url: urlData.publicUrl,
        duracao_seg: duracaoGravacao,
        publicado: true,
      });
      if (dbErr) throw new Error('Erro ao registrar vídeo: ' + dbErr.message);

      setSucesso('Aula ao vivo (tela dividida) publicada com sucesso!');
      setEtapa('concluido');
    } catch (e) {
      console.error('[TransmissaoAoVivo] Erro ao publicar:', e);
      setErro(e.message || 'Erro ao publicar vídeo.');
    } finally {
      setPublicando(false);
    }
  };

  const recomecar = () => {
    if (urlPreviewGravacao) URL.revokeObjectURL(urlPreviewGravacao);
    setBlobGravado(null);
    setUrlPreviewGravacao(null);
    setDuracaoGravacao(0);
    setAulaSelecionada('');
    setTituloVideo('');
    setSucesso('');
    setEtapa('ao-vivo');
  };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}><RadioTower size={22} /></div>
        <div>
          <h2 className={styles.headerTitle}>Aula ao Vivo — Tela Dividida</h2>
          <p className={styles.headerDesc}>
            Conecte a professora e o professor na mesma sala, em tela dividida, e grave/publique a aula em dupla.
          </p>
        </div>
      </div>

      {/* Canvas oculto usado apenas para compor a gravação */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ════════ ETAPA: INÍCIO ════════ */}
      {etapa === 'inicio' && (
        <div className={styles.secao}>
          <div className={styles.opcoesEntrada}>
            <div className={styles.cardOpcao}>
              <Users size={28} className={styles.opcaoIcon} />
              <h3>Sou a professora (anfitriã)</h3>
              <p>Cria uma sala nova e gera um código para o outro professor entrar.</p>
              <button className={styles.btnPrimary} onClick={criarSala}>
                <Video size={18} /> Criar Sala
              </button>
            </div>

            <div className={styles.cardOpcao}>
              <Users size={28} className={styles.opcaoIcon} />
              <h3>Sou o professor convidado</h3>
              <p>Digite o código de 6 dígitos recebido para entrar na sala.</p>
              <input
                className={styles.inputCodigo}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                value={codigoDigitado}
                onChange={e => setCodigoDigitado(e.target.value.replace(/\D/g, ''))}
              />
              <button className={styles.btnSecundario} onClick={entrarNaSala}>
                <Video size={18} /> Entrar na Sala
              </button>
            </div>
          </div>

          {erro && <div className={styles.erroBox}><AlertCircle size={16} /> <span>{erro}</span></div>}
        </div>
      )}

      {/* ════════ ETAPA: CONECTANDO ════════ */}
      {etapa === 'conectando' && (
        <div className={styles.secao}>
          <div className={styles.statusCard}>
            <Loader2 size={32} className={styles.spin} />
            <p>{statusConexao}</p>
            {papel === 'anfitriao' && codigoSala && (
              <div className={styles.codigoBox}>
                <span>Código da sala:</span>
                <strong>{codigoSala}</strong>
                <button onClick={copiarCodigo} className={styles.btnCopiar}>
                  {copiado ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <p className={styles.dicaCodigo}>Envie este código para o outro professor entrar.</p>
              </div>
            )}
          </div>
          {erro && <div className={styles.erroBox}><AlertCircle size={16} /> <span>{erro}</span></div>}
        </div>
      )}

      {/* ════════ ETAPA: AO VIVO (TELA DIVIDIDA) ════════ */}
      {(etapa === 'ao-vivo') && (
        <div className={styles.secao}>
          {papel === 'anfitriao' && (
            <div className={styles.codigoBoxInline}>
              Código da sala: <strong>{codigoSala}</strong>
              <button onClick={copiarCodigo} className={styles.btnCopiarInline}>
                {copiado ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}

          <div className={styles.telaDividida}>
            <div className={styles.tile}>
              <video ref={localVideoRef} className={styles.videoEl} autoPlay muted playsInline />
              <span className={styles.tileLabel}>Você</span>
            </div>
            <div className={styles.tile}>
              <video ref={remoteVideoRef} className={styles.videoEl} autoPlay playsInline />
              <span className={styles.tileLabel}>{parceiroConectado ? 'Outro professor' : 'Aguardando...'}</span>
              {!parceiroConectado && (
                <div className={styles.aguardandoOverlay}>
                  <Loader2 size={28} className={styles.spin} />
                  <span>Aguardando conexão...</span>
                </div>
              )}
            </div>
          </div>

          {gravando && (
            <div className={styles.recBadge}>
              <Circle size={10} className={styles.recDot} fill="currentColor" />
              <span>Gravando tela dividida — {formatarTempo(duracaoGravacao)}</span>
            </div>
          )}

          <div className={styles.controles}>
            <button className={styles.btnControle} onClick={alternarMic}>
              {micMudo ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button className={styles.btnControle} onClick={alternarCamera}>
              {cameraDesligada ? <VideoOff size={18} /> : <Video size={18} />}
            </button>

            {!gravando ? (
              <button className={styles.btnRec} onClick={iniciarGravacaoTela}>
                <Circle size={14} fill="currentColor" /> Gravar Tela Dividida
              </button>
            ) : (
              <button className={styles.btnStop} onClick={pararGravacaoTela}>
                <StopCircle size={18} /> Parar Gravação
              </button>
            )}

            <button className={styles.btnSair} onClick={sairDaSala}>
              <PhoneOff size={18} /> Sair da Sala
            </button>
          </div>

          <p className={styles.dica}>
            Esta é uma conexão direta entre os dois professores. Para que os alunos assistam,
            grave a tela dividida e publique — o vídeo aparecerá para eles como qualquer outra aula.
          </p>

          {erro && <div className={styles.erroBox}><AlertCircle size={16} /> <span>{erro}</span></div>}
        </div>
      )}

      {/* ════════ ETAPA: GRAVADO → PUBLICAR ════════ */}
      {etapa === 'gravado' && urlPreviewGravacao && (
        <div className={styles.secao}>
          <h3 className={styles.subTitle}>Revisar Gravação da Aula em Dupla</h3>
          <div className={styles.videoBox}>
            <video src={urlPreviewGravacao} className={styles.videoEl} controls />
          </div>
          <div className={styles.controles}>
            <button className={styles.btnPrimary} onClick={() => setEtapa('publicar')}>
              <Upload size={18} /> Publicar para os alunos
            </button>
            <button className={styles.btnSecundario} onClick={recomecar}>
              Voltar à transmissão
            </button>
          </div>
        </div>
      )}

      {etapa === 'publicar' && (
        <div className={styles.secao}>
          <h3 className={styles.subTitle}>Vincular à Aula</h3>
          <div className={styles.campo}>
            <label className={styles.label}>Selecione a Aula</label>
            <div className={styles.selectWrapper}>
              <select className={styles.select} value={aulaSelecionada} onChange={e => setAulaSelecionada(e.target.value)}>
                <option value="">Escolha uma aula...</option>
                {aulas.map(a => <option key={a.id} value={a.id}>Aula {a.numero}: {a.titulo}</option>)}
              </select>
              <ChevronDown className={styles.selectIcon} size={18} />
            </div>
          </div>
          <div className={styles.campo}>
            <label className={styles.label}>Título do Vídeo</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ex: Aula ao vivo com os dois professores"
              value={tituloVideo}
              onChange={e => setTituloVideo(e.target.value)}
            />
          </div>
          {erro && <div className={styles.erroBox}><AlertCircle size={16} /> {erro}</div>}
          <div className={styles.controles}>
            <button className={styles.btnPublicar} onClick={publicar} disabled={publicando}>
              {publicando ? <Loader2 size={18} className={styles.spin} /> : <Upload size={18} />}
              {publicando ? 'Publicando...' : 'Publicar Vídeo'}
            </button>
            <button className={styles.btnSecundario} onClick={() => setEtapa('gravado')} disabled={publicando}>
              Voltar
            </button>
          </div>
        </div>
      )}

      {etapa === 'concluido' && (
        <div className={styles.secao}>
          <div className={styles.sucessoCard}>
            <CheckCircle size={64} />
            <h3>Vídeo Publicado!</h3>
            <p>{sucesso}</p>
            <button className={styles.btnPrimary} onClick={sairDaSala} style={{ marginTop: '1.5rem' }}>
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
