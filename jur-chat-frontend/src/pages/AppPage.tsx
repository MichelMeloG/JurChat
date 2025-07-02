import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument, chatWithDocument } from '../services/api';
import '../styles/AppPage.css';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AppPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [documentContent, setDocumentContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const documentName = id ? decodeURIComponent(id) : 'Novo documento';

  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        setIsLoading(true);
        try {
          const content = await getDocument(decodeURIComponent(id));
          setDocumentContent(content);
        } catch (error) {
          console.error('Failed to fetch document', error);
          setDocumentContent('Erro ao carregar documento');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDocument();
    }
  }, [id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const response = await chatWithDocument(decodeURIComponent(id), inputMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response || 'Desculpe, não consegui processar sua pergunta.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Erro ao processar sua pergunta. Tente novamente.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">{documentName}</h1>
        <div className="app-nav">
          <Link to="/" className="nav-button">← Voltar</Link>
        </div>
      </div>

      <div className="app-content">
        <div className="document-panel">
          <h2 className="document-title">Conteúdo do Documento</h2>
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              Carregando documento...
            </div>
          ) : (
            <div className="document-content">
              {documentContent}
            </div>
          )}
        </div>

        <div className="chat-panel">
          <div className="chat-header">
            <h3 className="chat-title">Chat com IA</h3>
            <p className="chat-subtitle">Faça perguntas sobre o documento</p>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <p className="empty-state-text">Inicie uma conversa</p>
                <p className="empty-state-subtext">Faça perguntas sobre o documento</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.isUser ? 'user' : 'assistant'}`}
                >
                  <div className="message-avatar">
                    {message.isUser ? 'U' : 'IA'}
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            
            {isChatLoading && (
              <div className="message assistant">
                <div className="message-avatar">IA</div>
                <div className="message-content">
                  <div className="loading-spinner"></div>
                  Pensando...
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <div className="chat-input-container">
              <textarea
                className="chat-input"
                placeholder="Digite sua pergunta sobre o documento..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                disabled={isChatLoading}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isChatLoading}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPage;
