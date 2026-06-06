import React, { useState, useRef, useEffect } from 'react';
import { BookMarked, Play, Square, Volume2 } from 'lucide-react';

// ── Verbos com player MP3 real (se audioSrc) ──────────────────────────────────
export const SecaoVerbos = ({ section: rawSection }) => {
  const section = {
    ...rawSection,
    titulo:  rawSection?.titulo  || rawSection?.conteudo?.titulo  || '',
    verbos:  rawSection?.verbos  || rawSection?.conteudo?.verbos  || [],
    audioSrc: rawSection?.audioSrc || rawSection?.conteudo?.audioSrc || null,
  };
  const hasMp3 = Boolean(section?.audioSrc);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [speed, setSpeed]             = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause(); audio.currentTime = 0;
      setIsPlaying(false); setCurrentTime(0);
    } else {
      audio.playbackRate = speed;
      audio.play();
      setIsPlaying(true);
      audio.ontimeupdate   = () => setCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.onended        = () => { setIsPlaying(false); setCurrentTime(0); };
    }
  };

  const seek = (val) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (val / 100) * duration;
    setCurrentTime(audio.currentTime);
  };

  const fmt = (t) => `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  const pct = duration ? (currentTime / duration) * 100 : 0;

  const styles = {
    sectionBlock: { marginBottom:'1.5rem' },
    sectionTitle: { display:'flex', alignItems:'center', fontSize:'0.95rem', fontWeight:700, marginBottom:'0.875rem', color:'#e2e8f0' },
    audioBar: { display:'flex', flexWrap:'wrap', alignItems:'center', gap:'0.6rem', padding:'0.75rem 1rem', background:'rgba(139,92,246,0.08)', borderRadius:12, border:'1px solid rgba(139,92,246,0.2)', marginBottom:'0.875rem' },
    playBtn: { display:'flex', alignItems:'center', padding:'0.45rem 1rem', borderRadius:9999, background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600 },
    playBtnActive: { background:'linear-gradient(135deg,#ef4444,#f97316)' },
    progressBar: { flex:1, minWidth:'80px', height:'4px', borderRadius:2, cursor:'pointer', accentColor:'#8b5cf6', background:'rgba(255,255,255,0.1)' },
    timeLabel: { fontSize:'0.7rem', color:'#94a3b8', whiteSpace:'nowrap' },
    speedBtn: { fontSize:'0.68rem', padding:'0.2rem 0.5rem', borderRadius:6, background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'#94a3b8', cursor:'pointer' },
    speedActive: { background:'rgba(139,92,246,0.25)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.4)' },
    voiceInfo: { fontSize:'0.7rem', color:'#94a3b8', marginLeft:'auto' },
    tableWrapper: { overflowX:'auto' },
    verbTable: { width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' },
    verbTh: { textAlign:'left', padding:'0.5rem 0.75rem', background:'rgba(139,92,246,0.15)', color:'#a78bfa', fontWeight:700, fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid rgba(255,255,255,0.1)' },
    verbTd: { padding:'0.5rem 0.75rem', color:'#e2e8f0', borderBottom:'1px solid rgba(255,255,255,0.05)' },
    verbName: { fontWeight:600, color:'#8b5cf6' },
    verbRowEven: { background:'rgba(255,255,255,0.02)' },
  };

  return (
    <div style={styles.sectionBlock}>
      <h3 style={styles.sectionTitle}><BookMarked size={18} style={{marginRight:6}}/> {section.titulo}</h3>

      {hasMp3 && (
        <div style={styles.audioBar}>
          <audio ref={audioRef} src={section.audioSrc} preload="none"/>
          <button style={{...styles.playBtn, ...(isPlaying?styles.playBtnActive:{})}} onClick={toggle}>
            {isPlaying ? <Square size={14}/> : <Play size={14}/>}
            <span style={{marginLeft:6}}>{isPlaying ? 'Parar' : 'Ouvir Verbos'}</span>
          </button>
          <input type="range" style={styles.progressBar} value={pct} min={0} max={100} step={0.1} onChange={e=>seek(parseFloat(e.target.value))}/>
          <span style={styles.timeLabel}>{fmt(currentTime)}{duration?` / ${fmt(duration)}`:''}</span>
          <Volume2 size={13} style={{color:'#94a3b8'}}/>
          {[0.75,0.9,1,1.25].map(s=>(
            <button key={s} style={{...styles.speedBtn,...(speed===s?styles.speedActive:{})}} onClick={()=>setSpeed(s)}>
              {s===0.75?'0.75×':s===0.9?'0.9×':s===1?'1×':'1.25×'}
            </button>
          ))}
          <span style={styles.voiceInfo}>🎙 Áudio original</span>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.verbTable}>
          <thead>
            <tr>
              <th style={styles.verbTh}>Verbo</th>
              <th style={styles.verbTh}>Presente</th>
              <th style={styles.verbTh}>Passado</th>
              <th style={styles.verbTh}>Particípio</th>
            </tr>
          </thead>
          <tbody>
            {(section.verbos || []).map((v, i) => (
              <tr key={i} style={i%2===0?styles.verbRowEven:{}}>
                <td style={{...styles.verbTd,...styles.verbName}}>{v.verbo}</td>
                <td style={styles.verbTd}>{v.presente}</td>
                <td style={styles.verbTd}>{v.passado}</td>
                <td style={styles.verbTd}>{v.participio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
