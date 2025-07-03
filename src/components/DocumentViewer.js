import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const DocumentViewer = ({ documentName, onBack }) => {
  const [documentContent, setDocumentContent] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadDocumentContent();
  }, [documentName]);

  const loadDocumentContent = async () => {
    try {
      setLoading(true);
      const content = await apiService.getDocumentDetails(documentName);
      setDocumentContent(content);
    } catch (error) {
      console.error('Error loading document content:', error);
      setDocumentContent('Erro ao carregar o conteúdo do documento.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      setChatLoading(true);
      const response = await apiService.chatWithDocument(documentName, chatInput);
      setChatResponse(response);
    } catch (error) {
      console.error('Error chatting with document:', error);
      setChatResponse('Erro ao processar sua pergunta. Tente novamente.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="document-viewer">
      <div className="document-header">
        <button onClick={onBack} className="back-button">
          ← Voltar
        </button>
        <h2>{documentName}</h2>
      </div>

      <div className="document-content">
        <h3>Conteúdo do Documento</h3>
        {loading ? (
          <p>Carregando conteúdo...</p>
        ) : (
          <div className="content-display">
            <pre>{documentContent}</pre>
          </div>
        )}
      </div>

      <div className="chat-section">
        <h3>Faça uma pergunta sobre o documento</h3>
        <form onSubmit={handleChat}>
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Digite sua pergunta aqui..."
            rows="3"
            disabled={chatLoading}
          />
          <button type="submit" disabled={chatLoading || !chatInput.trim()}>
            {chatLoading ? 'Processando...' : 'Enviar'}
          </button>
        </form>

        {chatResponse && (
          <div className="chat-response">
            <h4>Resposta:</h4>
            <p>{chatResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
