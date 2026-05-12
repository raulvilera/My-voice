/**
 * VideoAulaProfessora.jsx
 * Exibido na área do aluno ao lado (ou acima, no mobile) dos exercícios.
 * Busca o vídeo mais recente publicado pela professora para a aula informada.
 * Suporta plataforma web e PWA (app).
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Video } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ── Estilos inline (sem dependência de módulo CSS extra) ──────────────────────
const s = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(139,92,246,0.25)',
    background: 'rgba(15,23,42,0.6)',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 0.9rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(139,92,246,0.08)',
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 800,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  titulo: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#cbd5e1',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  videoEl: {
    width: '100%',
    display: 'block',
    background: '#0a0f1e',
    maxHeight: 220,
    objectFit: 'cover',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1.5rem',
    color: '#475569',
    fontSize: '0.8rem',
    textAlign: 'center',
  },
};

// ── Componente ────────────────────────────────────────────────────────────────
export function VideoAulaProfessora({ aulaId }) {
  const [video, setVideo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!aulaId) { setCarregando(false); return; }
    supabase
      .from('videos_aulas')
      .select('id, titulo, url, duracao_seg, created_at')
      .eq('aula_id', aulaId)
      .eq('publicado', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setVideo(data || null);
        setCarregando(false);
      });
  }, [aulaId]);

  if (carregando) return null; // não mostra nada enquanto carrega
  if (!video) return null;    // sem vídeo publicado = sem widget

  return (
    <div style={s.wrapper}>
      <div style={s.headerBar}>
        <Video size={13} style={{ color: '#8b5cf6' }} />
        <span style={s.badge}>Vídeo da Professora</span>
        <span style={s.titulo}>{video.titulo}</span>
      </div>
      <video
        ref={videoRef}
        src={video.url}
        style={s.videoEl}
        controls
        playsInline
        preload="metadata"
        aria-label={`Vídeo-aula: ${video.titulo}`}
      />
    </div>
  );
}
