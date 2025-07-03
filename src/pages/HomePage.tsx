import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadFile, getHistory, testUploadEndpoint, uploadFileWithFetch, uploadFileDebug } from '../services/api';
import { debugAPIResponse } from '../debug';
import '../styles/HomePage.css';

interface Document {
  id: string;
  name: string;
  uploadDate: string;
  filePath?: string; // Add optional file path for better identification
}

const HomePage: React.FC = () => {
  const [history, setHistory] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    if (username) {
      setIsLoadingHistory(true);
      try {
        console.log('Fetching document history for username:', username);
        const data = await getHistory(username);
        console.log('History data received:', data);
        console.log('Number of documents:', data.length);
        
        if (data.length > 0) {
          console.log('Document names:', data.map(doc => doc.name));
        }
        
        // Add a test document if no documents are returned
        if (data.length === 0) {
          console.log('No documents found, adding test document');
          const testDoc: Document = {
            id: 'test-doc-1',
            name: 'Documento_Teste.pdf',
            uploadDate: new Date().toLocaleDateString('pt-BR'),
          };
          setHistory([testDoc]);
        } else {
          setHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch history', error);
        // Add a test document for debugging
        const testDoc: Document = {
          id: 'test-doc-fallback',
          name: 'Documento_Teste_Fallback.pdf',
          uploadDate: new Date().toLocaleDateString('pt-BR'),
        };
        setHistory([testDoc]);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  }, [username]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRefresh = () => {
    fetchHistory();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Por favor, selecione apenas arquivos PDF, DOC ou DOCX.');
        e.target.value = '';
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('O arquivo é muito grande. O limite é de 10MB.');
        e.target.value = '';
        return;
      }
      
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
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Por favor, selecione apenas arquivos PDF, DOC ou DOCX.');
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('O arquivo é muito grande. O limite é de 10MB.');
        return;
      }
      
      handleFileUploadDirect(file);
    }
  };

  const handleFileUploadDirect = async (file: File) => {
    if (file && username) {
      setIsUploading(true);
      try {
        console.log('Iniciando upload do arquivo:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        let result;
        try {
          // Try debug version first for better logging
          console.log('Tentando upload com versão debug...');
          result = await uploadFileDebug(file, username);
        } catch (debugError) {
          console.log('Debug upload falhou, tentando XMLHttpRequest normal...', debugError);
          try {
            result = await uploadFile(file, username);
          } catch (xhrError) {
            console.log('XMLHttpRequest falhou, tentando com fetch...', xhrError);
            result = await uploadFileWithFetch(file, username);
          }
        }
        
        console.log('Upload result:', result);
        
        // Add the new document to the history list immediately
        const newDocument: Document = {
          id: Date.now().toString(),
          name: file.name,
          uploadDate: new Date().toLocaleDateString('pt-BR')
        };
        setHistory(prev => [newDocument, ...prev]);
        
        // Show success message
        alert('Arquivo enviado com sucesso!');
        
        // Redirect to app page with the file name after a short delay
        setTimeout(() => {
          navigate(`/app/${encodeURIComponent(file.name)}`);
        }, 1000);
        
      } catch (error: any) {
        console.error('File upload failed', error);
        let errorMessage = 'Erro no upload do arquivo. Tente novamente.';
        
        if (error.message) {
          if (error.message.includes('413') || error.message.includes('too large')) {
            errorMessage = 'Arquivo muito grande. O limite é de 10MB.';
          } else if (error.message.includes('415') || error.message.includes('unsupported')) {
            errorMessage = 'Tipo de arquivo não suportado. Use apenas PDF, DOC ou DOCX.';
          } else if (error.message.includes('Network Error')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Timeout: O upload demorou muito. Tente com um arquivo menor.';
          } else if (error.message.includes('HTTP Error')) {
            errorMessage = `Erro do servidor: ${error.message}`;
          }
        }
        
        alert(errorMessage);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    navigate('/login');
  };

  const handleTestEndpoint = async () => {
    try {
      const result = await testUploadEndpoint();
      if (result.success) {
        alert('Endpoint está funcionando: ' + JSON.stringify(result.data));
      } else {
        alert('Endpoint com erro: ' + result.error);
      }
    } catch (error) {
      alert('Erro ao testar endpoint: ' + error);
    }
  };

  const handleDebugHistory = async () => {
    try {
      console.log('=== DEBUG HISTORY ===');
      console.log('Username:', username);
      if (username) {
        const data = await debugAPIResponse(username);
        console.log('Debug result:', data);
        alert('Dados do histórico (veja o console): ' + JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      alert('Erro ao buscar histórico: ' + error);
    }
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
      
      <div className="home-content">          <div className="upload-section">
          <h2 className="upload-title">Novo Documento</h2>
          <button onClick={handleTestEndpoint} style={{marginBottom: '10px', padding: '5px 10px'}}>
            Testar Endpoint
          </button>
          <button onClick={handleDebugHistory} style={{marginBottom: '10px', marginLeft: '10px', padding: '5px 10px'}}>
            Debug Histórico
          </button>
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
              {history.map((doc) => {
                const documentPath = `/app/${encodeURIComponent(doc.name)}`;
                console.log('Rendering document:', doc.name, 'Path:', documentPath);
                
                return (
                  <Link 
                    key={doc.id} 
                    to={documentPath}
                    className="history-item"
                    onClick={(e) => {
                      console.log('Clicked on document:', doc.name);
                      console.log('Navigating to:', documentPath);
                      // Allow the Link to handle navigation naturally
                    }}
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
      </div>
    </div>
  );
};

export default HomePage;
