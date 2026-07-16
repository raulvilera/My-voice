import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import SalaLiveKit from '../components/SalaLiveKit';
import { RadioTower, Loader2, AlertCircle } from 'lucide-react';

// Página pública de convite para a aula ao vivo.
// Não passa por PrivateRoute — o aluno não precisa ter conta nem estar
// logado para acessar. Ele só consegue ASSISTIR (nunca publicar câmera/mic).
export default function AssistirAoVivo() {
  const { aulaId } = useParams();

  const [aula, setAula] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [entrou, setEntrou] = useState(false);
  const pollRef = useRef(null);

  const carregarAula = async () => {
    const { data, error } = await supabase
      .from('aulas')
      .select('id, numero, titulo, is_live')
      .eq('id', aulaId)
      .single();

    if (error || !data) {
      setErro('Aula não encontrada. Confira se o link está correto.');
    } else {
      setAula(data);
      setErro('');
    }
    setCarregando(false);
  };

  useEffect(() => {
    carregarAula();
    // Enquanto a aula não estiver ao vivo, verifica de novo a cada 6s
    // (a professora pode iniciar a transmissão depois do aluno abrir o link)
    pollRef.current = setInterval(carregarAula, 6000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aulaId]);

  useEffect(() => {
    // Assim que a aula ficar ao vivo, não precisa mais ficar checando
    if (aula?.is_live && pollRef.current) {
      clearInterval(pollRef.current);
    }
  }, [aula]);

  const estiloTela = {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    fontFamily: 'inherit',
  };

  if (carregando) {
    return (
      <div style={estiloTela}>
        <Loader2 size={28} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '0.8rem', color: '#94a3b8' }}>Carregando aula...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={estiloTela}>
        <AlertCircle size={32} color="#ef4444" />
        <p style={{ marginTop: '0.8rem', maxWidth: 340, textAlign: 'center' }}>{erro}</p>
      </div>
    );
  }

  if (!aula.is_live) {
    return (
      <div style={estiloTela}>
        <RadioTower size={32} color="#8b5cf6" />
        <h2 style={{ marginTop: '1rem', marginBottom: '0.4rem', textAlign: 'center' }}>
          Aula {aula.numero}: {aula.titulo}
        </h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', maxWidth: 340 }}>
          A transmissão ainda não começou. Assim que a professora iniciar, esta página entra automaticamente.
        </p>
      </div>
    );
  }

  if (!entrou) {
    return (
      <div style={estiloTela}>
        <RadioTower size={32} color="#8b5cf6" />
        <h2 style={{ marginTop: '1rem', marginBottom: '0.2rem', textAlign: 'center' }}>
          Aula {aula.numero}: {aula.titulo}
        </h2>
        <p style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '1.2rem' }}>● Ao vivo agora</p>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{
            width: '100%', maxWidth: 300, padding: '0.7rem 0.9rem', borderRadius: 8,
            background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
            marginBottom: '0.9rem', fontSize: '0.9rem',
          }}
        />
        <button
          onClick={() => nome.trim() && setEntrou(true)}
          disabled={!nome.trim()}
          style={{
            padding: '0.8rem 1.6rem', borderRadius: 8, border: 'none', fontWeight: 'bold',
            background: nome.trim() ? '#8b5cf6' : '#475569', color: '#fff',
            cursor: nome.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Entrar na aula
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      <div style={{ padding: '0.8rem 1rem', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0' }}>
          <span style={{ width: 9, height: 9, background: '#ef4444', borderRadius: '50%' }} />
          Aula {aula.numero}: {aula.titulo}
        </h3>
      </div>
      <div style={{ flex: 1 }}>
        <SalaLiveKit aulaId={aulaId} modo="aluno" convidado nomeConvidado={nome} />
      </div>
    </div>
  );
}
