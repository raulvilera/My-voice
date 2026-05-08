import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trilha from './pages/Trilha';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children, requireRole }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'#aaa'}}>Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && profile?.role !== requireRole) return <Navigate to="/" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'#aaa'}}>Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'professor') return <Navigate to="/admin" replace />;
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
