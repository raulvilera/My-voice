import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, RotateCcw, MessageCircle, BookMarked, Grid3x3, PenLine, Play, Square, Volume2, Mic, LogOut, ChevronRight, Lock } from 'lucide-react';
import { SecaoDialogo }     from '../components/SecaoDialogo';
import { SecaoVerbos }      from '../components/SecaoVerbos';
import { SecaoVocabulario } from '../components/SecaoVocabulario';
import { SecaoExercicios }  from '../components/SecaoExercicios';

// ── Bandeira dos EUA SVG inline ───────────────────────────────────────────────
const BandeiraEUA = ({ size = 36 }) => (
  <svg width={size} height={size * 0.526} viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 3, display: 'block' }}>
    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
      <rect key={i} x="0" y={i * 400/13} width="760" height={400/13}
        fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'} />
    ))}
    <rect x="0" y="0" width="303" height={400 * 7/13} fill="#3C3B6E" />
    {Array.from({ length: 50 }).map((_, idx) => {
      const row = Math.floor(idx / 6) % 2 === 0 ? Math.floor(idx / 6) : Math.floor(idx / 5);
      const col = idx % (Math.floor(idx / 6) % 2 === 0 ? 6 : 5);
      const isOddRow = Math.floor(idx / 6) % 2 !== 0;
      const cx = isOddRow ? 30 + col * 50 + 25 : 30 + col * 50;
      const cy = Math.floor(idx / (isOddRow ? 5 : 6)) * 26 + (isOddRow ? 13 : 0) + 16;
      return <polygon key={idx} points="0,-9 2.6,-4 9,-4 4,0 6,6 0,3 -6,6 -4,0 -9,-4 -2.6,-4"
        transform={`translate(${cx},${cy})`} fill="white" />;
    })}
  </svg>
);

import { myVoiceData } from '../data/myvoiceData';

// ── Pílulas de seção ──────────────────────────────────────────────────────────
const PILL_LABELS = {
  dialogo:     { emoji: '💬', label: 'Diálogo'    },
  verbos:      { emoji: '📘', label: 'Verbos'      },
  vocabulario: { emoji: '📖', label: 'Vocab'       },
  exercicios:  { emoji: '✏️', label: 'Exercícios' },
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const SecaoModal = ({ aula, secType, onClose }) => {
  if (!aula || !secType) return null;
  
  // ✅ CORREÇÃO: Suporta tanto dados hardcoded (sections) quanto dados do Supabase (secoes)
  const sections = aula.sections || aula.secoes || [];
  
  // Adapta o tipo: 'type' (hardcoded) ou 'tipo' (Supabase)
  const sec = sections.find(s => (s.type || s.tipo) === secType);
  if (!sec) return null;
  
  // Prepara os dados para os componentes
  // Se vem do Supabase, o conteúdo está em sec.conteudo; se hardcoded, está achatado
  const sectionData = sec.conteudo ? { ...sec.conteudo, titulo: sec.titulo } : sec;
  
  // Para diálogo: mostra TODAS as seções
  const sectionsToShow = secType === 'dialogo' ? sections : [sec];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <span style={styles.aulaTagSmall}>Aula {aula.numero}</span>
            <h2 style={{fontSize:'1.15rem',fontWeight:800,marginTop:4}}>{aula.titulo}</h2>
            <p style={{color:'#94a3b8',fontSize:'0.82rem',marginTop:2}}>
              {secType==='dialogo'?'💬 Diálogo completo':secType==='verbos'?'📘 Verbos':secType==='vocabulario'?'📖 Vocabulário':'✏️ Exercícios'}
            </p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={22}/></button>
        </div>
        <div style={styles.modalBody}>
          {sectionsToShow.map((s, idx) => {
            // Adapta tipo: 'type' (hardcoded) ou 'tipo' (Supabase)
            const sectionType = s.type || s.tipo;
            const sectionContent = s.conteudo ? { ...s.conteudo, titulo: s.titulo } : s;
            
            switch (sectionType) {
              case 'dialogo':     return <SecaoDialogo     key={idx} section={sectionContent}/>;
              case 'verbos':      return <SecaoVerbos      key={idx} section={sectionContent}/>;
              case 'vocabulario': return <SecaoVocabulario key={idx} section={sectionContent}/>;
              case 'exercicios':  return <SecaoExercicios  key={idx} section={sectionContent} aulaId={aula.id}/>;
              default: return null;
            }
          })}
        </div>
        <div style={styles.motivaFrase}>"Você não precisa acertar tudo. Você só precisa continuar." ✨</div>
      </div>
    </div>
  );
};

// ── Trilha (Main Page) ────────────────────────────────────────────────────────
import { supabase } from '../lib/supabaseClient';

export default function Trilha({ modoVisualizacao = false }) {
  const [modal, setModal] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const curso = myVoiceData.basico;

  useEffect(() => {
    const fetchAulas = async () => {
      try {
        const { data, error } = await supabase
          .from('aulas')
          .select('*, secoes(*)')
          .eq('publicada', true)
          .order('numero', { ascending: true });

        if (error) console.error("Erro Supabase:", error);

        const aulasDB = data || [];
        const aulasHardcoded = (myVoiceData?.basico?.aulas || []).map(a => ({
          ...a,
          id: a.id,
          publicada: true,
          secoes: a.sections?.map((s, i) => ({
            tipo: s.type,
            titulo: s.titulo,
            conteudo: s,
            ordem: i
          })) || []
        }));

        setAulas([...aulasHardcoded, ...aulasDB].sort((a, b) => a.numero - b.numero));
      } catch (err) {
        console.error("Erro ao carregar trilha:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAulas();
  }, []);

  const openSec = (aula, secType, e) => {
    e.stopPropagation();
    setModal({ aula, secType });
  };

  return (
    <div style={styles.trilhaContainer}>
      <nav style={styles.navbar}>
        <div style={styles.logoInfo}>
          <div style={styles.logoMicWrapper}>
            <div style={styles.logoBandeira}>
              <BandeiraEUA size={42} />
            </div>
            <Mic size={26} color="#8b5cf6" style={{ position: 'relative', zIndex: 1 }}/>
          </div>
          <h2 style={styles.logoTitle}>My Voice</h2>
        </div>
        {!modoVisualizacao && (
          <button style={styles.logoutBtn}>
            <LogOut size={18}/><span style={{marginLeft:6}}>Voltar</span>
          </button>
        )}
      </nav>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>{curso?.nome || 'Carregando...'}</h1>
          <p style={{color:'#94a3b8',fontSize:'0.95rem'}}>{curso?.descricao || ''}</p>
        </header>

        <div style={styles.aulasList}>
          {loading ? (
            <p style={{textAlign: 'center', padding: '2rem'}}>Carregando trilha...</p>
          ) : aulas.map(aula => (
            <div key={aula.id} style={styles.aulaCard}>
              <div style={styles.aulaNumero}>
                <span>{String(aula.numero).padStart(2,'0')}</span>
              </div>
              <div style={styles.aulaInfo}>
                <span style={styles.aulaTagSmall}>{aula.tag}</span>
                <h3 style={{fontSize:'1rem',fontWeight:700,margin:'2px 0'}}>{aula.titulo}</h3>
                <p style={{fontSize:'0.82rem',color:'#94a3b8',marginBottom:8}}>{aula.subtitulo}</p>
                <div style={styles.aulaSections}>
                  {(aula.sections || aula.secoes || []).map((s, si) => {
                    const sectionType = s.type || s.tipo;
                    const { emoji, label } = PILL_LABELS[sectionType] || {};
                    return (
                      <button 
                        key={si} 
                        style={styles.sectionPillBtn}
                        onClick={(e) => openSec(aula, sectionType, e)}
                      >
                        {emoji} {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <ChevronRight size={20} color="#94a3b8"/>
            </div>
          ))}

          {[3,4,5].map(n => (
            <div key={n} style={{...styles.aulaCard, opacity:0.4, cursor:'not-allowed', filter:'grayscale(0.5)'}}>
              <div style={{...styles.aulaNumero, background:'rgba(255,255,255,0.08)'}}>
                <span>{String(n).padStart(2,'0')}</span>
              </div>
              <div style={styles.aulaInfo}>
                <span style={styles.aulaTagSmall}>Em breve</span>
                <h3 style={{fontSize:'1rem',fontWeight:700,margin:'2px 0'}}>Aula {n} – Linda & Glynda</h3>
                <p style={{fontSize:'0.82rem',color:'#94a3b8'}}>Conteúdo sendo preparado…</p>
              </div>
              <Lock size={18} color="#94a3b8"/>
            </div>
          ))}
        </div>
      </main>

      {modal && createPortal(
        <SecaoModal aula={modal.aula} secType={modal.secType} onClose={() => setModal(null)}/>,
        document.body
      )}
    </div>
  );
}
// ── Inline Styles (replica fiel do Trilha.module.css) ────────────────────────
const styles = {
  trilhaContainer: { minHeight:'100vh', display:'flex', flexDirection:'column',
    fontFamily:"'Outfit', system-ui, sans-serif", background:'#0f172a', color:'#f8fafc',
    backgroundImage:'radial-gradient(circle at 15% 50%, rgba(139,92,246,0.15),transparent 25%), radial-gradient(circle at 85% 30%, rgba(236,72,153,0.15),transparent 25%)' },
  navbar: { position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'1rem 2rem', background:'rgba(15,23,42,0.9)', backdropFilter:'blur(20px)',
    borderBottom:'1px solid rgba(255,255,255,0.1)' },
  logoInfo: { display:'flex', alignItems:'center', gap:'0.75rem' },
  logoMicWrapper: { position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:42, height:42 },
  logoBandeira: { position:'absolute', inset:0, borderRadius:8, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 1.5px rgba(255,255,255,0.18)' },
  logoTitle: { fontSize:'1.2rem', fontWeight:800, background:'linear-gradient(to right,#8b5cf6,#ec4899)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  logoutBtn: { display:'flex', alignItems:'center', color:'#94a3b8', fontSize:'0.88rem',
    padding:'0.45rem 1rem', borderRadius:9999, border:'1px solid rgba(255,255,255,0.1)',
    cursor:'pointer', background:'transparent', transition:'all 0.15s' },
  mainContent: { flex:1, padding:'2rem', maxWidth:860, margin:'0 auto', width:'100%' },
  header: { marginBottom:'2rem', textAlign:'center' },
  headerTitle: { fontSize:'1.9rem', fontWeight:800, marginBottom:'0.4rem',
    background:'linear-gradient(to right,#8b5cf6,#ec4899,#06b6d4)',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  aulasList: { display:'flex', flexDirection:'column', gap:'0.875rem' },
  aulaCard: { display:'flex', alignItems:'center', gap:'1.25rem', padding:'1.25rem 1.5rem',
    background:'rgba(30,41,59,0.7)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:16, cursor:'pointer', transition:'transform 0.3s, box-shadow 0.3s' },
  aulaNumero: { minWidth:52, height:52, borderRadius:12,
    background:'linear-gradient(135deg,#8b5cf6,#ec4899)', display:'flex',
    alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:800, flexShrink:0 },
  aulaInfo: { flex:1 },
  aulaTagSmall: { fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em',
    textTransform:'uppercase', color:'#06b6d4', display:'block', marginBottom:2 },
  aulaSections: { display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:4 },
  sectionPillBtn: { fontSize:'0.7rem', padding:'0.22rem 0.65rem',
    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:9999, color:'#cbd5e1', cursor:'pointer', transition:'all 0.15s',
    display:'flex', alignItems:'center', gap:4 },

  // ✅ CORREÇÃO: Aumenta z-index de 200 para 9999 para ficar acima do ModoAluno (zIndex 300/400)
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)',
    zIndex:9999, display:'flex', alignItems:'flex-start', justifyContent:'center',
    padding:'1rem', overflowY:'auto' },
  modalContent: { background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:20, width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto',
    display:'flex', flexDirection:'column', marginTop:'2rem' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start',
    padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 },
  closeBtn: { background:'rgba(255,255,255,0.07)', border:'none', borderRadius:9999,
    color:'#94a3b8', cursor:'pointer', padding:'0.4rem', display:'flex', alignItems:'center' },
  modalBody: { padding:'1.25rem 1.5rem', flex:1 },
  motivaFrase: { padding:'1rem 1.5rem', textAlign:'center', fontSize:'0.8rem',
    color:'#94a3b8', fontStyle:'italic', borderTop:'1px solid rgba(255,255,255,0.06)' },

  // Section shared
  sectionBlock: { marginBottom:'1.5rem' },
  sectionTitle: { display:'flex', alignItems:'center', fontSize:'0.95rem', fontWeight:700,
    marginBottom:'0.875rem', color:'#e2e8f0' },

  // Diálogo
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
  bubbleActiveStyle: { boxShadow:'0 0 0 2px rgba(139,92,246,0.5)' },
  bubbleName: { fontSize:'0.68rem', fontWeight:700, color:'#8b5cf6',
    textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:3 },
  bubbleText: { fontSize:'0.88rem', lineHeight:1.55, color:'#e2e8f0' },
  word: { transition:'background 0.1s', borderRadius:3, padding:'0 1px' },
  wordActive: { background:'rgba(139,92,246,0.4)', color:'#fff', fontWeight:700 },

  // Verbos
  verbTable: { width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' },
  verbTh: { textAlign:'left', padding:'0.5rem 0.75rem', background:'rgba(139,92,246,0.15)',
    color:'#a78bfa', fontWeight:700, fontSize:'0.72rem', textTransform:'uppercase',
    letterSpacing:'0.05em', borderBottom:'1px solid rgba(255,255,255,0.1)' },
  verbTd: { padding:'0.5rem 0.75rem', color:'#e2e8f0', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  verbRowEven: { background:'rgba(255,255,255,0.02)' },

  // Vocabulário
  vocabGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'0.5rem' },
  vocabCard: { padding:'0.5rem 0.75rem', background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
    display:'flex', flexDirection:'column', gap:2 },
  vocabEn: { fontSize:'0.82rem', fontWeight:700, color:'#a78bfa' },
  vocabPt: { fontSize:'0.74rem', color:'#94a3b8' },

  // Exercícios
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
