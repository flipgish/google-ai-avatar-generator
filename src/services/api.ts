import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadImage = async (imageFile: File, style: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('style', style);
    
    const response = await axios.post(`${API_URL}/generate-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    // Only log the error message and status
    if (axios.isAxiosError(error)) {
      console.error('Error uploading image:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    } else {
      console.error('Error uploading image:', String(error));
    }
    throw error;
  }
};

export const customizeAvatar = async (
  avatarUrl: string, 
  style: string, 
  instructions: string
): Promise<any> => {
  try {
    const response = await api.post('/customize-avatar', {
      avatarUrl,
      style,
      instructions,
    });
    
    return response.data;
  } catch (error) {
    // Only log the error message and status
    if (axios.isAxiosError(error)) {
      console.error('Error customizing avatar:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    } else {
      console.error('Error customizing avatar:', String(error));
    }
    throw error;
  }
};

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    // Only log the error message and status
    if (axios.isAxiosError(error)) {
      console.error('Server health check failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    } else {
      console.error('Server health check failed:', String(error));
    }
    return false;
  }
};

export default api;