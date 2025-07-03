import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AppPage from './pages/AppPage';
import HistoricoPage from './pages/HistoricoPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppRouter: React.FC = () => {
  // Use basename only in production (GitHub Pages)
  const basename = process.env.NODE_ENV === 'production' ? '/JurChat' : '';
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/app/:id" element={<AppPage />} />
          <Route path="/historico" element={<HistoricoPage />} />
        </Route>
        {/* Redirect any unmatched routes to login or home based on auth */}
        <Route path="*" element={<Navigate to={sessionStorage.getItem('username') ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
