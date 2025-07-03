import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.bernardolobo.com.br/webhook'; // TODO: Replace with your n8n webhook URL

// Import SHA-256 function from sha256.js
declare global {
  function hex_sha256(s: string): string;
}

export const login = async (username: string, password: string) => {
  const encryptedUsername = hex_sha256(username);
  const encryptedPassword = hex_sha256(password);
  const response = await axios.post(`${N8N_WEBHOOK_URL}/b7c0c5d6-9835-4b26-b0ee-ccaf8829ca82`, {
    username: encryptedUsername,
    password: encryptedPassword,
  });
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const encryptedUsername = hex_sha256(username);
  const encryptedEmail = hex_sha256(email);
  const encryptedPassword = hex_sha256(password);
  const response = await axios.post(`${N8N_WEBHOOK_URL}/d746f1fe-5fab-49e7-894b-696aecb92a9d`, {
    username: encryptedUsername,
    email: encryptedEmail,
    password: encryptedPassword,
  });
  return response.data;
};

export const getHistory = async (username: string) => {
  const encryptedUsername = hex_sha256(username);
  const response = await axios.post(`${N8N_WEBHOOK_URL}/c9eaf6ab-21bd-4817-8c7c-16b36019a113`, {
    username: encryptedUsername,
  });
  
  console.log('Raw API response for getHistory:', response.data);
  console.log('Response type:', typeof response.data);
  
  // Process the response to return a consistent format
  if (typeof response.data === 'string') {
    console.log('Processing string response...');
    // If it's a string with document names separated by newlines or commas
    const documentNames = response.data
      .split(/[\n,]/)
      .filter(name => name.trim() !== '')
      .map((name, index) => ({
        id: (index + 1).toString(),
        name: name.trim(),
        uploadDate: new Date().toLocaleDateString('pt-BR') // Placeholder date
      }));
    console.log('Processed document names:', documentNames);
    return documentNames;
  } else if (Array.isArray(response.data)) {
    console.log('Processing array response...');
    console.log('Array items:', response.data);
    
    // If the array contains strings (just file names)
    if (response.data.length > 0 && typeof response.data[0] === 'string') {
      console.log('Array contains strings (file names)');
      return response.data.map((name, index) => ({
        id: (index + 1).toString(),
        name: name.trim(),
        uploadDate: new Date().toLocaleDateString('pt-BR')
      }));
    }
    
    // If it's already an array of objects
    const processedData = response.data.map((item, index) => {
      console.log(`Processing item ${index}:`, item);
      
      // If item is just a string
      if (typeof item === 'string') {
        return {
          id: (index + 1).toString(),
          name: item.trim(),
          uploadDate: new Date().toLocaleDateString('pt-BR')
        };
      }
      
      // Try different possible field names for document name
      let documentName = item.name || 
                        item.nome_documento || 
                        item.filename || 
                        item.fileName || 
                        item.file_name ||
                        item.document_name ||
                        item.titulo ||
                        item.title ||
                        (typeof item === 'string' ? item : `Documento ${index + 1}`);
      
      // Try different possible field names for upload date
      let uploadDate = item.uploadDate || 
                      item.data_upload || 
                      item.upload_date ||
                      item.created_at ||
                      item.createdAt ||
                      item.date ||
                      new Date().toLocaleDateString('pt-BR');
      
      // If uploadDate is not in the expected format, try to format it
      if (uploadDate && typeof uploadDate === 'string' && uploadDate !== new Date().toLocaleDateString('pt-BR')) {
        try {
          const date = new Date(uploadDate);
          uploadDate = date.toLocaleDateString('pt-BR');
        } catch (e) {
          console.log('Could not parse date:', uploadDate);
          uploadDate = new Date().toLocaleDateString('pt-BR');
        }
      }
      
      return {
        id: item.id || (index + 1).toString(),
        name: documentName,
        uploadDate: uploadDate
      };
    });
    console.log('Processed array data:', processedData);
    return processedData;
  } else if (response.data && typeof response.data === 'object') {
    console.log('Processing object response...');
    // If it's an object with documents property or similar
    const documents = response.data.documents || response.data.files || response.data.data || [];
    if (Array.isArray(documents)) {
      console.log('Found documents array in object:', documents);
      return documents.map((item, index) => {
        let documentName = item.name || 
                          item.nome_documento || 
                          item.filename || 
                          item.fileName || 
                          item.file_name ||
                          item.document_name ||
                          item.titulo ||
                          item.title ||
                          (typeof item === 'string' ? item : `Documento ${index + 1}`);
        
        let uploadDate = item.uploadDate || 
                        item.data_upload || 
                        item.upload_date ||
                        item.created_at ||
                        item.createdAt ||
                        item.date ||
                        new Date().toLocaleDateString('pt-BR');
        
        if (uploadDate && typeof uploadDate === 'string' && uploadDate !== new Date().toLocaleDateString('pt-BR')) {
          try {
            const date = new Date(uploadDate);
            uploadDate = date.toLocaleDateString('pt-BR');
          } catch (e) {
            uploadDate = new Date().toLocaleDateString('pt-BR');
          }
        }
        
        return {
          id: item.id || (index + 1).toString(),
          name: documentName,
          uploadDate: uploadDate
        };
      });
    }
    
    // Check if the response itself contains direct fields
    if (response.data.name || response.data.nome_documento || response.data.filename) {
      console.log('Object contains direct document fields');
      return [{
        id: '1',
        name: response.data.name || response.data.nome_documento || response.data.filename || 'Documento 1',
        uploadDate: response.data.uploadDate || response.data.data_upload || new Date().toLocaleDateString('pt-BR')
      }];
    }
    
    return [];
  } else {
    console.log('Empty or unknown response format');
    // If it's an empty response or error
    return [];
  }
};

export const getDocument = async (nome_documento: string) => {
  const response = await axios.post(`${N8N_WEBHOOK_URL}/156dfa37-7384-4c2f-bcf2-ade46e6d7f4e`, {
    nome_documento,
  });
  return response.data;
};

export const getOriginalDocument = async (nome_documento: string) => {
  try {
    // Try to get the original extracted text from the database
    const response = await axios.post(`${N8N_WEBHOOK_URL}/get-original-text`, {
      nome_documento,
    });
    return response.data;
  } catch (error) {
    console.log('Original document endpoint not available, using processed document');
    return null;
  }
};

interface UploadResponse {
  ok: boolean;
  status: number;
  text: string;
}

export const uploadFile = async (file: File, username: string) => {
  const encryptedUsername = hex_sha256(username);
  const formData = new FormData();
  
  console.log('Preparando upload do arquivo:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  });
  
  // Append fields in the same order as the working React Native version
  formData.append('username', encryptedUsername);
  formData.append('nome_documento', file.name);
  formData.append('is_file', 'true');
  formData.append('file', file, file.name);

  console.log('Enviando arquivo via XMLHttpRequest...');
  
  // Use XMLHttpRequest instead of Axios (like in the working React Native version)
  const xhr = new XMLHttpRequest();
  
  xhr.open('POST', `${N8N_WEBHOOK_URL}/ad577ad7-3860-48b8-88a3-0e4760aea239`, true);
  
  // Don't set basic auth header initially - let's test without it first
  // xhr.setRequestHeader('Authorization', 'Basic YWRtaW46YWRtaW4=');
  
  // Configure response handlers
  const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
    xhr.onload = function() {
      console.log('Upload response status:', xhr.status);
      console.log('Upload response text:', xhr.responseText);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          ok: true,
          status: xhr.status,
          text: xhr.responseText
        });
      } else {
        reject(new Error(`HTTP Error: ${xhr.status} - ${xhr.responseText}`));
      }
    };
    
    xhr.onerror = function() {
      console.error('Network error during upload');
      reject(new Error('Network Error'));
    };
    
    xhr.ontimeout = function() {
      console.error('Upload timeout');
      reject(new Error('Upload timeout'));
    };
    
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
      }
    };
  });

  // Set timeout
  xhr.timeout = 60000; // 60 seconds

  // Send the file
  xhr.send(formData);
  
  // Wait for response
  const response = await uploadPromise;
  
  if (response.ok) {
    try {
      return JSON.parse(response.text);
    } catch (e) {
      return { success: true, message: response.text };
    }
  } else {
    throw new Error(`Upload failed: ${response.status} - ${response.text}`);
  }
};

export const uploadFileDebug = async (file: File, username: string) => {
  const encryptedUsername = hex_sha256(username);
  
  console.log('Debug: Enviando arquivo com informações detalhadas');
  console.log('File info:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  });
  
  // Try with both XMLHttpRequest and detailed logging
  const formData = new FormData();
  
  // Add form fields
  formData.append('username', encryptedUsername);
  formData.append('nome_documento', file.name);
  formData.append('is_file', 'true');
  
  // Add the file - this is crucial for n8n to detect binary data
  formData.append('file', file, file.name);
  
  // Log FormData contents (for debugging)
  console.log('FormData entries added:');
  console.log('- username:', encryptedUsername);
  console.log('- nome_documento:', file.name);
  console.log('- is_file: true');
  console.log('- file:', file.name, file.type, file.size);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', `${N8N_WEBHOOK_URL}/ad577ad7-3860-48b8-88a3-0e4760aea239`, true);
    
    xhr.onload = function() {
      console.log('Response status:', xhr.status);
      console.log('Response headers:', xhr.getAllResponseHeaders());
      console.log('Response text:', xhr.responseText);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (e) {
          resolve({ success: true, message: xhr.responseText });
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
      }
    };
    
    xhr.onerror = () => {
      console.error('Network error');
      reject(new Error('Network error'));
    };
    
    xhr.ontimeout = () => {
      console.error('Request timeout');
      reject(new Error('Request timeout'));
    };
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        console.log(`Upload progress: ${percent.toFixed(1)}%`);
      }
    };
    
    xhr.timeout = 60000; // 60 seconds
    
    console.log('Sending request to:', `${N8N_WEBHOOK_URL}/ad577ad7-3860-48b8-88a3-0e4760aea239`);
    xhr.send(formData);
  });
};

export const uploadFileWithFetch = async (file: File, username: string) => {
  const encryptedUsername = hex_sha256(username);
  const formData = new FormData();
  
  console.log('Preparando upload do arquivo com fetch:', {
    name: file.name,
    type: file.type,
    size: file.size
  });
  
  // Append fields in the same order
  formData.append('username', encryptedUsername);
  formData.append('nome_documento', file.name);
  formData.append('is_file', 'true');
  formData.append('file', file, file.name);

  console.log('Enviando arquivo via fetch...');
  
  try {
    const response = await fetch(`${N8N_WEBHOOK_URL}/ad577ad7-3860-48b8-88a3-0e4760aea239`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary
    });
    
    console.log('Fetch response status:', response.status);
    const responseText = await response.text();
    console.log('Fetch response text:', responseText);
    
    if (response.ok) {
      try {
        return JSON.parse(responseText);
      } catch (e) {
        return { success: true, message: responseText };
      }
    } else {
      throw new Error(`HTTP Error: ${response.status} - ${responseText}`);
    }
  } catch (error) {
    console.error('Fetch upload error:', error);
    throw error;
  }
};

export const testUploadEndpoint = async () => {
  try {
    const response = await axios.get(`${N8N_WEBHOOK_URL}/ad577ad7-3860-48b8-88a3-0e4760aea239`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Test endpoint failed:', error);
    return { 
      success: false, 
      error: error.response?.data || error.message || 'Unknown error' 
    };
  }
};

export const chatWithDocument = async (nome_documento: string, chat_input: string) => {
  const response = await axios.post(`${N8N_WEBHOOK_URL}/26d37223-c353-40db-9ffe-6d07daffd1b2`, {
    nome_documento,
    chat_input,
  });
  return response.data;
};
