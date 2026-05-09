import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * PWAPrompt
 * - Mostra banner "Instalar app" quando o browser dispara o evento beforeinstallprompt
 * - Mostra banner "Nova versão disponível" quando o SW registra uma atualização
 */
const PWAPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  // Hook oficial do vite-plugin-pwa para gerenciar atualização do SW
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.error('[PWA] Erro ao registrar SW:', error);
    },
  });

  // Captura o evento de instalação nativo
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
    setInstallPrompt(null);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
    setNeedRefresh(false);
  };

  if (!showInstall && !needRefresh) return null;

  return (
    <div style={styles.wrapper}>
      {/* Banner de atualização */}
      {needRefresh && (
        <div style={styles.banner}>
          <div style={styles.content}>
            <span style={styles.icon}>🔄</span>
            <div>
              <p style={styles.title}>Nova versão disponível</p>
              <p style={styles.subtitle}>Atualize para acessar as melhorias mais recentes.</p>
            </div>
          </div>
          <div style={styles.actions}>
            <button style={styles.btnSecondary} onClick={() => setNeedRefresh(false)}>
              Depois
            </button>
            <button style={styles.btnPrimary} onClick={handleUpdate}>
              Atualizar
            </button>
          </div>
        </div>
      )}

      {/* Banner de instalação */}
      {showInstall && !needRefresh && (
        <div style={styles.banner}>
          <div style={styles.content}>
            <span style={styles.icon}>📲</span>
            <div>
              <p style={styles.title}>Instalar My Voice</p>
              <p style={styles.subtitle}>Acesse mais rápido diretamente da tela inicial.</p>
            </div>
          </div>
          <div style={styles.actions}>
            <button style={styles.btnSecondary} onClick={() => setShowInstall(false)}>
              Agora não
            </button>
            <button style={styles.btnPrimary} onClick={handleInstall}>
              Instalar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    width: 'calc(100% - 2rem)',
    maxWidth: '480px',
  },
  banner: {
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(139, 92, 246, 0.35)',
    borderRadius: '1rem',
    padding: '1rem 1.25rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  icon: {
    fontSize: '1.75rem',
    flexShrink: 0,
  },
  title: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: '0.9rem',
    margin: 0,
    fontFamily: "'Outfit', sans-serif",
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    margin: '0.2rem 0 0',
    fontFamily: "'Outfit', sans-serif",
  },
  actions: {
    display: 'flex',
    gap: '0.625rem',
    justifyContent: 'flex-end',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.5rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    boxShadow: '0 0 12px rgba(139,92,246,0.4)',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.625rem',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
  },
};

export default PWAPrompt;

