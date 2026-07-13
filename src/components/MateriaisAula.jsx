/**
 * MateriaisAula.jsx
 * Exibido na área do aluno (junto com os exercícios e o vídeo da aula).
 * Lista os materiais (PDFs, imagens, links, documentos) que a professora
 * anexou àquela aula específica — ficam disponíveis para TODOS os alunos
 * que têm acesso à aula, mesmo quem não assistiu à transmissão ao vivo.
 */

import { useState, useEffect } from 'react';
import { FileText, Download, Paperclip, Image as ImageIcon, Link as LinkIcon, File } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const s = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(6,182,212,0.25)',
    background: 'rgba(15,23,42,0.6)',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 0.9rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(6,182,212,0.08)',
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 800,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: '#06b6d4',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    padding: '0.6rem 0.9rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.7rem',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    textDecoration: 'none',
    color: '#e2e8f0',
    fontSize: '0.82rem',
    fontWeight: 600,
  },
};

function iconePorTipo(tipo) {
  if (tipo === 'imagem') return <ImageIcon size={16} style={{ color: '#06b6d4' }} />;
  if (tipo === 'link') return <LinkIcon size={16} style={{ color: '#06b6d4' }} />;
  if (tipo === 'pdf') return <FileText size={16} style={{ color: '#06b6d4' }} />;
  return <File size={16} style={{ color: '#06b6d4' }} />;
}

export function MateriaisAula({ aulaId }) {
  const [materiais, setMateriais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!aulaId) { setCarregando(false); return; }
    supabase
      .from('materiais_aula')
      .select('id, titulo, url, tipo, created_at')
      .eq('aula_id', aulaId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.warn('[MateriaisAula] Erro ao buscar materiais:', error);
        setMateriais(data || []);
        setCarregando(false);
      });
  }, [aulaId]);

  if (carregando) return null;
  if (!materiais.length) return null;

  return (
    <div style={s.wrapper}>
      <div style={s.headerBar}>
        <Paperclip size={13} style={{ color: '#06b6d4' }} />
        <span style={s.badge}>Materiais da Aula</span>
      </div>
      <div style={s.lista}>
        {materiais.map(m => (
          <a
            key={m.id}
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            style={s.item}
          >
            {iconePorTipo(m.tipo)}
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titulo}</span>
            <Download size={15} style={{ color: '#64748b', flexShrink: 0 }} />
          </a>
        ))}
      </div>
    </div>
  );
}
