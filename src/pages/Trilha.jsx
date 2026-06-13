import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SecaoDialogo }     from '../components/SecaoDialogo';
import { SecaoVerbos }      from '../components/SecaoVerbos';
import { SecaoVocabulario } from '../components/SecaoVocabulario';
import { SecaoExercicios }  from '../components/SecaoExercicios';
import { supabase }         from '../lib/supabaseClient';
import myVoiceData            from '../data/myvoiceData';

// ── DADOS DAS AULAS ───────────────────────────────────────────────────────────
const AULAS_HC = myVoiceData.basico.aulas.map(a => ({
  ...a,
  id: `hc-${a.id}`,
  publicada: true,
  // Preserva sections original (com audioSrc, timestamps, etc.)
  // E cria secoes mapeadas para o modal do AdminDashboard
  secoes: (a.sections || []).map((s, i) => ({
    tipo:  s.type || s.tipo,
    titulo: s.titulo,
    conteudo: s,
    ordem: i,
  })),
}));

// Conjunto dos números das aulas hardcoded (ex: {1, 2})
const NUMEROS_HC = new Set(AULAS_HC.map(a => a.numero));

// ── PILLS ─────────────────────────────────────────────────────────────────────
const PILLS = {
  dialogo:     { emoji: '💬', label: 'Diálogo'    },
  verbos:      { emoji: '📘', label: 'Verbos'      },
  vocabulario: { emoji: '📖', label: 'Vocab'       },
  exercicios:  { emoji: '✏️', label: 'Exercícios' },
};

// ── MODAL ─────────────────────────────────────────────────────────────────────
const Modal = ({ aula, onClose }) => {
  const [secType, setSecType] = useState('tudo');
  if (!aula) return null;

  const secs = (aula.sections || aula.secoes || []).map(s => {
    // Normaliza: hardcoded tem dados diretos; banco tem .conteudo JSONB
    const base = (s.conteudo && typeof s.conteudo === 'object') ? s.conteudo : {};
    return {
      tipo:        s.type        || s.tipo        || '',
      titulo:      s.titulo      || base.titulo   || '',
      audioSrc:    s.audioSrc    || base.audioSrc || null,
      personagens: s.personagens || base.personagens || [],
      falas:       s.falas       || base.falas       || [],
      verbos:      s.verbos      || base.verbos       || [],
      palavras:    s.palavras    || base.palavras     || [],
      grupos:      s.grupos      || base.grupos       || [],
    };
  });
  const toShow = secType === 'tudo' ? secs : secs.filter(s => s.tipo === secType);

  const renderSec = (s, i) => {
    switch (s.tipo) {
      case 'dialogo':     return <SecaoDialogo     key={i} section={s} />;
      case 'verbos':      return <SecaoVerbos      key={i} section={s} />;
      case 'vocabulario': return <SecaoVocabulario key={i} section={s} />;
      case 'exercicios':  return <SecaoExercicios  key={i} section={s} aulaId={aula.id} />;
      default: return null;
    }
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      backdropFilter:'blur(6px)', zIndex:9999,
      display:'flex', alignItems:'flex-start', justifyContent:'center',
      padding:'1rem', overflowY:'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:20, width:'100%', maxWidth:680,
        marginTop:'2rem', marginBottom:'2rem',
        display:'flex', flexDirection:'column', maxHeight:'90vh', overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'flex-start',
          padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.08)',
          flexShrink:0,
        }}>
          <div>
            <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em',
              textTransform:'uppercase', color:'#06b6d4' }}>
              Aula {aula.numero}
            </span>
            <h2 style={{ fontSize:'1.15rem', fontWeight:800, marginTop:4 }}>{aula.titulo}</h2>
            <p style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:2 }}>{aula.subtitulo}</p>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.07)', border:'none', borderRadius:9999,
            color:'#94a3b8', cursor:'pointer', padding:'0.4rem 0.55rem', fontSize:'1.1rem',
          }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', padding:'0.875rem 1.5rem 0', flexShrink:0 }}>
          {[{ type:'tudo', emoji:'📋', label:'Tudo' }, ...secs.map(s => ({ type:s.type, ...PILLS[s.type] }))].map(t => (
            <button key={t.type} onClick={() => setSecType(t.type)} style={{
              fontSize:'0.75rem', padding:'0.3rem 0.8rem', borderRadius:9999,
              border: secType === t.type ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
              background: secType === t.type ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: secType === t.type ? '#c084fc' : '#94a3b8',
              fontWeight: secType === t.type ? 700 : 400,
              cursor:'pointer', fontFamily:'inherit',
            }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding:'1.25rem 1.5rem', flex:1, overflowY:'auto' }}>
          {toShow.map((s, i) => renderSec(s, i))}
        </div>

        <div style={{
          padding:'1rem 1.5rem', textAlign:'center', fontSize:'0.8rem',
          color:'#94a3b8', fontStyle:'italic', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0,
        }}>
          "Você não precisa acertar tudo. Você só precisa continuar." ✨
        </div>
      </div>
    </div>
  );
};

// ── TRILHA (página principal) ─────────────────────────────────────────────────
export default function Trilha({ modoVisualizacao = false }) {
  const navigate = useNavigate();
  const [aulas, setAulas] = useState(AULAS_HC);
  const [modalAula, setModalAula] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('aulas')
          .select('*, secoes(*)')
          .eq('publicada', true)
          .order('numero', { ascending: true });
        if (!mounted || error || !data?.length) return;

        // FIX: hardcoded sempre prevalece — banco só adiciona aulas NOVAS
        // (números que não existem no hardcoded, ex: 3, 4, 5...)
        const aulasNovas = data.filter(a => !NUMEROS_HC.has(a.numero));
        setAulas([...AULAS_HC, ...aulasNovas].sort((a, b) => a.numero - b.numero));
      } catch { /* mantém hardcoded */ }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{
      minHeight:'100vh', fontFamily:"'Outfit',system-ui,sans-serif",
      background:'#0f172a', color:'#f8fafc',
      backgroundImage:'radial-gradient(circle at 15% 50%,rgba(139,92,246,.15),transparent 25%),radial-gradient(circle at 85% 30%,rgba(236,72,153,.15),transparent 25%)',
    }}>
      {/* Navbar */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'1rem 2rem', background:'rgba(15,23,42,0.9)',
        backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <img src="/my_voice_default.png" alt="My Voice"
            style={{ width:46, height:46, borderRadius:'50%', objectFit:'cover' }} />
          <span style={{
            fontSize:'1.2rem', fontWeight:800,
            background:'linear-gradient(to right,#8b5cf6,#ec4899)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>My Voice</span>
        </div>
        {!modoVisualizacao && (
          <button onClick={() => navigate(-1)} style={{
            display:'flex', alignItems:'center', gap:6, color:'#94a3b8', fontSize:'0.88rem',
            padding:'0.45rem 1rem', borderRadius:9999, border:'1px solid rgba(255,255,255,0.1)',
            cursor:'pointer', background:'transparent',
          }}>
            <LogOut size={18}/> Voltar
          </button>
        )}
      </nav>

      {/* Main */}
      <main style={{ padding:'2rem', maxWidth:860, margin:'0 auto', width:'100%' }}>
        <header style={{ marginBottom:'2rem', textAlign:'center' }}>
          <h1 style={{
            fontSize:'1.9rem', fontWeight:800, marginBottom:'0.4rem',
            background:'linear-gradient(to right,#8b5cf6,#ec4899,#06b6d4)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>Inglês Básico</h1>
          <p style={{ color:'#94a3b8', fontSize:'0.95rem' }}>
            Do zero à conversação. Comece sua voz em inglês aqui.
          </p>
        </header>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
          {aulas.map(aula => {
            const secs = aula.sections || aula.secoes || [];
            return (
              <div key={aula.id} onClick={() => setModalAula(aula)} style={{
                display:'flex', alignItems:'center', gap:'1.25rem',
                padding:'1.25rem 1.5rem',
                background:'rgba(30,41,59,0.7)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:16, cursor:'pointer', transition:'transform 0.25s,box-shadow 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(139,92,246,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                {/* Número */}
                <div style={{
                  minWidth:52, height:52, borderRadius:12,
                  background:'linear-gradient(135deg,#8b5cf6,#ec4899)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.1rem', fontWeight:800, flexShrink:0,
                }}>
                  {String(aula.numero).padStart(2,'0')}
                </div>

                {/* Info */}
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em',
                    textTransform:'uppercase', color:'#06b6d4', display:'block', marginBottom:2 }}>
                    {aula.tag || 'Iniciante'}
                  </span>
                  <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'2px 0' }}>{aula.titulo}</h3>
                  <p style={{ fontSize:'0.82rem', color:'#94a3b8', marginBottom:8 }}>{aula.subtitulo}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                    {secs.map((s, si) => {
                      const tipo = s.type || s.tipo;
                      const pill = PILLS[tipo];
                      if (!pill) return null;
                      return (
                        <button key={si}
                          onClick={e => { e.stopPropagation(); setModalAula(aula); }}
                          style={{
                            fontSize:'0.7rem', padding:'0.22rem 0.65rem',
                            background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
                            borderRadius:9999, color:'#cbd5e1', cursor:'pointer',
                          }}>
                          {pill.emoji} {pill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <ChevronRight size={20} color="#94a3b8"/>
              </div>
            );
          })}
        </div>
      </main>

      {modalAula && createPortal(
        <Modal aula={modalAula} onClose={() => setModalAula(null)}/>,
        document.body
      )}
    </div>
  );
}
