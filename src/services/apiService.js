const API_BASE_URL = 'http://localhost:5678/webhook'; // Adjust to your n8n URL

export const apiService = {
  // Register user
  async registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/d746f1fe-5fab-49e7-894b-696aecb92a9d`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Login user
  async loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/b7c0c5d6-9835-4b26-b0ee-ccaf8829ca82`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  // Upload document
  async uploadDocument(formData) {
    const response = await fetch(`${API_BASE_URL}/ad577ad7-3860-48b8-88a3-0e4760aea239`, {
      method: 'POST',
      body: formData,
    });
    return response.text();
  },

  // Get user documents list
  async getUserDocuments(username) {
    const response = await fetch(`${API_BASE_URL}/c9eaf6ab-21bd-4817-8c7c-16b36019a113`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    const result = await response.text();
    
    // Parse the aggregated response from n8n
    // The API returns aggregated data, so we need to parse it
    try {
      const parsed = JSON.parse(result);
      return parsed.nome_documento || [];
    } catch (error) {
      // If it's a simple string response, split by newlines or commas
      return result.split('\n').filter(doc => doc.trim() !== '');
    }
  },

  // Get document details
  async getDocumentDetails(documentName) {
    const response = await fetch(`${API_BASE_URL}/156dfa37-7384-4c2f-bcf2-ade46e6d7f4e`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome_documento: documentName }),
    });
    return response.text();
  },

  // Chat with document
  async chatWithDocument(documentName, chatInput) {
    const response = await fetch(`${API_BASE_URL}/26d37223-c353-40db-9ffe-6d07daffd1b2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nome_documento: documentName,
        chat_input: chatInput 
      }),
    });
    return response.text();
  },
};
