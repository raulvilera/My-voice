import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Play, Square, Volume2 } from 'lucide-react';

// ── Diálogo com Áudio + Destaque Sincronizado ─────────────────────────────────
export const SecaoDialogo = ({ section: rawSection }) => {
  // Normaliza dados — suporta estrutura hardcoded e dados vindos do Supabase
  const section = {
    ...rawSection,
    personagens: rawSection?.personagens ?? rawSection?.conteudo?.personagens ?? [],
    falas:       rawSection?.falas       ?? rawSection?.conteudo?.falas       ?? [],
    titulo:      rawSection?.titulo      ?? '',
  };

  const [isPlaying, setIsPlaying]         = useState(false);
  const [activeFala, setActiveFala]       = useState(-1);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [speed, setSpeed]                 = useState(0.9);
  const [voicesReady, setVoicesReady]     = useState(false);
  const cancelledRef  = useRef(false);
  const timersRef     = useRef([]);

  // Carrega vozes
  useEffect(() => {
    const load = () => { if (window.speechSynthesis.getVoices().length > 0) setVoicesReady(true); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Limpa todos os timers ativos
  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  // Escolhe voz por personagem
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

  // Estima duração de cada palavra em ms baseado nos caracteres e velocidade
  const estimateWordDurations = (words, rate) => {
    const BASE_CHAR_MS = 68;
    const BASE_PAUSE   = 55;
    return words.map(w => {
      const chars = w.replace(/[^a-zA-Z]/g, '').length || 1;
      return Math.round((chars * BASE_CHAR_MS + BASE_PAUSE) / rate);
    });
  };

  const stop = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setActiveFala(-1);
    setActiveWordIdx(-1);
  }, []);

  const playAll = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    clearTimers();
    cancelledRef.current = false;
    setIsPlaying(true);

    let idx = 0;

    const speakNext = () => {
      if (cancelledRef.current || idx >= section.falas.length) {
        setIsPlaying(false);
        setActiveFala(-1);
        setActiveWordIdx(-1);
        return;
      }

      const fala  = section.falas[idx];
      const words = fala.texto.split(/\s+/);
      const durs  = estimateWordDurations(words, speed);

      setActiveFala(idx);
      setActiveWordIdx(-1);

      let elapsed = 80;
      words.forEach((_, wi) => {
        const t = setTimeout(() => {
          if (!cancelledRef.current) setActiveWordIdx(wi);
        }, elapsed);
        timersRef.current.push(t);
        elapsed += durs[wi];
      });

      const clearT = setTimeout(() => {
        if (!cancelledRef.current) setActiveWordIdx(-1);
      }, elapsed);
      timersRef.current.push(clearT);

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

      utter.onend = () => {
        if (!cancelledRef.current) {
          clearTimers();
          setActiveWordIdx(-1);
          idx++;
          setTimeout(speakNext, 350);
        }
      };

      utter.onerror = () => {
        if (!cancelledRef.current) {
          clearTimers();
          idx++;
          speakNext();
        }
      };

      window.speechSynthesis.speak(utter);
    };

    speakNext();
  }, [section.falas, section.personagens, speed, getVoice]);

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
  };

  return (
    <div style={styles.sectionBlock}>
      <h3 style={styles.sectionTitle}><MessageCircle size={18} style={{marginRight:6}}/> {section.titulo}</h3>

      <div style={styles.audioBar}>
        <button
          style={{...styles.playBtn, ...(isPlaying ? styles.playBtnActive : {})}}
          onClick={isPlaying ? stop : playAll}
          disabled={!voicesReady}
        >
          {isPlaying ? <Square size={14}/> : <Play size={14}/>}
          <span style={{marginLeft:6}}>{isPlaying ? 'Parar' : voicesReady ? 'Ouvir Diálogo' : 'Carregando…'}</span>
        </button>

        <div style={styles.speedControl}>
          <Volume2 size={13} style={{color:'#94a3b8'}}/>
          {[0.75, 0.9, 1, 1.25].map(s => (
            <button
              key={s}
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
                      <span key={wi} style={{...styles.word, ...(wi === activeWordIdx ? styles.wordActive : '')}}>
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
