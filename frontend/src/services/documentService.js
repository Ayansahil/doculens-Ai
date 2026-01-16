import { api } from './api';
import { validateFile } from '../utils/helpers';

export const documentService = {
  async uploadDocument(file, metadata = {}, onProgress) {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    try {
      const response = await api.uploadDocument(formData, onProgress);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  },
  
  async getDocuments(filters = {}) {
    try {
      // --- MOCK IMPLEMENTATION ---
      // This is a temporary mock to allow frontend development without a running backend.
      // You can remove this block when the backend is ready.
      console.warn("Using mock data for getDocuments. Remove this in production.");
      const mockDocuments = [
        {
          id: 1,
          title: 'Q4 2024 Financial Report',
          type: 'PDF',
          category: 'Financial',
          status: 'High Risk',
          date: '2025-01-25',
          size: '2.4 MB',
          description: '3 inconsidencies flagged. Net profit variance: 12%',
          project: 'Finance Review'
        },
        {
          id: 2,
          title: 'Smith v. Jones Contract',
          type: 'PDF',
          category: 'Legal',
          status: 'Analysed',
          date: '2025-01-20',
          size: '1.8 MB',
          description: 'Termination clause on page 7. Parties: John Smith, Jane Jones',
          project: 'Legal Affairs'
        },
        {
          id: 3,
          title: 'Academic Research Paper',
          type: 'PDF',
          category: 'Academic',
          status: 'Pending OCR',
          date: '2025-01-10',
          size: '3.2 MB',
          description: 'Key findings on AI ethics discussed.',
          project: 'Research'
        }
      ];

      return Promise.resolve({ data: { documents: mockDocuments, total: 3, page: 1, totalPages: 1 } });
    } catch (error) {
      console.error('Get documents error:', error);
      throw new Error('Failed to fetch documents');
    }
  },
  
  async getDocument(id) {
    try {
      const response = await api.getDocument(id);
      return response.data;
    } catch (error) {
      console.error('Get document error:', error);
      throw new Error('Failed to fetch document');
    }
  },
  
  async updateDocument(id, data) {
    try {
      const response = await api.updateDocument(id, data);
      return response.data;
    } catch (error) {
      console.error('Update document error:', error);
      throw new Error('Failed to update document');
    }
  },
  
  async deleteDocument(id) {
    try {
      const response = await api.deleteDocument(id);
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw new Error('Failed to delete document');
    }
  },
  
  async searchDocuments(query) {
    try {
      const response = await api.searchDocuments(query);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search failed');
    }
  }
};

export default documentService;