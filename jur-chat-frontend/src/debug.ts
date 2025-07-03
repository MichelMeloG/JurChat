// Test function to help debug API response
import { getHistory } from './services/api';

export const debugAPIResponse = async (username: string) => {
  try {
    console.log('=== DEBUGGING API RESPONSE ===');
    console.log('Username:', username);
    
    // Call the API directly
    const result = await getHistory(username);
    console.log('Final processed result:', result);
    
    // Log each document individually
    if (result && result.length > 0) {
      console.log('Documents found:');
      result.forEach((doc, index) => {
        console.log(`Document ${index + 1}:`, {
          id: doc.id,
          name: doc.name,
          uploadDate: doc.uploadDate
        });
      });
    } else {
      console.log('No documents found');
    }
    
    return result;
  } catch (error) {
    console.error('Error in debugAPIResponse:', error);
    throw error;
  }
};

// Add this to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).debugAPIResponse = debugAPIResponse;
}
