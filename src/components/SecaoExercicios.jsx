import React, { useState } from 'react';
import { Check, X, RotateCcw, PenLine } from 'lucide-react';

// ── Exercícios ────────────────────────────────────────────────────────────────
export const SecaoExercicios = ({ section }) => {
  const [respostas, setRespostas]   = useState({});
  const [resultados, setResultados] = useState({});
  const [checked, setChecked]       = useState(false);

  const handleInput = (gi, qi, val) => { 
    setRespostas(prev => ({ ...prev, [`${gi}-${qi}`]: val })); 
    setChecked(false); 
  };
  
  const verificar = () => {
    const res = {};
    (section.grupos || []).forEach((g, gi) => {
      (g.questoes || []).forEach((q, qi) => {
        res[`${gi}-${qi}`] = (respostas[`${gi}-${qi}`] || '').trim().toLowerCase() === q.resposta.toLowerCase();
      });
    });
    setResultados(res); 
    setChecked(true); 
  };
  
  const resetar = () => { 
    setRespostas({}); 
    setResultados({}); 
    setChecked(false); 
  };
  
  const total   = (section.grupos || []).reduce((acc, g) => acc + (g.questoes || []).length, 0);
  const acertos = checked ? Object.values(resultados).filter(Boolean).length : 0;

  const styles = {
    sectionBlock: { marginBottom:'1.5rem' },
    sectionTitle: { display:'flex', alignItems:'center', fontSize:'0.95rem', fontWeight:700,
      marginBottom:'0.875rem', color:'#e2e8f0' },
    exercGrupo: { marginBottom:'1rem' },
    exercInstrucao: { fontSize:'0.82rem', color:'#06b6d4', fontWeight:600, marginBottom:'0.5rem' },
    exercItem: { display:'flex', alignItems:'center', flexWrap:'wrap', gap:6, padding:'0.45rem 0.6rem',
      borderRadius:8, marginBottom:4, background:'rgba(255,255,255,0.03)',
      border:'1px solid rgba(255,255,255,0.06)', fontSize:'0.84rem' },
    exercCerto: { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)' },
    exercErrado: { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)' },
    exercNum: { fontSize:'0.72rem', color:'#94a3b8', minWidth:18, fontWeight:600 },
    exercLabel: { display:'flex', flexWrap:'wrap', alignItems:'center', gap:4, flex:1, fontSize:'0.84rem' },
    exercInput: { width:72, padding:'0.2rem 0.4rem', borderRadius:6, fontSize:'0.82rem',
      background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)',
      color:'#e2e8f0', outline:'none', textAlign:'center' },
    gabarito: { fontSize:'0.72rem', color:'#10b981', fontStyle:'italic', marginLeft:4 },
    scoreBox: { margin:'0.75rem 0', padding:'0.75rem 1.25rem', borderRadius:12, textAlign:'center',
      fontWeight:700, fontSize:'0.9rem', background:'rgba(6,182,212,0.12)',
      border:'1px solid rgba(6,182,212,0.25)', color:'#06b6d4' },
    scorePerfect: { background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981' },
    exercBtns: { display:'flex', gap:'0.75rem', marginTop:'0.75rem', flexWrap:'wrap' },
    checkBtn: { display:'flex', alignItems:'center', padding:'0.55rem 1.25rem', borderRadius:9999,
      background:'linear-gradient(135deg,#8b5cf6,#ec4899)', color:'#fff', border:'none',
      cursor:'pointer', fontSize:'0.82rem', fontWeight:600 },
    resetBtn: { display:'flex', alignItems:'center', padding:'0.55rem 1.25rem', borderRadius:9999,
      background:'transparent', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.12)',
      cursor:'pointer', fontSize:'0.82rem', fontWeight:600 },
  };

  return (
    <div style={styles.sectionBlock}>
      <h3 style={styles.sectionTitle}><PenLine size={18} style={{marginRight:6}}/> {section.titulo}</h3>
      {(section.grupos || []).map((grupo, gi) => (
        <div key={gi} style={styles.exercGrupo}>
          <p style={styles.exercInstrucao}>{grupo.instrucao}</p>
          <div>
            {(grupo.questoes || []).map((q, qi) => {
              const chave  = `${gi}-${qi}`;
              const status = checked ? (resultados[chave] ? 'certo' : 'errado') : '';
              return (
                <div 
                  key={qi} 
                  style={{
                    ...styles.exercItem, 
                    ...(status==='certo'?styles.exercCerto:status==='errado'?styles.exercErrado:{})
                  }}
                >
                  <span style={styles.exercNum}>{qi+1}.</span>
                  <label style={styles.exercLabel}>
                    {q.pergunta.split('___').map((part, pi, arr) => (
                      <React.Fragment key={pi}>
                        {part}
                        {pi < arr.length-1 && (
                          <input 
                            type="text" 
                            style={styles.exercInput}
                            value={respostas[chave]||''} 
                            onChange={e => handleInput(gi, qi, e.target.value)} 
                            placeholder="?"
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </label>
                  {checked && (
                    <span style={{marginLeft:8}}>
                      {resultados[chave] ? <Check size={15} color="#10b981"/> : <X size={15} color="#ef4444"/>}
                    </span>
                  )}
                  {checked && !resultados[chave] && <span style={styles.gabarito}>✓ {q.resposta}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {checked && (
        <div style={{...styles.scoreBox, ...(acertos===total?styles.scorePerfect:{})}}>
          {acertos===total?'🎉':acertos>=total/2?'👍':'💪'} {acertos}/{total} corretas{acertos===total&&' — Perfeito!'}
        </div>
      )}
      <div style={styles.exercBtns}>
        <button style={styles.checkBtn} onClick={verificar}><Check size={16}/><span style={{marginLeft:6}}>Verificar Respostas</span></button>
        <button style={styles.resetBtn} onClick={resetar}><RotateCcw size={16}/><span style={{marginLeft:6}}>Reiniciar</span></button>
      </div>
    </div>
  );
};
