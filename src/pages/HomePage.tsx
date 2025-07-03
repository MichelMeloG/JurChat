import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadFile, testUploadEndpoint, uploadFileWithFetch, uploadFileDebug, getHistory } from '../services/api';
import { FiArrowUpCircle, FiClock, FiLogOut, FiUpload, FiMenu, FiX, FiFileText, FiArrowRight } from 'react-icons/fi';
import '../styles/HomePage.css';

interface Document {
  id: string;
  name: string;
  uploadDate: string;
}

const HomePage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [history, setHistory] = useState<Document[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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
        
        // Show success message
        // alert('Arquivo enviado com sucesso!');
        
        // Redirect to app page with the file name after a short delay
        setTimeout(() => {
          navigate(`/app/${encodeURIComponent(file.name)}`);
          // Refresh history after successful upload
          fetchHistory();
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

  return (
    <div className="home-root-centered">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-logo">Jurchat</div>
        
        {/* Desktop Navigation */}
        

        {/* Desktop User Section */}
        <div className="navbar-user desktop-user">
          <span>Olá, {username}</span>
          <button className="navbar-logout" onClick={handleLogout}>
            <span className="navbar-logout-icon">
              <FiLogOut size={20} color="#64748b" />
            </span>
            Sair
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="mobile-menu">
              <nav className="mobile-nav">
                
              </nav>
              <div className="mobile-user-section">
                <div className="mobile-user-greeting">
                  Olá, {username}
                </div>
                <button 
                  className="mobile-logout-btn" 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                >
                  <span className="mobile-logout-icon">
                    <FiLogOut size={20} />
                  </span>
                  Sair
                </button>
              </div>
            </div>
          </>
        )}
      </header>
      {/* Card centralizado */}
      <main className="upload-main-centered">
        <div className="upload-card-centered">
          <h2 className="upload-card-title">Upload de Documento</h2>
          {isUploading ? (
            <div className="upload-loading-state">
              <div className="upload-loading-spinner"></div>
              <div className="upload-loading-text">Enviando arquivo...</div>
            </div>
          ) : (
            <>
              <div className={`file-upload-area-centered ${isDragOver ? 'dragover' : ''}`}
                onClick={handleFileAreaClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
              >
                <div className="upload-card-uploadicon">
                  <FiUpload size={40} color="#667eea" />
                </div>
                <div className="upload-card-text-main">Arraste seu PDF aqui</div>
                <div className="upload-card-text-sub">ou clique para selecionar um arquivo</div>
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
            </>
          )}
        </div>
        
        {/* História Section */}
        <div className="history-section">
          <div className="history-card">
            <div className="history-title">Documentos Analisados ({history.length})</div>
            {isLoadingHistory ? (
              <div className="history-loading-state">
                <div className="history-loading-spinner"></div>
                Carregando documentos...
              </div>
            ) : history.length > 0 ? (
              <div className="history-list">
                {history.map((doc) => {
                  const documentPath = `/app/${encodeURIComponent(doc.name)}`;
                  return (
                    <Link
                      key={doc.id}
                      to={documentPath}
                      className="history-list-item"
                    >
                      <span className="history-list-icon">
                        <FiFileText size={24} color="#667eea" />
                      </span>
                      <span className="history-list-name">{doc.name}</span>
                      <div className="history-list-meta">
                        <span className="history-list-date">
                          <span>Enviado em</span>
                          <span>{doc.uploadDate}</span>
                        </span>
                        <span className="history-list-arrow">
                          <FiArrowRight size={20} color="#667eea" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty-state">
                <div className="history-empty-state-icon">📂</div>
                <p className="history-empty-state-text">Nenhum documento encontrado</p>
                <p className="history-empty-state-subtext">Faça upload do seu primeiro documento para começar</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
