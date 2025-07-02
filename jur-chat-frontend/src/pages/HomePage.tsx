import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadFile, getHistory } from '../services/api';
import '../styles/HomePage.css';

interface Document {
  id: string;
  name: string;
}

const HomePage: React.FC = () => {
  const [history, setHistory] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    if (username) {
      const fetchHistory = async () => {
        try {
          const data = await getHistory(username);
          // Handle the response format from the API
          if (Array.isArray(data)) {
            setHistory(data);
          } else if (typeof data === 'string') {
            // Parse the response if it's a string with document names
            const documents = data.split('\n').filter(name => name.trim()).map((name, index) => ({
              id: `${index + 1}`,
              name: name.trim()
            }));
            setHistory(documents);
          }
        } catch (error) {
          console.error('Failed to fetch history', error);
        }
      };
      fetchHistory();
    }
  }, [username]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && username) {
      setIsUploading(true);
      try {
        await uploadFile(file, username);
        // Redirect to app page with the file name
        window.location.href = `/app/${encodeURIComponent(file.name)}`;
      } catch (error) {
        console.error('File upload failed', error);
        alert('Erro no upload do arquivo. Tente novamente.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <h1 className="home-title">JurChat</h1>
          <p className="home-subtitle">Bem-vindo, {username}!</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </div>
      
      <div className="home-content">
        <div className="upload-section">
          <h2 className="upload-title">Novo Documento</h2>
          <div className="file-upload-area">
            <div className="upload-icon">📄</div>
            <p className="upload-text">
              {isUploading ? 'Enviando arquivo...' : 'Clique para selecionar um arquivo'}
            </p>
            <p className="upload-subtext">PDF, DOC, DOCX até 10MB</p>
            <input
              type="file"
              className="file-input"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              disabled={isUploading}
            />
          </div>
        </div>
        
        <div className="history-section">
          <h2 className="history-title">
            📚 Histórico de Documentos
          </h2>
          
          {history.length > 0 ? (
            <div className="history-list">
              {history.map((doc) => (
                <Link 
                  key={doc.id} 
                  to={`/app/${encodeURIComponent(doc.name)}`}
                  className="history-item"
                >
                  <div className="history-item-icon">
                    📄
                  </div>
                  <div className="history-item-content">
                    <div className="history-item-name">{doc.name}</div>
                    <div className="history-item-date">Clique para abrir</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <p className="empty-state-text">Nenhum documento encontrado</p>
              <p className="empty-state-subtext">Faça upload do seu primeiro documento para começar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
