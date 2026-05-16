import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';

// Lazy loading das páginas principais
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trilha = lazy(() => import('./pages/Trilha'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const Loader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', color: '#8b5cf6', fontSize: '1rem', gap: '0.75rem',
    background: '#0f172a',
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
    Carregando…
  </div>
);

// Rota protegida — aguarda loading antes de decidir
// Não bloqueia por role se profile ainda não chegou (evita loop)
const PrivateRoute = ({ children, requireRole }) => {
  const { user, profile, loading } = useAuth();

  // Aguarda autenticação inicial
  if (loading) return <Loader />;

  // Não autenticado → login
  if (!user) return <Navigate to="/login" replace />;

  // Se exige role E profile já carregou E role não bate → redireciona
  if (requireRole && profile && profile.role !== requireRole) {
    const destino = profile.role === 'professor' ? '/admin' : '/dashboard';
    return <Navigate to={destino} replace />;
  }

  // Profile ainda não carregou mas usuário está logado → deixa entrar
  // (o componente interno lida com dados ausentes)
  return children;
};

const RootRedirect = () => {
  const { user, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'aluno') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/admin" replace />;
};

const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/login"     element={<Login />} />
      <Route path="/"          element={<RootRedirect />} />
      <Route path="/dashboard" element={<PrivateRoute requireRole="aluno"><Dashboard /></PrivateRoute>} />
      <Route path="/trilha"    element={<PrivateRoute requireRole="aluno"><Trilha /></PrivateRoute>} />
      <Route path="/admin"     element={<PrivateRoute requireRole="professor"><AdminDashboard /></PrivateRoute>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);
export default App;
