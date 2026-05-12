import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Registro do Service Worker para funcionalidade PWA
// Registra apenas em produção para evitar problemas em desenvolvimento
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);
        
        // Verifica por atualizações a cada 6 horas
        setInterval(() => {
          registration.update().catch(err => {
            console.warn('[PWA] Erro ao verificar atualizações:', err);
          });
        }, 6 * 60 * 60 * 1000);
      })
      .catch(error => {
        console.warn('[PWA] Falha no registro do Service Worker:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
