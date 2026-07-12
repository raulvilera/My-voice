import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SecaoDialogo }     from '../components/SecaoDialogo';
import { SecaoVerbos }      from '../components/SecaoVerbos';
import { SecaoVocabulario } from '../components/SecaoVocabulario';
import { SecaoExercicios }  from '../components/SecaoExercicios';
import { supabase }         from '../lib/supabaseClient';
import myVoiceData            from '../data/myvoiceData';

// ── AULAS HARDCODED ───────────────────────────────────────────────────────────
// sections originais preservadas INTACTAS — não remapear aqui
const AULAS_HC = myVoiceData.basico.aulas.map(a => ({
  ...a,
  id: `hc-${a.id}`,
  publicada: true,
  _source: 'hc', // marca a origem para o Modal saber qual array usar
}));

const NUMEROS_HC = new Set(AULAS_HC.map(a => a.numero));

// ── PILLS ─────────────────────────────────────────────────────────────────────
const PILLS = {
  dialogo:     { emoji: '💬', label: 'Diálogo'    },
  verbos:      { emoji: '📘', label: 'Verbos'      },
  vocabulario: { emoji: '📖', label: 'Vocab'       },
  exercicios:  { emoji: '✏️', label: 'Exercícios' },
};

// ── HELPER YOUTUBE ─────────────────────────────────────────────────────────────
const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
  return match ? match[1] : null;
};

// ── MODAL ─────────────────────────────────────────────────────────────────────
const Modal = ({ aula, onClose }) => {
  const [secType, setSecType] = useState('tudo');
  if (!aula) return null;

  // Para aulas HC: usar sections direto (tipo está em .type)
  // Para aulas do banco: usar secoes (tipo está em .tipo ou .conteudo.tipo)
  const rawSecs = aula._source === 'hc'
    ? (aula.sections || [])
    : (aula.secoes   || []);

  // Normaliza para { tipo, ...dadosOriginais } preservando tudo
  const secs = rawSecs.map(s => ({
    ...s,
    tipo: s.type || s.tipo || (s.conteudo?.type) || (s.conteudo?.tipo) || '',
  }));

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

  // Tipos únicos para as tabs (evita duplicar se houver duas seções de verbos)
  const tiposUnicos = [...new Set(secs.map(s => s.tipo).filter(Boolean))];

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
          {[{ tipo:'tudo', emoji:'📋', label:'Tudo' },
            ...tiposUnicos.map(t => ({ tipo: t, ...(PILLS[t] || { emoji:'📄', label: t }) }))
          ].map(t => (
            <button key={t.tipo} onClick={() => setSecType(t.tipo)} style={{
              fontSize:'0.75rem', padding:'0.3rem 0.8rem', borderRadius:9999,
              border: secType === t.tipo ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
              background: secType === t.tipo ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: secType === t.tipo ? '#c084fc' : '#94a3b8',
              fontWeight: secType === t.tipo ? 700 : 400,
              cursor:'pointer', fontFamily:'inherit',
            }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding:'1.25rem 1.5rem', flex:1, overflowY:'auto' }}>
          
          {aula.youtube_live_url && (secType === 'tudo') && (
            <div style={{ marginBottom: '1.5rem', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              {aula.is_live && (
                <div style={{ background: '#ef4444', color: '#fff', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  AULA AO VIVO AGORA
                </div>
              )}
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={`https://www.youtube.com/embed/${getYouTubeId(aula.youtube_live_url)}?autoplay=${aula.is_live ? 1 : 0}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {toShow.length === 0
            ? <p style={{ color:'#64748b', textAlign:'center', marginTop:'2rem' }}>
                Nenhum conteúdo para exibir.
              </p>
            : toShow.map((s, i) => renderSec(s, i))
          }
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
        // Hardcoded prevalece — banco só adiciona aulas novas (3, 4, 5…)
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
            // Pills na listagem: sections (HC) ou secoes (banco)
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
                    textTransform:'uppercase', color:'#06b6d4', display:'inline-block', marginBottom:2, marginRight: 8 }}>
                    {aula.tag || 'Iniciante'}
                  </span>
                  {aula.is_live && (
                    <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em',
                      background:'#ef4444', color:'#fff', padding:'2px 6px', borderRadius: 4, display:'inline-block', marginBottom:2 }}>
                      🔴 AO VIVO
                    </span>
                  )}
                  <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'2px 0' }}>{aula.titulo}</h3>
                  <p style={{ fontSize:'0.82rem', color:'#94a3b8', marginBottom:8 }}>{aula.subtitulo}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                    {secs.map((s, si) => {
                      const tipo = s.type || s.tipo;
                      const pill = PILLS[tipo];
                      if (!pill) return null;
                      return (
                        <span key={si} style={{
                          fontSize:'0.7rem', padding:'0.22rem 0.65rem',
                          background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
                          borderRadius:9999, color:'#cbd5e1',
                        }}>
                          {pill.emoji} {pill.label}
                        </span>
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
