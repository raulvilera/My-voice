import React, { useState } from 'react';
import { Grid3x3 } from 'lucide-react';

// ── Vocabulário ───────────────────────────────────────────────────────────────
export const SecaoVocabulario = ({ section }) => {
  const [revealed, setRevealed] = useState({});
  
  const styles = {
    sectionBlock: { marginBottom:'1.5rem' },
    sectionTitle: { display:'flex', alignItems:'center', fontSize:'0.95rem', fontWeight:700,
      marginBottom:'0.875rem', color:'#e2e8f0' },
    hint: { fontSize:'0.65rem', color:'#94a3b8', marginLeft:'0.5rem', fontStyle:'italic' },
    vocabGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'0.5rem' },
    vocabCard: { padding:'0.5rem 0.75rem', background:'rgba(255,255,255,0.04)',
      border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
      display:'flex', flexDirection:'column', gap:2, cursor:'pointer',
      transition:'all 0.2s', minHeight:'60px', justifyContent:'center' },
    vocabCardRevealed: { background:'rgba(236,72,153,0.12)', border:'1px solid rgba(236,72,153,0.25)' },
    vocabEn: { fontSize:'0.82rem', fontWeight:700, color:'#a78bfa' },
    vocabPt: { fontSize:'0.74rem', color:'#94a3b8' },
  };

  return (
    <div style={styles.sectionBlock}>
      <h3 style={styles.sectionTitle}>
        <Grid3x3 size={18} style={{marginRight:6}}/>
        {section.titulo}
        <span style={styles.hint}>Clique para ver a tradução</span>
      </h3>
      <div style={styles.vocabGrid}>
        {(section.palavras || []).map((p, i) => (
          <div 
            key={i} 
            style={{...styles.vocabCard, ...(revealed[i] ? styles.vocabCardRevealed : {})}}
            onClick={() => setRevealed(prev => ({ ...prev, [i]: !prev[i] }))}
          >
            <span style={styles.vocabEn}>{p.en}</span>
            <span style={styles.vocabPt}>{revealed[i] ? p.pt : '···'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
