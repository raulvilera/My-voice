import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Play, Square, Volume2 } from 'lucide-react';

export const SecaoDialogo = ({ section: rawSection }) => {
  const section = {
    ...rawSection,
    personagens: rawSection?.personagens ?? rawSection?.conteudo?.personagens ?? [],
    falas:       rawSection?.falas       ?? rawSection?.conteudo?.falas       ?? [],
    titulo:      rawSection?.titulo      ?? '',
    audioSrc:    rawSection?.audioSrc    ?? rawSection?.conteudo?.audioSrc    ?? null,
  };

  const [isPlaying, setIsPlaying]         = useState(false);
  const [activeFala, setActiveFala]       = useState(-1);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [speed, setSpeed]                 = useState(0.9);
  const [voicesReady, setVoicesReady]     = useState(false);

  const cancelledRef = useRef(false);
  const timersRef    = useRef([]);
  const audioRef     = useRef(null);

  useEffect(() => {
    const load = () => { if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const getVoice = useCallback((personagem) => {
    const voices   = window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    if (!enVoices.length) return null;
    const isFirst   = personagem === section.personagens[0];
    const preferred = isFirst
      ? ['Samantha','Karen','Victoria','Moira','Tessa','Zoe']
      : ['Daniel','Alex','Fred','Fiona','Serena','Rishi'];
    for (const name of preferred) {
      const v = enVoices.find(v => v.name.includes(name));
      if (v) return v;
    }
    return enVoices[isFirst ? 0 : Math.min(1, enVoices.length - 1)];
  }, [section.personagens]);

  const estimateWordDurations = (words, rate) => {
    const BASE_CHAR_MS = 68, BASE_PAUSE = 55;
    return words.map(w => Math.round(((w.replace(/[^a-zA-Z]/g,'').length || 1) * BASE_CHAR_MS + BASE_PAUSE) / rate));
  };

  const stop = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveFala(-1);
    setActiveWordIdx(-1);
  }, []);

  // ── MODO 1: Áudio único com timestamps por fala ──────────────────────────
  const playComAudioSrc = useCallback(() => {
    if (!section.audioSrc) return;
    cancelledRef.current = false;
    setIsPlaying(true);

    const audio = audioRef.current || new Audio(section.audioSrc);
    audio.playbackRate = speed;
    audioRef.current = audio;
    audio.currentTime = 0;

    const falas = section.falas;

    // Agendar destaque de cada fala pelo timestamp start
    falas.forEach((fala, fi) => {
      if (fala.start == null) return;

      // Destacar a fala no momento certo
      const tFala = setTimeout(() => {
        if (cancelledRef.current) return;
        setActiveFala(fi);
        setActiveWordIdx(-1);

        // Destacar palavras proporcionalmente dentro da fala
        const words = fala.texto.split(/\s+/);
        const durFala = ((fala.end ?? fala.start + 3) - fala.start) / speed * 1000;
        const msPerWord = durFala / words.length;
        words.forEach((_, wi) => {
          const tw = setTimeout(() => {
            if (!cancelledRef.current) setActiveWordIdx(wi);
          }, wi * msPerWord);
          timersRef.current.push(tw);
        });
      }, (fala.start / speed) * 1000);

      timersRef.current.push(tFala);
    });

    audio.onended = () => {
      if (!cancelledRef.current) {
        clearTimers();
        setIsPlaying(false);
        setActiveFala(-1);
        setActiveWordIdx(-1);
      }
    };
    audio.onerror = () => { stop(); };

    audio.play().catch(() => stop());
  }, [section.audioSrc, section.falas, speed, stop]);

  // ── MODO 2: Fala por fala (audioUrl individual ou TTS) ───────────────────
  const playFalaAudio = (fala, fi, onEnded) => {
    const audio = new Audio(fala.audioUrl);
    audio.playbackRate = speed;
    audioRef.current = audio;
    setActiveFala(fi);
    setActiveWordIdx(-1);

    const words = fala.texto.split(/\s+/);
    const durs  = estimateWordDurations(words, speed);
    let elapsed = 80;
    words.forEach((_, wi) => {
      const t = setTimeout(() => { if (!cancelledRef.current) setActiveWordIdx(wi); }, elapsed);
      timersRef.current.push(t);
      elapsed += durs[wi];
    });

    audio.onended = () => { if (!cancelledRef.current) { clearTimers(); setActiveWordIdx(-1); setTimeout(onEnded, 350); } };
    audio.onerror = () => { if (!cancelledRef.current) { clearTimers(); onEnded(); } };
    audio.play().catch(() => { if (!cancelledRef.current) { clearTimers(); onEnded(); } });
  };

  const playFalaTTS = (fala, fi, onEnded) => {
    const words = fala.texto.split(/\s+/);
    const durs  = estimateWordDurations(words, speed);
    setActiveFala(fi);
    setActiveWordIdx(-1);

    let elapsed = 80;
    words.forEach((_, wi) => {
      const t = setTimeout(() => { if (!cancelledRef.current) setActiveWordIdx(wi); }, elapsed);
      timersRef.current.push(t);
      elapsed += durs[wi];
    });

    const utter    = new SpeechSynthesisUtterance(fala.texto);
    utter.lang     = 'en-US';
    utter.rate     = speed;
    utter.pitch    = fala.personagem === section.personagens[0] ? 1.1 : 0.95;
    const voice    = getVoice(fala.personagem);
    if (voice) utter.voice = voice;

    utter.onboundary = (e) => {
      if (e.name === 'word' && !cancelledRef.current) {
        const soFar = fala.texto.slice(0, e.charIndex);
        const wIdx  = soFar.trim() === '' ? 0 : soFar.trim().split(/\s+/).length;
        clearTimers();
        setActiveWordIdx(wIdx);
      }
    };
    utter.onend   = () => { if (!cancelledRef.current) { clearTimers(); setActiveWordIdx(-1); onEnded(); } };
    utter.onerror = () => { if (!cancelledRef.current) { clearTimers(); onEnded(); } };
    window.speechSynthesis.speak(utter);
  };

  const playSequencial = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    clearTimers();
    cancelledRef.current = false;
    setIsPlaying(true);
    let idx = 0;
    const speakNext = () => {
      if (cancelledRef.current || idx >= section.falas.length) {
        setIsPlaying(false); setActiveFala(-1); setActiveWordIdx(-1); return;
      }
      const fala = section.falas[idx];
      const next = () => { idx++; setTimeout(speakNext, 350); };
      if (fala.audioUrl) playFalaAudio(fala, idx, next);
      else playFalaTTS(fala, idx, next);
    };
    speakNext();
  }, [section.falas, section.personagens, speed, getVoice]);

  // ── Decide qual modo usar ─────────────────────────────────────────────────
  const hasAudioSrc    = !!section.audioSrc;
  const hasRealAudio   = section.falas.some(f => f.audioUrl);
  const modoUnicoAudio = hasAudioSrc;

  const handlePlay = () => {
    if (isPlaying) { stop(); return; }
    if (modoUnicoAudio) playComAudioSrc();
    else playSequencial();
  };

  useEffect(() => () => { stop(); }, [stop]);

  const styles = {
    sectionBlock: { marginBottom:'1.5rem' },
    sectionTitle: { display:'flex', alignItems:'center', fontSize:'0.95rem', fontWeight:700,
      marginBottom:'0.875rem', color:'#e2e8f0' },
    audioBar: { display:'flex', flexWrap:'wrap', alignItems:'center', gap:'0.6rem',
      padding:'0.75rem 1rem', background:'rgba(139,92,246,0.08)', borderRadius:12,
      border:'1px solid rgba(139,92,246,0.2)', marginBottom:'0.875rem' },
    playBtn: { display:'flex', alignItems:'center', padding:'0.45rem 1rem', borderRadius:9999,
      background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff',
      border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, transition:'all 0.15s' },
    playBtnActive: { background:'linear-gradient(135deg,#ef4444,#f97316)' },
    speedControl: { display:'flex', alignItems:'center', gap:4 },
    speedBtn: { fontSize:'0.68rem', padding:'0.2rem 0.5rem', borderRadius:6,
      background:'transparent', border:'1px solid rgba(255,255,255,0.12)',
      color:'#94a3b8', cursor:'pointer', transition:'all 0.15s' },
    speedActive: { background:'rgba(139,92,246,0.25)', color:'#a78bfa',
      border:'1px solid rgba(139,92,246,0.4)' },
    voiceInfo: { fontSize:'0.7rem', color:'#94a3b8', marginLeft:'auto' },
    dialogBox: { display:'flex', flexDirection:'column', gap:'0.6rem' },
    bubble: { padding:'0.6rem 0.9rem', borderRadius:12, maxWidth:'82%' },
    bubbleA: { background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.25)',
      alignSelf:'flex-start', borderBottomLeftRadius:4 },
    bubbleB: { background:'rgba(236,72,153,0.12)', border:'1px solid rgba(236,72,153,0.2)',
      alignSelf:'flex-end', borderBottomRightRadius:4 },
    bubbleActive: { boxShadow:'0 0 0 2px rgba(139,92,246,0.5)' },
    bubbleName: { fontSize:'0.68rem', fontWeight:700, color:'#8b5cf6',
      textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:3 },
    bubbleText: { fontSize:'0.88rem', lineHeight:1.55, color:'#e2e8f0' },
    word: { transition:'background 0.1s', borderRadius:3, padding:'0 1px' },
    wordActive: { background:'rgba(139,92,246,0.4)', color:'#fff', fontWeight:700 },
    badge: { fontSize:'0.65rem', padding:'2px 7px', borderRadius:999, marginLeft:4 },
    badgeReal: { background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac' },
    badgeSync: { background:'rgba(139,92,246,0.2)', border:'1px solid rgba(139,92,246,0.4)', color:'#a78bfa' },
  };

  return (
    <div style={styles.sectionBlock}>
      <h3 style={styles.sectionTitle}>
        <MessageCircle size={18} style={{marginRight:6}}/> {section.titulo}
        {modoUnicoAudio && <span style={{...styles.badge,...styles.badgeSync}}>🎵 Áudio Sincronizado</span>}
        {!modoUnicoAudio && hasRealAudio && <span style={{...styles.badge,...styles.badgeReal}}>🎙 Áudio Real</span>}
      </h3>

      <div style={styles.audioBar}>
        <button
          style={{...styles.playBtn, ...(isPlaying ? styles.playBtnActive : {})}}
          onClick={handlePlay}
          disabled={!voicesReady && !hasRealAudio && !modoUnicoAudio}
        >
          {isPlaying ? <Square size={14}/> : <Play size={14}/>}
          <span style={{marginLeft:6}}>{isPlaying ? 'Parar' : 'Ouvir Diálogo'}</span>
        </button>

        <div style={styles.speedControl}>
          <Volume2 size={13} style={{color:'#94a3b8'}}/>
          {[0.75, 0.9, 1, 1.25].map(s => (
            <button key={s}
              style={{...styles.speedBtn, ...(speed === s ? styles.speedActive : {})}}
              onClick={() => { setSpeed(s); if (isPlaying) stop(); }}
            >
              {s === 0.75 ? '0.75×' : s === 0.9 ? '0.9×' : s === 1 ? '1×' : '1.25×'}
            </button>
          ))}
        </div>
        <span style={styles.voiceInfo}>🎙 {section.personagens.join(' · ')}</span>
      </div>

      <div style={styles.dialogBox}>
        {(section.falas || []).map((fala, fi) => {
          const isA   = fala.personagem === section.personagens[0];
          const active = activeFala === fi;
          const words  = fala.texto.split(/\s+/);
          return (
            <div key={fi} style={{...styles.bubble, ...(isA?styles.bubbleA:styles.bubbleB), ...(active?styles.bubbleActive:{})}}>
              <span style={styles.bubbleName}>{fala.personagem}</span>
              <p style={styles.bubbleText}>
                {active
                  ? words.map((w, wi) => (
                      <span key={wi} style={{...styles.word, ...(wi === activeWordIdx ? styles.wordActive : {})}}>
                        {w}{' '}
                      </span>
                    ))
                  : fala.texto
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
