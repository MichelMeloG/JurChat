import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const DocumentList = ({ username, onDocumentSelect }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [username]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const userDocuments = await apiService.getUserDocuments(username);
      setDocuments(userDocuments);
    } catch (err) {
      setError('Erro ao carregar documentos: ' + err.message);
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (documentName) => {
    onDocumentSelect(documentName);
  };

  if (loading) {
    return (
      <div className="document-list loading">
        <p>Carregando documentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-list error">
        <p>{error}</p>
        <button onClick={loadDocuments}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="document-list">
      <h3>Meus Documentos</h3>
      {documents.length === 0 ? (
        <p>Nenhum documento encontrado.</p>
      ) : (
        <ul>
          {documents.map((doc, index) => (
            <li key={index} className="document-item">
              <button 
                onClick={() => handleDocumentClick(doc)}
                className="document-button"
              >
                {doc}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={loadDocuments} className="refresh-button">
        Atualizar lista
      </button>
    </div>
  );
};

export default DocumentList;
