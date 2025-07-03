import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(username, password);
      if (response.confirmation === 'True') {
        sessionStorage.setItem('username', username);
        navigate('/');
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Login failed', error);
      alert('Erro no login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Bem-vindo de volta</h1>
          <p className="login-subtitle">Entre na sua conta para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              className="input"
              placeholder="Digite seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              className="input"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="login-footer-text">
            Não tem uma conta?
            <Link to="/register" className="login-footer-link">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
