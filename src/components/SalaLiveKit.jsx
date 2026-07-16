import { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SalaLiveKit({ aulaId, modo, convidado = false, nomeConvidado = '' }) {
  const { user, profile } = useAuth();
  const [token, setToken] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Modo: 'professora' ou 'aluno'
  const isProfessora = modo === 'professora';
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL; // "wss://seu-projeto.livekit.cloud"

  useEffect(() => {
    async function fetchToken() {
      // Convidado (link público de convite): nunca é professora, nunca publica
      // câmera/mic da professora — só assiste. Não exige login.
      if (convidado && !isProfessora) {
        if (!serverUrl) {
          setErro('VITE_LIVEKIT_URL não está configurado. A professora precisa adicionar as chaves no Vercel.');
          setCarregando(false);
          return;
        }
        try {
          const identidadeConvidado = `convidado-${Math.random().toString(36).slice(2, 10)}`;
          const { data, error } = await supabase.functions.invoke('livekit-token', {
            body: {
              room: `aula-${aulaId}`,
              identity: identidadeConvidado,
              name: nomeConvidado?.trim() || 'Visitante',
              isProfessora: false,
            }
          });
          if (error) throw error;
          if (!data?.token) throw new Error('Token não retornado pela função.');
          setToken(data.token);
        } catch (err) {
          console.error('Erro ao buscar token LiveKit (convidado):', err);
          setErro('Falha ao conectar na sala ao vivo.');
        } finally {
          setCarregando(false);
        }
        return;
      }

      if (!user) {
        setErro('Você precisa estar logado para acessar a sala ao vivo.');
        setCarregando(false);
        return;
      }
      if (!serverUrl) {
        setErro('VITE_LIVEKIT_URL não está configurado. A professora precisa adicionar as chaves no Vercel.');
        setCarregando(false);
        return;
      }

      try {
        // Chama a Edge Function que gera o Token
        const { data, error } = await supabase.functions.invoke('livekit-token', {
          body: { 
            room: `aula-${aulaId}`,
            identity: user.id,
            name: profile?.name || user.email || 'Usuário',
            isProfessora
          }
        });

        if (error) throw error;
        if (!data?.token) throw new Error('Token não retornado pela função.');

        setToken(data.token);
      } catch (err) {
        console.error('Erro ao buscar token LiveKit:', err);
        setErro('Falha ao conectar na sala ao vivo. Verifique a configuração da Edge Function do Supabase.');
      } finally {
        setCarregando(false);
      }
    }

    fetchToken();
  }, [aulaId, user, isProfessora, convidado, nomeConvidado]);

  if (carregando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
        <Loader2 size={32} className="spin" style={{ color: '#8b5cf6' }} />
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Conectando à sala...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12 }}>
        <AlertCircle size={32} style={{ color: '#ef4444' }} />
        <p style={{ marginTop: '1rem', color: '#ef4444', textAlign: 'center' }}>{erro}</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={isProfessora}
      audio={isProfessora}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: '450px', background: '#0f172a' }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
