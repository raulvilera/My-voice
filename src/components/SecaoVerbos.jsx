import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookMarked, Play, Square, Volume2, Mic } from 'lucide-react';

export const SecaoVerbos = ({ section }) => {
  const hasMp3  = Boolean(section?.audioSrc);
  const hasTTS  = !hasMp3 && Boolean(section?.useTTS);
  const hasSync = (section?.verbos || []).some(v => v.start != null);

  // ── estado MP3 ──────────────────────────────────────────────────────────────
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [speed,       setSpeed]       = useState(1);
  const [erro,        setErro]        = useState(false);
  const [activeVerbo, setActiveVerbo] = useState(-1);
  const audioRef = useRef(null);

  // ── estado TTS ───────────────────────────────────────────────────────────────
  const [ttsPlaying,  setTtsPlaying]  = useState(false);
  const [ttsIdx,      setTtsIdx]      = useState(-1);   // verbo atual
  const [ttsField,    setTtsField]    = useState('');   // presente/passado/participio
  const [ttsSupport,  setTtsSupport]  = useState(true);
  const ttsQueueRef  = useRef([]);
  const ttsCancelRef = useRef(false);
  const rowRefs      = useRef([]);

  // Rola a tela para acompanhar o verbo em destaque (áudio MP3 ou TTS)
  useEffect(() => {
    const idx = hasSync ? activeVerbo : (hasTTS && ttsPlaying ? ttsIdx : -1);
    if (idx < 0) return;
    const el = rowRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }, [activeVerbo, ttsIdx, hasSync, hasTTS, ttsPlaying]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.speechSynthesis) setTtsSupport(false);
  }, []);

  // Sincroniza linha ativa (MP3)
  useEffect(() => {
    if (!hasSync) return;
    const idx = (section.verbos || []).findIndex(
      v => v.start != null && currentTime >= v.start && currentTime < v.end
    );
    setActiveVerbo(idx);
  }, [currentTime, hasSync, section.verbos]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => () => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
  }, []);

  // ── MP3 toggle ───────────────────────────────────────────────────────────────
  const toggleMp3 = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause(); audio.currentTime = 0;
      setIsPlaying(false); setCurrentTime(0); setActiveVerbo(-1);
    } else {
      setErro(false);
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.ontimeupdate     = () => setCurrentTime(audio.currentTime);
      audio.onended  = () => { setIsPlaying(false); setCurrentTime(0); setActiveVerbo(-1); };
      audio.onerror  = () => { setIsPlaying(false); setCurrentTime(0); setActiveVerbo(-1); setErro(true); };
      audio.playbackRate = speed;
      audio.load();
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => { setIsPlaying(false); setErro(true); });
    }
  };

  const seek = (val) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (val / 100) * duration;
    setCurrentTime(audio.currentTime);
  };

  // ── TTS helpers ──────────────────────────────────────────────────────────────
  // Escolhe melhor voz en-US disponível
  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en')) ||
      null
    );
  };

  // Fala um texto e retorna Promise que resolve ao fim
  const speak = (text, rate = 0.85) =>
    new Promise(resolve => {
      if (ttsCancelRef.current) { resolve(); return; }
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang  = 'en-US';
      utt.rate  = rate;
      const v   = pickVoice();
      if (v) utt.voice = v;
      utt.onend = resolve;
      utt.onerror = resolve;
      window.speechSynthesis.speak(utt);
    });

  // Pausa entre falas
  const pause = (ms) =>
    new Promise(resolve => {
      if (ttsCancelRef.current) { resolve(); return; }
      setTimeout(resolve, ms);
    });

  // Toca todos os verbos em sequência: nome → presente → passado → particípio
  const playAllTTS = useCallback(async () => {
    if (!window.speechSynthesis) return;
    ttsCancelRef.current = false;
    setTtsPlaying(true);

    const verbos = section.verbos || [];
    for (let i = 0; i < verbos.length; i++) {
      if (ttsCancelRef.current) break;
      const v = verbos[i];

      // Extrai só a parte inglesa do verbo: "TO HEAR (ouvir/saber)" → "to hear"
      const nomeEN = v.verbo.replace(/\(.*?\)/g, '').trim().toLowerCase();

      setTtsIdx(i); setTtsField('verbo');
      await speak(nomeEN, 0.8);
      if (ttsCancelRef.current) break;
      await pause(300);

      setTtsField('presente');
      await speak(v.presente, 0.85);
      if (ttsCancelRef.current) break;
      await pause(300);

      setTtsField('passado');
      await speak(v.passado, 0.85);
      if (ttsCancelRef.current) break;
      await pause(300);

      setTtsField('participio');
      await speak(v.participio, 0.85);
      if (ttsCancelRef.current) break;
      await pause(700);
    }

    setTtsPlaying(false);
    setTtsIdx(-1);
    setTtsField('');
  }, [section.verbos]);

  const stopTTS = () => {
    ttsCancelRef.current = true;
    window.speechSynthesis.cancel();
    setTtsPlaying(false);
    setTtsIdx(-1);
    setTtsField('');
  };

  // Toca apenas uma célula ao clicar
  const speakCell = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.replace(/\(.*?\)/g, '').trim());
    utt.lang = 'en-US'; utt.rate = 0.85;
    const v = pickVoice(); if (v) utt.voice = v;
    window.speechSynthesis.speak(utt);
  };

  // ── estilos ──────────────────────────────────────────────────────────────────
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const pct = duration ? (currentTime / duration) * 100 : 0;

  const s = {
    block:      { marginBottom: '1.5rem' },
    title:      { display: 'flex', alignItems: 'center', fontSize: '0.95rem', fontWeight: 700,
                  marginBottom: '0.875rem', color: '#e2e8f0' },
    audioBar:   { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem',
                  padding: '0.75rem 1rem', background: 'rgba(139,92,246,0.08)', borderRadius: 12,
                  border: '1px solid rgba(139,92,246,0.2)', marginBottom: '0.875rem' },
    playBtn:    { display: 'flex', alignItems: 'center', padding: '0.45rem 1rem', borderRadius: 9999,
                  background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
    playBtnOn:  { background: 'linear-gradient(135deg,#ef4444,#f97316)' },
    progress:   { flex: 1, minWidth: '80px', height: '4px', borderRadius: 2, cursor: 'pointer',
                  accentColor: '#8b5cf6', background: 'rgba(255,255,255,0.1)' },
    timeLabel:  { fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' },
    speedBtn:   { fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: 6,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#94a3b8', cursor: 'pointer' },
    speedOn:    { background: 'rgba(139,92,246,0.25)', color: '#a78bfa',
                  border: '1px solid rgba(139,92,246,0.4)' },
    voiceInfo:  { fontSize: '0.7rem', color: '#94a3b8', marginLeft: 'auto' },
    erroMsg:    { fontSize: '0.72rem', color: '#f87171', width: '100%', marginTop: '0.25rem' },
    tableWrap:  { overflowX: 'auto' },
    table:      { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
    th:         { textAlign: 'left', padding: '0.5rem 0.75rem',
                  background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontWeight: 700,
                  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid rgba(255,255,255,0.1)' },
    td:         { padding: '0.5rem 0.75rem', color: '#e2e8f0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s',
                  cursor: 'pointer' },
    tdVerbo:    { fontWeight: 600, color: '#8b5cf6' },
    rowEven:    { background: 'rgba(255,255,255,0.02)' },
    rowActive:  { background: 'rgba(139,92,246,0.18)',
                  boxShadow: 'inset 3px 0 0 #8b5cf6', transition: 'background 0.15s' },
    tdActive:   { color: '#fff' },
    tdVerboAct: { color: '#c4b5fd', fontWeight: 700 },
    cellHL:     { background: 'rgba(236,72,153,0.25)', borderRadius: 4 },
    ttsHint:    { fontSize: '0.68rem', color: '#64748b', marginTop: '0.4rem' },
  };

  return (
    <div style={s.block}>
      <h3 style={s.title}><BookMarked size={18} style={{ marginRight: 6 }}/> {section.titulo}</h3>

      {/* ── barra MP3 ── */}
      {hasMp3 && (
        <div style={s.audioBar}>
          <audio ref={audioRef} src={section.audioSrc} preload="none"/>
          <button style={{ ...s.playBtn, ...(isPlaying ? s.playBtnOn : {}) }} onClick={toggleMp3}>
            {isPlaying ? <Square size={14}/> : <Play size={14}/>}
            <span style={{ marginLeft: 6 }}>{isPlaying ? 'Parar' : 'Ouvir Verbos'}</span>
          </button>
          <input type="range" style={s.progress} value={pct} min={0} max={100} step={0.1}
            onChange={e => seek(parseFloat(e.target.value))}/>
          <span style={s.timeLabel}>{fmt(currentTime)}{duration ? ` / ${fmt(duration)}` : ''}</span>
          <Volume2 size={13} style={{ color: '#94a3b8' }}/>
          {[0.75, 0.9, 1, 1.25].map(sp => (
            <button key={sp}
              style={{ ...s.speedBtn, ...(speed === sp ? s.speedOn : {}) }}
              onClick={() => setSpeed(sp)}>
              {sp === 0.75 ? '0.75×' : sp === 0.9 ? '0.9×' : sp === 1 ? '1×' : '1.25×'}
            </button>
          ))}
          <span style={s.voiceInfo}>🎙 Áudio original</span>
          {erro && <span style={s.erroMsg}>⚠️ Arquivo não encontrado. Verifique o bucket Supabase.</span>}
        </div>
      )}

      {/* ── barra TTS (Aula 5 e demais sem MP3) ── */}
      {hasTTS && (
        <div style={s.audioBar}>
          <button
            style={{ ...s.playBtn, ...(ttsPlaying ? s.playBtnOn : {}) }}
            onClick={ttsPlaying ? stopTTS : playAllTTS}
            disabled={!ttsSupport}
          >
            {ttsPlaying ? <Square size={14}/> : <Mic size={14}/>}
            <span style={{ marginLeft: 6 }}>{ttsPlaying ? 'Parar' : 'Ouvir Verbos'}</span>
          </button>
          <span style={s.voiceInfo}>🔊 Pronúncia em inglês</span>
          {!ttsSupport && (
            <span style={s.erroMsg}>⚠️ Seu navegador não suporta síntese de voz.</span>
          )}
          {ttsPlaying && (
            <span style={{ fontSize: '0.7rem', color: '#a78bfa' }}>
              ▶ pronunciando verbo {ttsIdx + 1}/{(section.verbos || []).length}…
            </span>
          )}
        </div>
      )}

      {hasTTS && (
        <p style={s.ttsHint}>💡 Toque em qualquer célula para ouvir a palavra individualmente.</p>
      )}

      {/* ── tabela ── */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Verbo</th>
              <th style={s.th}>Presente</th>
              <th style={s.th}>Passado</th>
              <th style={s.th}>Particípio</th>
            </tr>
          </thead>
          <tbody>
            {(section.verbos || []).map((v, i) => {
              // highlight MP3
              const activeMP3 = hasSync && activeVerbo === i;
              // highlight TTS
              const activeTTS = hasTTS && ttsPlaying && ttsIdx === i;
              const active    = activeMP3 || activeTTS;

              const rowStyle = active ? s.rowActive : (i % 2 === 0 ? s.rowEven : {});
              const tdStyle  = active ? { ...s.td, ...s.tdActive } : s.td;
              const tdV      = active ? { ...s.td, ...s.tdVerboAct } : { ...s.td, ...s.tdVerbo };

              // destaque de campo específico durante TTS
              const hl = (field) =>
                activeTTS && ttsField === field ? { ...tdStyle, ...s.cellHL } : tdStyle;

              return (
                <tr key={i} ref={el => { rowRefs.current[i] = el; }} style={rowStyle}>
                  <td style={active ? { ...tdV, ...(activeTTS && ttsField === 'verbo' ? s.cellHL : {}) } : tdV}
                      onClick={() => hasTTS && speakCell(v.verbo)}>
                    {v.verbo}
                  </td>
                  <td style={hl('presente')} onClick={() => hasTTS && speakCell(v.presente)}>
                    {v.presente}
                  </td>
                  <td style={hl('passado')} onClick={() => hasTTS && speakCell(v.passado)}>
                    {v.passado}
                  </td>
                  <td style={hl('participio')} onClick={() => hasTTS && speakCell(v.participio)}>
                    {v.participio}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
