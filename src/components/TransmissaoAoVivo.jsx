import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RadioTower, ChevronDown, Video, Paperclip, Upload, Loader2, Trash2, FileText, Link as LinkIcon } from 'lucide-react';
import SalaLiveKit from './SalaLiveKit';
import styles from './TransmissaoAoVivo.module.css';

export default function TransmissaoAoVivo() {
  const [aulas, setAulas] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState('');
  const [transmitindo, setTransmitindo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Materiais anexados à aula
  const [materiais, setMateriais] = useState([]);
  const [tituloMaterial, setTituloMaterial] = useState('');
  const [linkMaterial, setLinkMaterial] = useState('');
  const [arquivoMaterial, setArquivoMaterial] = useState(null);
  const [enviandoMaterial, setEnviandoMaterial] = useState(false);
  const [erroMaterial, setErroMaterial] = useState('');

  const carregarMateriais = async (aulaId) => {
    if (!aulaId) { setMateriais([]); return; }
    const { data, error } = await supabase
      .from('materiais_aula')
      .select('id, titulo, url, tipo, created_at')
      .eq('aula_id', aulaId)
      .order('created_at', { ascending: false });
    if (!error) setMateriais(data || []);
  };

  useEffect(() => {
    carregarMateriais(aulaSelecionada);
    setTituloMaterial('');
    setLinkMaterial('');
    setArquivoMaterial(null);
    setErroMaterial('');
  }, [aulaSelecionada]);

  const enviarMaterial = async () => {
    if (!aulaSelecionada) return;
    if (!tituloMaterial.trim()) {
      setErroMaterial('Dê um nome para o material antes de enviar.');
      return;
    }
    if (!arquivoMaterial && !linkMaterial.trim()) {
      setErroMaterial('Escolha um arquivo ou cole um link.');
      return;
    }

    setEnviandoMaterial(true);
    setErroMaterial('');

    try {
      let url = '';
      let tipo = 'arquivo';

      if (linkMaterial.trim()) {
        url = linkMaterial.trim();
        tipo = 'link';
      } else {
        const ext = (arquivoMaterial.name.split('.').pop() || '').toLowerCase();
        tipo = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'imagem' : (ext === 'pdf' ? 'pdf' : 'arquivo');
        const nomeArquivo = `aula-${aulaSelecionada}-${Date.now()}.${ext}`;
        const caminho = `materiais/${nomeArquivo}`;

        const { error: uploadErr } = await supabase.storage
          .from('videos') // reaproveita o mesmo bucket público já usado para os vídeos-aula
          .upload(caminho, arquivoMaterial, { contentType: arquivoMaterial.type, upsert: false });

        if (uploadErr) throw new Error('Erro ao enviar arquivo: ' + uploadErr.message);

        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(caminho);
        url = urlData?.publicUrl;
        if (!url) throw new Error('URL do material não foi gerada.');
      }

      const { error: dbErr } = await supabase
        .from('materiais_aula')
        .insert({ aula_id: parseInt(aulaSelecionada), titulo: tituloMaterial.trim(), url, tipo });

      if (dbErr) throw new Error('Erro ao registrar material: ' + dbErr.message);

      setTituloMaterial('');
      setLinkMaterial('');
      setArquivoMaterial(null);
      await carregarMateriais(aulaSelecionada);
    } catch (e) {
      setErroMaterial(e.message || 'Erro ao anexar material.');
    } finally {
      setEnviandoMaterial(false);
    }
  };

  const removerMaterial = async (id) => {
    if (!window.confirm('Remover este material? Os alunos deixarão de vê-lo.')) return;
    const { error } = await supabase.from('materiais_aula').delete().eq('id', id);
    if (!error) setMateriais(m => m.filter(item => item.id !== id));
  };

  const carregarAulas = async () => {
    const { data, error } = await supabase
      .from('aulas')
      .select('id, numero, titulo, is_live')
      .order('numero', { ascending: false });
    if (!error) setAulas(data || []);
  };

  useEffect(() => {
    carregarAulas();
  }, []);

  // Se a professora fechar/atualizar a aba enquanto transmite, encerra a marcação no banco.
  useEffect(() => {
    if (!transmitindo || !aulaSelecionada) return;

    const encerrarAoSair = () => {
      // fire-and-forget: o navegador pode fechar antes da resposta, mas o navigator.sendBeacon
      // não funciona bem com Supabase, então tentamos o update normal mesmo assim.
      supabase.from('aulas').update({ is_live: false }).eq('id', aulaSelecionada);
    };

    window.addEventListener('beforeunload', encerrarAoSair);
    return () => window.removeEventListener('beforeunload', encerrarAoSair);
  }, [transmitindo, aulaSelecionada]);

  const iniciarTransmissao = async () => {
    if (!aulaSelecionada) return alert('Selecione uma aula primeiro!');
    setSalvando(true);
    const { error } = await supabase
      .from('aulas')
      .update({ is_live: true })
      .eq('id', aulaSelecionada);
    setSalvando(false);
    if (error) {
      alert('Não foi possível iniciar a transmissão: ' + error.message);
      return;
    }
    setTransmitindo(true);
  };

  const encerrarTransmissao = async () => {
    setSalvando(true);
    const { error } = await supabase
      .from('aulas')
      .update({ is_live: false })
      .eq('id', aulaSelecionada);
    setSalvando(false);
    if (error) {
      alert('A transmissão foi encerrada localmente, mas houve um erro ao atualizar o status: ' + error.message);
    }
    setTransmitindo(false);
    carregarAulas();
  };

  if (transmitindo && aulaSelecionada) {
    return (
      <div style={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            Transmitindo Ao Vivo
          </h3>
          <button 
            onClick={encerrarTransmissao}
            disabled={salvando}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', cursor: salvando ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: salvando ? 0.7 : 1 }}
          >
            {salvando ? 'Encerrando...' : 'Encerrar Transmissão'}
          </button>
        </div>
        <div style={{ padding: '0.8rem 1rem', background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <LinkConvite aulaId={aulaSelecionada} />
        </div>
        <div style={{ height: '65vh' }}>
          <SalaLiveKit aulaId={aulaSelecionada} modo="professora" />
        </div>

        <PainelMateriais
          materiais={materiais}
          tituloMaterial={tituloMaterial}
          setTituloMaterial={setTituloMaterial}
          linkMaterial={linkMaterial}
          setLinkMaterial={setLinkMaterial}
          arquivoMaterial={arquivoMaterial}
          setArquivoMaterial={setArquivoMaterial}
          enviandoMaterial={enviandoMaterial}
          erroMaterial={erroMaterial}
          enviarMaterial={enviarMaterial}
          removerMaterial={removerMaterial}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}><RadioTower size={22} /></div>
        <div>
          <h2 className={styles.headerTitle}>Sala de Transmissão (LiveKit)</h2>
          <p className={styles.headerDesc}>
            Selecione a aula que você deseja transmitir ao vivo para os alunos.
          </p>
        </div>
      </div>

      <div className={styles.secao} style={{ maxWidth: 500, margin: '2rem auto' }}>
        <div className={styles.campo}>
          <label className={styles.label}>Selecione a Aula</label>
          <div className={styles.selectWrapper} style={{ position: 'relative' }}>
            <select 
              className={styles.select} 
              value={aulaSelecionada} 
              onChange={e => setAulaSelecionada(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', appearance: 'none' }}
            >
              <option value="">Escolha uma aula...</option>
              {aulas.map(a => (
                <option key={a.id} value={a.id}>
                  Aula {a.numero}: {a.titulo} {a.is_live ? '(Marcada como Ao Vivo)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
          </div>
        </div>

        <button 
          onClick={iniciarTransmissao}
          disabled={!aulaSelecionada || salvando}
          style={{ width: '100%', marginTop: '1rem', padding: '1rem', background: aulaSelecionada ? '#8b5cf6' : '#475569', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: (aulaSelecionada && !salvando) ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: salvando ? 0.7 : 1 }}
        >
          <Video size={18} /> {salvando ? 'Iniciando...' : 'Iniciar Câmera e Transmitir'}
        </button>

        {aulaSelecionada && (
          <div style={{ marginTop: '1rem' }}>
            <LinkConvite aulaId={aulaSelecionada} />
          </div>
        )}

        {aulaSelecionada && (
          <PainelMateriais
            materiais={materiais}
            tituloMaterial={tituloMaterial}
            setTituloMaterial={setTituloMaterial}
            linkMaterial={linkMaterial}
            setLinkMaterial={setLinkMaterial}
            arquivoMaterial={arquivoMaterial}
            setArquivoMaterial={setArquivoMaterial}
            enviandoMaterial={enviandoMaterial}
            erroMaterial={erroMaterial}
            enviarMaterial={enviarMaterial}
            removerMaterial={removerMaterial}
          />
        )}
      </div>
    </div>
  );
}

// ── Painel de materiais anexados à aula ──────────────────────────────────────
// Uma vez anexado, o material fica disponível para TODOS os alunos que têm
// acesso à aula (não só quem assistiu à transmissão ao vivo).
function LinkConvite({ aulaId }) {
  const [copiado, setCopiado] = useState(false);
  if (!aulaId) return null;
  const link = `${window.location.origin}/assistir/${aulaId}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard pode falhar em contexto não seguro — campo abaixo permite copiar manualmente */
    }
  };

  return (
    <div style={{
      background: 'rgba(139,92,246,0.08)',
      border: '1px solid rgba(139,92,246,0.25)',
      borderRadius: 10,
      padding: '0.7rem 0.9rem',
    }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
        <LinkIcon size={14} /> Link de convite (aluno assiste sem logar)
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
          style={{ flex: '1 1 180px', fontSize: '0.72rem', padding: '0.4rem 0.6rem', borderRadius: 6, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
        />
        <button
          onClick={copiar}
          style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem' }}
        >
          {copiado ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>
      <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.35rem' }}>
        O aluno só consegue entrar quando a transmissão estiver ativa. Ele entra só como espectador (sem câmera/mic).
      </p>
    </div>
  );
}

function PainelMateriais({
  materiais, tituloMaterial, setTituloMaterial, linkMaterial, setLinkMaterial,
  arquivoMaterial, setArquivoMaterial, enviandoMaterial, erroMaterial,
  enviarMaterial, removerMaterial,
}) {
  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#1e293b', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
      <h4 style={{ margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
        <Paperclip size={16} style={{ color: '#06b6d4' }} /> Materiais da Aula
      </h4>
      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.75rem' }}>
        Anexe um PDF, imagem, documento ou link. Fica disponível automaticamente para todos os alunos dessa aula, mesmo quem não assistir ao vivo.
      </p>

      {materiais.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.9rem' }}>
          {materiais.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.7rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.8rem' }}>
              {m.tipo === 'link' ? <LinkIcon size={14} style={{ color: '#06b6d4' }} /> : <FileText size={14} style={{ color: '#06b6d4' }} />}
              <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.titulo}
              </a>
              <button onClick={() => removerMaterial(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex' }} title="Remover material">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Nome do material (ex: Apostila Unidade 3)"
          value={tituloMaterial}
          onChange={e => setTituloMaterial(e.target.value)}
          style={{ padding: '0.6rem 0.8rem', borderRadius: 8, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem' }}
        />
        <input
          type="file"
          onChange={e => { setArquivoMaterial(e.target.files?.[0] || null); setLinkMaterial(''); }}
          style={{ fontSize: '0.78rem', color: '#94a3b8' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ou</span>
          <input
            type="text"
            placeholder="Colar um link (ex: Google Drive, YouTube...)"
            value={linkMaterial}
            onChange={e => { setLinkMaterial(e.target.value); setArquivoMaterial(null); }}
            style={{ flex: 1, padding: '0.55rem 0.8rem', borderRadius: 8, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem' }}
          />
        </div>

        {erroMaterial && (
          <p style={{ color: '#f87171', fontSize: '0.78rem', margin: 0 }}>{erroMaterial}</p>
        )}

        <button
          onClick={enviarMaterial}
          disabled={enviandoMaterial}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', borderRadius: 8, background: '#06b6d4', color: '#0f172a', border: 'none', fontWeight: 'bold', cursor: enviandoMaterial ? 'not-allowed' : 'pointer', opacity: enviandoMaterial ? 0.7 : 1 }}
        >
          {enviandoMaterial ? <Loader2 size={16} className={styles.spin || ''} /> : <Upload size={16} />}
          {enviandoMaterial ? 'Enviando...' : 'Anexar Material'}
        </button>
      </div>
    </div>
  );
}
