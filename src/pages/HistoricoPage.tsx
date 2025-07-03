import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHistory } from '../services/api';
import '../styles/HistoricoPage.css';
import { FiArrowUpCircle, FiClock, FiLogOut, FiUser, FiFileText, FiCalendar, FiArrowRight } from 'react-icons/fi';

interface Document {
  id: string;
  name: string;
  uploadDate: string;
}

const HistoricoPage: React.FC = () => {
  const [history, setHistory] = useState<Document[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const username = sessionStorage.getItem('username');
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    if (username) {
      setIsLoadingHistory(true);
      try {
        const data = await getHistory(username);
        setHistory(data.length ? data : []);
      } catch (error) {
        setHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  }, [username]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="historico-root-centered">
      <header className="navbar">
        <div className="navbar-logo" onClick={() => navigate('/')}>Jurchat</div>
        <nav className="navbar-menu">
          <button className="navbar-btn" onClick={() => navigate('/')}
            style={{background: 'none', color: '#22223b', fontWeight: 500}}>
            <span className="navbar-btn-icon">
              <FiArrowUpCircle size={20} color="#22223b" />
            </span>
            Dashboard
          </button>
          <button className="navbar-btn navbar-btn-active" style={{background: '#e0edff', color: '#2563eb', fontWeight: 600}}>
            <span className="navbar-btn-icon">
              <FiClock size={20} color="#2563eb" />
            </span>
            Histórico
          </button>
        </nav>
        <div className="navbar-user">
          <span>Olá, {username}</span>
          <button className="navbar-logout" onClick={() => { sessionStorage.removeItem('username'); navigate('/login'); }}>
            <span className="navbar-logout-icon">
              <FiLogOut size={20} color="#475569" />
            </span>
            Sair
          </button>
        </div>
      </header>
      <main className="historico-main-centered">
        <div className="historico-title-row">
          <span className="historico-title-icon">
            <FiClock size={40} color="#2563eb" />
          </span>
          <h1 className="historico-title">Histórico de Documentos</h1>
        </div>
        <div className="historico-card">
          <div className="historico-card-title">Documentos Analisados ({history.length})</div>
          {isLoadingHistory ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              Carregando documentos...
            </div>
          ) : history.length > 0 ? (
            <div className="historico-list">
              {history.map((doc) => {
                const documentPath = `/app/${encodeURIComponent(doc.name)}`;
                return (
                  <Link
                    key={doc.id}
                    to={documentPath}
                    className="historico-list-item"
                  >
                    <span className="historico-list-icon">
                      <FiFileText size={24} color="#2563eb" />
                    </span>
                    <span className="historico-list-name" style={{flex: 1, minWidth: 0}}>{doc.name}</span>
                    <span className="historico-list-date" style={{whiteSpace: 'nowrap', alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                      <span>Enviado em</span>
                      <span>{doc.uploadDate}</span>
                    </span>
                    <span className="historico-list-arrow">
                      <FiArrowRight size={20} color="#2563eb" />
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <p className="empty-state-text">Nenhum documento encontrado</p>
              <p className="empty-state-subtext">Faça upload do seu primeiro documento para começar</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoricoPage;
