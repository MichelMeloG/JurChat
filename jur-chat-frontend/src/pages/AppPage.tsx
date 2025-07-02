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

interface ParsedDocument {
  originalText: string;
  traducaoColoquial: string;
  clausulas: Array<{
    titulo: string;
    resumo: string;
  }>;
}

const parseDocumentContent = (content: string): ParsedDocument => {
  const result: ParsedDocument = {
    originalText: '',
    traducaoColoquial: '',
    clausulas: []
  };

  try {
    // Extract tradução coloquial
    const traducaoMatch = content.match(/<INICIO_TRADUCAO_COLQUIAL>([\s\S]*?)<FIM_TRADUCAO_COLQUIAL>/);
    if (traducaoMatch) {
      result.traducaoColoquial = traducaoMatch[1].trim();
    }

    // Extract cláusulas
    const clausulasMatch = content.match(/<INICIO_RESUMO_CLAUSULAS>([\s\S]*?)<FIM_RESUMO_CLAUSULAS>/);
    if (clausulasMatch) {
      const clausulasText = clausulasMatch[1];
      const clausulasArray = clausulasText.split('---CLAU.FIM---');
      
      clausulasArray.forEach(clausulaText => {
        const trimmed = clausulaText.trim();
        if (trimmed) {
          const parts = trimmed.split('::');
          if (parts.length >= 2) {
            result.clausulas.push({
              titulo: parts[0].trim(),
              resumo: parts.slice(1).join('::').trim()
            });
          }
        }
      });
    }

    // For original text, we'll extract the raw document text if available
    // or use the full content as fallback
    result.originalText = content;

    // If we couldn't parse the structured content, put everything in tradução
    if (!result.traducaoColoquial && !result.clausulas.length) {
      result.traducaoColoquial = content;
    }

  } catch (error) {
    console.error('Error parsing document content:', error);
    result.originalText = content;
    result.traducaoColoquial = content;
  }

  return result;
};

// Helper function to format text with line breaks
const formatText = (text: string): string => {
  return text
    .replace(/\n\n/g, '\n\n') // Preserve paragraph breaks
    .replace(/\n/g, '\n') // Preserve line breaks
    .trim();
};

// Helper function to highlight search terms
const highlightText = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const AppPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [rawDocumentContent, setRawDocumentContent] = useState('');
  const [parsedDocument, setParsedDocument] = useState<ParsedDocument | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'traducao' | 'clausulas' | 'original'>('traducao');
  const [searchTerm, setSearchTerm] = useState('');

  const documentName = id ? decodeURIComponent(id) : 'Novo documento';

  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        setIsLoading(true);
        try {
          const content = await getDocument(decodeURIComponent(id));
          setRawDocumentContent(content);
          const parsed = parseDocumentContent(content);
          setParsedDocument(parsed);
        } catch (error) {
          console.error('Failed to fetch document', error);
          setRawDocumentContent('Erro ao carregar documento');
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
        {/* Documento Original - Lado Esquerdo */}
        <div className="original-document-panel">
          <h2 className="panel-title">📄 Documento Original</h2>
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              Carregando documento...
            </div>
          ) : (
            <div className="original-document-content">
              <div className="document-viewer">
                <p className="document-info">
                  <strong>Arquivo:</strong> {documentName}
                  <button 
                    className="download-button"
                    onClick={() => {
                      const blob = new Blob([rawDocumentContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${documentName}_original.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    📥 Baixar
                  </button>
                </p>
                <div className="document-text">
                  {rawDocumentContent || 'Conteúdo não disponível'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Análise do Documento - Centro */}
        <div className="analysis-panel">
          <div className="analysis-header">
            <h2 className="panel-title">🤖 Análise Jurídica</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Buscar no documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'traducao' ? 'active' : ''}`}
                onClick={() => setActiveTab('traducao')}
              >
                Tradução Simples
              </button>
              <button 
                className={`tab-button ${activeTab === 'clausulas' ? 'active' : ''}`}
                onClick={() => setActiveTab('clausulas')}
              >
                Resumo das Cláusulas
              </button>
            </div>
          </div>

          <div className="analysis-content">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                Processando análise...
              </div>
            ) : (
              <>
                {activeTab === 'traducao' && (
                  <div className="traducao-section">
                    <h3 className="section-title">Tradução em Linguagem Simples</h3>
                    <div 
                      className="traducao-content"
                      dangerouslySetInnerHTML={{
                        __html: parsedDocument?.traducaoColoquial ? 
                          highlightText(formatText(parsedDocument.traducaoColoquial), searchTerm) : 
                          'Tradução não disponível'
                      }}
                    />
                  </div>
                )}

                {activeTab === 'clausulas' && (
                  <div className="clausulas-section">
                    <h3 className="section-title">Resumo das Cláusulas</h3>
                    <div className="clausulas-content">
                      {parsedDocument?.clausulas && parsedDocument.clausulas.length > 0 ? (
                        parsedDocument.clausulas
                          .filter(clausula => 
                            !searchTerm.trim() || 
                            clausula.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            clausula.resumo.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((clausula, index) => (
                            <div key={index} className="clausula-item">
                              <h4 
                                className="clausula-titulo"
                                dangerouslySetInnerHTML={{
                                  __html: highlightText(clausula.titulo, searchTerm)
                                }}
                              />
                              <p 
                                className="clausula-resumo"
                                dangerouslySetInnerHTML={{
                                  __html: highlightText(formatText(clausula.resumo), searchTerm)
                                }}
                              />
                            </div>
                          ))
                      ) : (
                        <p className="no-content">
                          {searchTerm.trim() ? 'Nenhuma cláusula encontrada para a busca' : 'Nenhuma cláusula encontrada'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat - Lado Direito */}
        <div className="chat-panel">
          <div className="chat-header">
            <h3 className="panel-title">💬 Chat com IA</h3>
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
                    {message.isUser ? '👤' : '🤖'}
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            
            {isChatLoading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
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
                rows={2}
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
