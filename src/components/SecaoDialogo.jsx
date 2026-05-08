import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, RotateCcw, MessageCircle, BookMarked, Grid3x3, PenLine, Play, Square, Volume2 } from 'lucide-react';
import styles from '../pages/Trilha.module.css';

// ── Diálogo com Áudio + Destaque Sincronizado ─────────────────────────────────
export const SecaoDialogo = ({ section }) => {
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
    // Média: ~120ms por caractere a velocidade 1x, ajustado pelo rate
    // Palavras curtas têm um mínimo de pausa
    const BASE_CHAR_MS = 68;
    const BASE_PAUSE   = 55; // pausa entre palavras
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

      // Agenda o destaque de cada palavra via setTimeout
      let elapsed = 80; // pequeno delay inicial para sincronia
      words.forEach((_, wi) => {
        const t = setTimeout(() => {
          if (!cancelledRef.current) setActiveWordIdx(wi);
        }, elapsed);
        timersRef.current.push(t);
        elapsed += durs[wi];
      });

      // Limpa destaque ao fim da fala
      const clearT = setTimeout(() => {
        if (!cancelledRef.current) setActiveWordIdx(-1);
      }, elapsed);
      timersRef.current.push(clearT);

      // SpeechSynthesis
      const utter    = new SpeechSynthesisUtterance(fala.texto);
      utter.lang     = 'en-US';
      utter.rate     = speed;
      utter.pitch    = fala.personagem === section.personagens[0] ? 1.1 : 0.95;
      const voice    = getVoice(fala.personagem);
      if (voice) utter.voice = voice;

      // Usa onboundary quando disponível (desktop Chrome/Edge) para recalibrar
      utter.onboundary = (e) => {
        if (e.name === 'word' && !cancelledRef.current) {
          const soFar = fala.texto.slice(0, e.charIndex);
          const wIdx  = soFar.trim() === '' ? 0 : soFar.trim().split(/\s+/).length;
          // Recalibra: cancela timers futuros e usa posição real
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

  // Para ao desmontar
  useEffect(() => () => { stop(); }, [stop]);

  return (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}><MessageCircle size={20}/> {section.titulo}</h3>

      <div className={styles.audioBar}>
        <button
          className={`${styles.playBtn} ${isPlaying ? styles.playBtnActive : ''}`}
          onClick={isPlaying ? stop : playAll}
          disabled={!voicesReady}
        >
          {isPlaying ? <Square size={16}/> : <Play size={16}/>}
          {isPlaying ? 'Parar' : voicesReady ? 'Ouvir Diálogo' : 'Carregando…'}
        </button>

        <div className={styles.speedControl}>
          <Volume2 size={14}/>
          {[0.75, 0.9, 1, 1.25].map(s => (
            <button
              key={s}
              className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ''}`}
              onClick={() => { setSpeed(s); if (isPlaying) stop(); }}
            >
              {s === 0.75 ? '0.75×' : s === 0.9 ? '0.9×' : s === 1 ? '1×' : '1.25×'}
            </button>
          ))}
        </div>
        <span className={styles.voiceInfo}>🎙 {section.personagens.join(' · ')}</span>
      </div>

      <div className={styles.dialogBox}>
        {section.falas.map((fala, fi) => {
          const isA   = fala.personagem === section.personagens[0];
          const active = activeFala === fi;
          const words  = fala.texto.split(/\s+/);
          return (
            <div key={fi} className={`${styles.bubble} ${isA ? styles.bubbleA : styles.bubbleB} ${active ? styles.bubbleActive : ''}`}>
              <span className={styles.bubbleName}>{fala.personagem}</span>
              <p className={styles.bubbleText}>
                {active
                  ? words.map((w, wi) => (
                      <span key={wi} className={`${styles.word} ${wi === activeWordIdx ? styles.wordActive : ''}`}>
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




