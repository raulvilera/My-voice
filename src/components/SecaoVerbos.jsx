import React from 'react';
import { BookMarked } from 'lucide-react';

// ── Verbos ────────────────────────────────────────────────────────────────────
export const SecaoVerbos = ({ section }) => {
  const styles = {
    sectionBlock: { marginBottom:'1.5rem' },
    sectionTitle: { display:'flex', alignItems:'center', fontSize:'0.95rem', fontWeight:700,
      marginBottom:'0.875rem', color:'#e2e8f0' },
    tableWrapper: { overflowX:'auto' },
    verbTable: { width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' },
    verbTh: { textAlign:'left', padding:'0.5rem 0.75rem', background:'rgba(139,92,246,0.15)',
      color:'#a78bfa', fontWeight:700, fontSize:'0.72rem', textTransform:'uppercase',
      letterSpacing:'0.05em', borderBottom:'1px solid rgba(255,255,255,0.1)' },
    verbTd: { padding:'0.5rem 0.75rem', color:'#e2e8f0', borderBottom:'1px solid rgba(255,255,255,0.05)' },
    verbName: { fontWeight:600, color:'#8b5cf6' },
    verbForm: { display:'inline-block' },
    verbRowEven: { background:'rgba(255,255,255,0.02)' },
  };

  return (
    <div style={styles.sectionBlock}>
      <h3 style={styles.sectionTitle}><BookMarked size={18} style={{marginRight:6}}/> {section.titulo}</h3>
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
                <td style={{...styles.verbTd, ...styles.verbName}}>{v.verbo}</td>
                <td style={styles.verbTd}><span style={styles.verbForm}>{v.presente}</span></td>
                <td style={styles.verbTd}><span style={styles.verbForm}>{v.passado}</span></td>
                <td style={styles.verbTd}><span style={styles.verbForm}>{v.participio}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
