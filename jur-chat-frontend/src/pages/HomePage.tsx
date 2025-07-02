import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadFile, getHistory } from '../services/api';
import '../styles/HomePage.css';

interface Document {
  id: string;
  name: string;
  uploadDate: string;
}

const HomePage: React.FC = () => {
  const [history, setHistory] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const username = sessionStorage.getItem('username');

  const fetchHistory = async () => {
    if (username) {
      setIsLoadingHistory(true);
      try {
        const data = await getHistory(username);
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch history', error);
        setHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [username]);

  const handleRefresh = () => {
    fetchHistory();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUploadDirect(file);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleFileAreaClick = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        handleFileUploadDirect(file);
      } else {
        alert('Por favor, selecione apenas arquivos PDF, DOC ou DOCX.');
      }
    }
  };

  const handleFileUploadDirect = async (file: File) => {
    if (file && username) {
      setIsUploading(true);
      try {
        await uploadFile(file, username);
        
        // Add the new document to the history list immediately
        const newDocument: Document = {
          id: Date.now().toString(),
          name: file.name,
          uploadDate: new Date().toLocaleDateString('pt-BR')
        };
        setHistory(prev => [newDocument, ...prev]);
        
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
          <div 
            className={`file-upload-area ${isDragOver ? 'dragover' : ''}`}
            onClick={handleFileAreaClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
          >
            <div className="upload-icon">📄</div>
            <p className="upload-text">
              {isUploading ? 'Enviando arquivo...' : 
               isDragOver ? 'Solte o arquivo aqui' : 
               'Clique ou arraste um arquivo aqui'}
            </p>
            <p className="upload-subtext">PDF, DOC, DOCX até 10MB</p>
          </div>
          <input
            id="file-input"
            type="file"
            className="file-input"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            disabled={isUploading}
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="history-section">
          <div className="history-header">
            <h2 className="history-title">
              📚 Histórico de Documentos
            </h2>
            <button 
              onClick={handleRefresh} 
              className="refresh-button"
              disabled={isLoadingHistory}
            >
              {isLoadingHistory ? '⟳' : '↻'} Atualizar
            </button>
          </div>
          
          {isLoadingHistory ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              Carregando documentos...
            </div>
          ) : history.length > 0 ? (
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
                    <div className="history-item-date">Enviado em: {doc.uploadDate}</div>
                  </div>
                  <div className="history-item-action">
                    →
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
