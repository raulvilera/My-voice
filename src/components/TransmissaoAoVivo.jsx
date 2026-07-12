import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RadioTower, ChevronDown, Video } from 'lucide-react';
import SalaLiveKit from './SalaLiveKit';
import styles from './TransmissaoAoVivo.module.css';

export default function TransmissaoAoVivo() {
  const [aulas, setAulas] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState('');
  const [transmitindo, setTransmitindo] = useState(false);

  useEffect(() => {
    (async () => {
      // Busca apenas aulas marcadas como Ao Vivo ou todas, dependendo de como preferir.
      const { data, error } = await supabase
        .from('aulas')
        .select('id, numero, titulo, is_live')
        .order('numero', { ascending: false });
      if (!error) setAulas(data || []);
    })();
  }, []);

  if (transmitindo && aulaSelecionada) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            Transmitindo Ao Vivo
          </h3>
          <button 
            onClick={() => setTransmitindo(false)}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Encerrar Transmissão
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <SalaLiveKit aulaId={aulaSelecionada} modo="professora" />
        </div>
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
          onClick={() => {
            if (!aulaSelecionada) return alert('Selecione uma aula primeiro!');
            setTransmitindo(true);
          }}
          disabled={!aulaSelecionada}
          style={{ width: '100%', marginTop: '1rem', padding: '1rem', background: aulaSelecionada ? '#8b5cf6' : '#475569', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: aulaSelecionada ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          <Video size={18} /> Iniciar Câmera e Transmitir
        </button>
      </div>
    </div>
  );
}
