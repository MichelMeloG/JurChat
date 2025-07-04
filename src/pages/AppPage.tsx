import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument, chatWithDocument, getOriginalDocument } from '../services/api';
import '../styles/AppPage.css';
import { FiArrowUpCircle, FiClock, FiLogOut, FiDownload, FiMenu, FiX } from 'react-icons/fi';

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
    // Check if this is a structured AI response
    if (content.includes('<INICIO_TRADUCAO_COLQUIAL>')) {
      // Extract original document text (everything before AI analysis markers)
      const beforeAnalysis = content.split('<INICIO_TRADUCAO_COLQUIAL>')[0].trim();
      
      // Clean the original text by removing common AI response patterns
      let originalText = beforeAnalysis;
      
      // Remove any response headers or metadata
      originalText = originalText
        .replace(/^(Aqui está|Segue|Documento:|Análise:|Texto:|Conteúdo:).*$/gim, '')
        .replace(/^(---|===|___)+$/gm, '')
        .replace(/^\s*[\n\r]+/gm, '\n')
        .trim();
      
      if (originalText && originalText.length > 50) {
        result.originalText = originalText;
      } else {
        result.originalText = 'Texto original extraído pelo sistema - conteúdo processado';
      }

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
    } else {
      // This might be raw document text or unstructured response
      result.originalText = content;
      result.traducaoColoquial = 'Este documento ainda não foi processado pela IA. Faça uma pergunta no chat para iniciar a análise.';
    }

    // If we couldn't extract the structured content but have markers, something went wrong
    if (content.includes('<INICIO_TRADUCAO_COLQUIAL>') && !result.traducaoColoquial) {
      result.traducaoColoquial = 'Erro ao processar a análise do documento. Tente recarregar a página.';
    }

  } catch (error) {
    console.error('Error parsing document content:', error);
    result.originalText = 'Erro ao processar documento';
    result.traducaoColoquial = 'Erro ao processar análise. Tente novamente.';
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
  const [parsedDocument, setParsedDocument] = useState<ParsedDocument | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'traducao' | 'clausulas' | 'original'>('traducao');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const documentName = id ? decodeURIComponent(id) : 'Novo documento';

  console.log('AppPage loaded with params:', { id, documentName });

  useEffect(() => {
    console.log('AppPage useEffect triggered with id:', id);
    if (id) {
      const fetchDocument = async () => {
        setIsLoading(true);
        try {
          const docName = decodeURIComponent(id);
          console.log('Fetching document with name:', docName);
          
          // Try to get original document text first
          let originalText = '';
          try {
            const originalDoc = await getOriginalDocument(docName);
            if (originalDoc && typeof originalDoc === 'string') {
              originalText = originalDoc;
              console.log('Original document text fetched successfully');
            }
          } catch (error) {
            console.log('Could not fetch original document text:', error);
          }
          
          // Get the processed document (with AI analysis)
          console.log('Fetching processed document...');
          let content;
          try {
            content = await getDocument(docName);
            console.log('Processed document fetched:', content ? 'success' : 'empty');
          } catch (error) {
            console.log('Error fetching document, using test content:', error);
            // Use test content for testing purposes
            content = `Este é um documento de teste: ${docName}
            
            <INICIO_TRADUCAO_COLQUIAL>
            Esta é uma tradução coloquial de teste para o documento ${docName}.
            O documento foi carregado com sucesso e está sendo exibido para teste.
            <FIM_TRADUCAO_COLQUIAL>
            
            <INICIO_RESUMO_CLAUSULAS>
            Cláusula 1: Documento de Teste::Esta é uma cláusula de teste que demonstra a funcionalidade.---CLAU.FIM---
            Cláusula 2: Navegação::Esta cláusula testa a navegação entre documentos.---CLAU.FIM---
            <FIM_RESUMO_CLAUSULAS>`;
          }
          
          // Parse the content and add original text if available
          const parsed = parseDocumentContent(content);
          if (originalText) {
            parsed.originalText = originalText;
          }
          setParsedDocument(parsed);
          console.log('Document parsed successfully:', { hasOriginal: !!parsed.originalText, hasTranslation: !!parsed.traducaoColoquial, clausulasCount: parsed.clausulas.length });
        } catch (error) {
          console.error('Error fetching document:', error);
          setParsedDocument({
            originalText: 'Erro ao carregar documento',
            traducaoColoquial: 'Erro ao carregar análise',
            clausulas: []
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchDocument();
    } else {
      console.log('No document ID provided');
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
    <div className="app-root-centered">
      <header className="navbar">
        <div className="navbar-logo" onClick={() => window.location.href = '/'}>Jurchat</div>
        
        {/* Desktop Navigation */}
        <nav className="navbar-menu desktop-menu">
          <button className="navbar-btn navbar-btn-active" onClick={() => window.location.href = '/JurChat'} style={{background: 'none', color: '#22223b', fontWeight: 500}}>
            <span className="navbar-btn-icon">
              <FiArrowUpCircle size={20} color="#22223b" />
            </span>
            Início
          </button>
          
        </nav>

        {/* Desktop User Section */}
        <div className="navbar-user desktop-user">
          <span>Olá, {sessionStorage.getItem('username')}</span>
          <button className="navbar-logout" onClick={() => { sessionStorage.removeItem('username'); window.location.href = '/login'; }}>
            <span className="navbar-logout-icon">
              <FiLogOut size={20} color="#475569" />
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
                <button 
                  className="mobile-nav-btn mobile-nav-btn-active" 
                  onClick={() => { window.location.href = '/JurChat'; setIsMobileMenuOpen(false); }}
                >
                  <span className="mobile-nav-icon">
                    <FiArrowUpCircle size={20} />
                  </span>
                  Início
                </button>
              </nav>
              <div className="mobile-user-section">
                <div className="mobile-user-greeting">
                  Olá, {sessionStorage.getItem('username')}
                </div>
                <button 
                  className="mobile-logout-btn" 
                  onClick={() => { sessionStorage.removeItem('username'); window.location.href = '/login'; }}
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
      <main className="app-main-centered">
        <div className="app-card app-card-flex">
          <div className="app-col app-col-left">
            <h2 className="panel-title">
              <span className="title-emoji">📄</span>
              <span className="title-text">Documento Original</span>
            </h2>
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                Carregando documento...
              </div>
            ) : (
              <div className="original-document-content">
                <div className="document-viewer">
                  <div className="document-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', textAlign: 'center' }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 500, fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                        Arquivo
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b', wordBreak: 'break-word', maxWidth: '100%' }}>
                        {documentName}
                        {parsedDocument?.originalText?.includes('processado') && (
                          <div style={{ fontSize: 12, color: '#059669', marginTop: 2 }}>(Processado pela IA)</div>
                        )}
                      </div>
                    </div>
                    <button 
                      className="download-button"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6, 
                        background: '#2563eb', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '8px 16px', 
                        fontWeight: 500, 
                        fontSize: 14, 
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        const textToDownload = parsedDocument?.originalText || 'Conteúdo não disponível';
                        const blob = new Blob([textToDownload], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${documentName}_original.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1d4ed8';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <FiDownload size={20} color="#fff" />
                      Baixar original
                    </button>
                  </div>
                  
                  <div className="document-text">
                    {parsedDocument?.originalText || 'Conteúdo não disponível'}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="app-col app-col-center">
            <div className="analysis-header">
              <h2 className="panel-title">
                <span className="title-emoji">🤖</span>
                <span className="title-text">Análise Jurídica</span>
              </h2>
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
                      <h3 className="section-title">
                        <span className="title-emoji">📝</span>
                        <span className="title-text">Tradução em Linguagem Simples</span>
                      </h3>
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
                      <h3 className="section-title">
                        <span className="title-emoji">📋</span>
                        <span className="title-text">Resumo das Cláusulas</span>
                      </h3>
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
          <div className="app-col app-col-right">
            <div className="chat-header">
              <h3 className="panel-title">
                <span className="title-emoji">💬</span>
                <span className="title-text">Chat com IA</span>
              </h3>
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
      </main>
    </div>
  );
};

export default AppPage;
