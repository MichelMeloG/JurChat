import React, { useState } from 'react';
import DocumentList from './DocumentList';
import DocumentViewer from './DocumentViewer';
import FileUpload from './FileUpload';

const Dashboard = ({ username, onLogout }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleDocumentSelect = (documentName) => {
    setSelectedDocument(documentName);
  };

  const handleBackToList = () => {
    setSelectedDocument(null);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    // Refresh the document list by forcing a re-render
    setSelectedDocument(null);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>JurChat - Assistente Jurídico</h1>
        <div className="user-info">
          <span>Usuário: {username}</span>
          <button onClick={onLogout} className="logout-button">
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {selectedDocument ? (
          <DocumentViewer 
            documentName={selectedDocument} 
            onBack={handleBackToList}
          />
        ) : showUpload ? (
          <div>
            <button onClick={() => setShowUpload(false)} className="back-button">
              ← Voltar
            </button>
            <FileUpload 
              username={username} 
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        ) : (
          <div className="dashboard-content">
            <div className="actions">
              <button 
                onClick={() => setShowUpload(true)}
                className="upload-button"
              >
                Carregar Novo Documento
              </button>
            </div>
            <DocumentList 
              username={username} 
              onDocumentSelect={handleDocumentSelect}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
