import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trilha from './pages/Trilha';
import AdminDashboard from './pages/AdminDashboard';

const Loader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', color: '#8b5cf6', fontSize: '1rem', gap: '0.75rem'
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
    Carregando…
  </div>
);

const PrivateRoute = ({ children, requireRole }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && profile?.role !== requireRole) return <Navigate to="/" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, profile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <Loader />;
  if (profile.role === 'professor') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<RootRedirect />} />
    <Route path="/dashboard" element={<PrivateRoute requireRole="aluno"><Dashboard /></PrivateRoute>} />
    <Route path="/trilha" element={<PrivateRoute requireRole="aluno"><Trilha /></PrivateRoute>} />
    <Route path="/admin" element={<PrivateRoute requireRole="professor"><AdminDashboard /></PrivateRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
