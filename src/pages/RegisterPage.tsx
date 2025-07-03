import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import '../styles/RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await register(name, email, password);
      if (response.confirmation === 'True') {
        sessionStorage.setItem('username', name);
        navigate('/');
      } else {
        alert('Falha no cadastro');
      }
    } catch (error) {
      console.error('Registration failed', error);
      alert('Erro no cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Criar Conta</h1>
          <p className="register-subtitle">Preencha os dados para se cadastrar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="form-label">Nome de usuário</label>
            <input
              type="text"
              className="input"
              placeholder="Digite seu nome de usuário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Senha</label>
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
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        
        <div className="register-footer">
          <p className="register-footer-text">
            Já tem uma conta?
            <Link to="/login" className="register-footer-link">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
