# JurChat Frontend

> Legal AI Application - React + TypeScript Frontend

Uma aplicação web moderna para análise jurídica de documentos com inteligência artificial, desenvolvida em React + TypeScript com integração a backend n8n.

## 🚀 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login e registro de usuários
- Autenticação baseada em sessão
- Proteção de rotas com guards
- Hash SHA-256 para dados sensíveis

### 📄 Upload de Documentos
- Interface drag & drop intuitiva
- Suporte a PDF, DOC e DOCX
- Validação de tipo e tamanho (limite 10MB)
- Múltiplos métodos de upload (XMLHttpRequest, Fetch)
- Barra de progresso e feedback em tempo real

### 🤖 Análise com IA
- Processamento automático de documentos
- Tradução para linguagem simples
- Resumo de cláusulas jurídicas
- Visualização do documento original
- Busca e destaque de texto

### 💬 Chat Inteligente
- Conversa com IA sobre documentos
- Contexto mantido durante a sessão
- Histórico de mensagens
- Respostas em tempo real

### 📱 Interface Responsiva
- Design moderno e intuitivo
- Compatível com mobile, tablet e desktop
- Tema profissional para contexto jurídico
- Estados de loading e feedback de erro

## 🛠️ Tecnologias Utilizadas

- **React 19.1.0** - Biblioteca principal
- **TypeScript 4.9.5** - Tipagem estática
- **React Router 7.6.3** - Roteamento SPA
- **Axios 1.10.0** - Cliente HTTP
- **Create React App** - Toolchain de desenvolvimento

## 📋 Pré-requisitos

- **Node.js** >= 16.18.0 (Recomendado: 18.x ou 20.x LTS)
- **npm** >= 8.0.0
- Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone [repository-url]
   cd jur-chat-frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o backend**
   - Atualize a `N8N_WEBHOOK_URL` em `src/services/api.ts`
   - Certifique-se de que o backend n8n está rodando

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```
   - Acesse http://localhost:3000
   - Hot reload habilitado

## 🏗️ Scripts Disponíveis

```bash
# Desenvolvimento
npm start          # Inicia servidor de desenvolvimento

# Build
npm run build      # Cria build de produção otimizado

# Testes
npm test           # Executa testes com Jest

# Ejeção (não recomendado)
npm run eject      # Ejeta configuração do Create React App
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── ProtectedRoute.tsx      # Guard de autenticação
├── pages/
│   ├── LoginPage.tsx           # Página de login
│   ├── RegisterPage.tsx        # Página de registro
│   ├── HomePage.tsx            # Dashboard principal
│   └── AppPage.tsx             # Interface de análise
├── services/
│   └── api.ts                  # Integração com backend
├── styles/
│   ├── globals.css             # Estilos globais
│   ├── LoginPage.css           # Estilos do login
│   ├── RegisterPage.css        # Estilos do registro
│   ├── HomePage.css            # Estilos da home
│   └── AppPage.css             # Estilos da análise
├── router.tsx                  # Configuração de rotas
└── App.tsx                     # Componente principal

public/
├── index.html                  # Template HTML
└── sha256.js                   # Utilitário de hash
```

## 🔗 Integração Backend (n8n)

O frontend integra com webhooks n8n para:

- **Login**: Autenticação de usuários
- **Registro**: Criação de novas contas
- **Histórico**: Lista de documentos do usuário
- **Upload**: Envio de arquivos
- **Análise**: Processamento de documentos
- **Chat**: Interação com IA

**Base URL**: `https://n8n.bernardolobo.com.br/webhook/`

## 🔒 Segurança

- **Hash SHA-256** para todos os dados sensíveis
- **Validação client-side** de arquivos
- **Sanitização** automática do React
- **Autenticação por sessão**
- **Rotas protegidas**

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Hosting Estático
- **Netlify**: Recomendado para simplicidade
- **Vercel**: Excelente para projetos React
- **GitHub Pages**: Para projetos open source
- **AWS S3 + CloudFront**: Para escala empresarial

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de módulo não encontrado**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Porta 3000 ocupada**
- Aceite usar porta alternativa quando perguntado
- Ou encerre processo na porta 3000

**Erros de TypeScript**
```bash
npm run build
# Corrija os erros mostrados
```

**Problemas de API**
- Verifique se backend está rodando
- Confirme URLs dos webhooks
- Verifique configuração CORS

---

**JurChat** - Transformando documentos jurídicos complexos em informação acessível através da inteligência artificial.
