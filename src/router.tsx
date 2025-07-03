import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AppPage from './pages/AppPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/app/:id" element={<AppPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
