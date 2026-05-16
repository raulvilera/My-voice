import { createContext, useContext, useEffect, useState } from 'react';

const PwaContext = createContext(null);

export const PwaProvider = ({ children }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // 1. Verifica se já temos o prompt capturado pelo index.html
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      setCanInstall(true);
    }

    // 2. Ouve por novos eventos ou notificações do index.html
    const handlePrompt = () => {
      if (window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt);
        setCanInstall(true);
      }
    };

    const handleInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('pwa-prompt-available', handlePrompt);
    window.addEventListener('pwa-installed', handleInstalled);

    // Detecção básica de iOS (onde beforeinstallprompt não existe)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (isIOS && !isStandalone) {
      // No iOS, podemos mostrar um botão que ensina a adicionar à tela de início
      setCanInstall(true); 
    }

    return () => {
      window.removeEventListener('pwa-prompt-available', handlePrompt);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('[PWA] Usuário aceitou a instalação');
      }
      setDeferredPrompt(null);
      setCanInstall(false);
    } else {
      // Fallback para iOS ou navegadores sem prompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert('Para instalar:\n1. Toque no botão "Compartilhar" (ícone de quadrado com seta)\n2. Role para baixo e toque em "Adicionar à Tela de Início".');
      } else {
        alert('Para instalar este aplicativo, use o menu do seu navegador e selecione "Instalar" ou "Adicionar à tela de início".');
      }
    }
  };

  return (
    <PwaContext.Provider value={{ canInstall, isInstalled, installApp }}>
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) throw new Error('usePwa must be used within PwaProvider');
  return context;
};
