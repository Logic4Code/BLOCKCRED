import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import InstitutionDashboard from './pages/institution/Dashboard';
import IssueCredential from './pages/institution/IssueCredential';
import BlockExplorer from './pages/institution/BlockExplorer';
import RegisterStudent from './pages/institution/RegisterStudent';
import StudentDashboard from './pages/student/Dashboard';
import EmployerPortal from './pages/employer/VerifyPortal';
import PublicVerify from './pages/PublicVerify';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
      <div className="text-cyber-cyan animate-pulse font-mono">Initializing BlockCred...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />
      <Route path="/verify/:hash" element={<PublicVerify />} />

      {/* Institution */}
      <Route path="/institution" element={<ProtectedRoute allowedRoles={['institution']}><InstitutionDashboard /></ProtectedRoute>} />
      <Route path="/institution/issue" element={<ProtectedRoute allowedRoles={['institution']}><IssueCredential /></ProtectedRoute>} />
      <Route path="/institution/explorer" element={<ProtectedRoute allowedRoles={['institution']}><BlockExplorer /></ProtectedRoute>} />
      <Route path="/institution/register-student" element={<ProtectedRoute allowedRoles={['institution']}><RegisterStudent /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />

      {/* Employer */}
      <Route path="/employer" element={<EmployerPortal />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1729',
              color: '#ffffff',
              border: '1px solid rgba(0,229,255,0.2)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#00ff9d', secondary: '#0a0a1a' } },
            error: { iconTheme: { primary: '#ff4444', secondary: '#0a0a1a' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
