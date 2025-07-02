import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.bernardolobo.com.br/webhook'; // TODO: Replace with your n8n webhook URL

// Import SHA-256 function from sha256.js
declare global {
  function hex_sha256(s: string): string;
}

export const login = async (username: string, password: string) => {
  const encryptedPassword = hex_sha256(password);
  const response = await axios.post(`${N8N_WEBHOOK_URL}/b7c0c5d6-9835-4b26-b0ee-ccaf8829ca82`, {
    username,
    password: encryptedPassword,
  });
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const encryptedPassword = hex_sha256(password);
  const response = await axios.post(`${N8N_WEBHOOK_URL}/d746f1fe-5fab-49e7-894b-696aecb92a9d`, {
    username,
    email,
    password: encryptedPassword,
  });
  return response.data;
};

export const getHistory = async (username: string) => {
  const response = await axios.post(`${N8N_WEBHOOK_URL}/c9eaf6ab-21bd-4817-8c7c-16b36019a113`, {
    username,
  });
  return response.data;
};

export const getDocument = async (nome_documento: string) => {
  const response = await axios.post(`${N8N_WEBHOOK_URL}/156dfa37-7384-4c2f-bcf2-ade46e6d7f4e`, {
    nome_documento,
  });
  return response.data;
};

export const uploadFile = async (file: File, username: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('username', username);
  formData.append('nome_documento', file.name);
  formData.append('is_file', 'true');

  const response = await axios.post(`${N8N_WEBHOOK_URL}/ad577ad7-3860-48b8-88a3-0e4760aea239`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const chatWithDocument = async (nome_documento: string, chat_input: string) => {
  const response = await axios.post(`${N8N_WEBHOOK_URL}/26d37223-c353-40db-9ffe-6d07daffd1b2`, {
    nome_documento,
    chat_input,
  });
  return response.data;
};
