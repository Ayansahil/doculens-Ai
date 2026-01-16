import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';

export const useDocuments = (initialFilters = {}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await documentService.getDocuments(params);
      
      let fetchedDocuments = response.documents || [];

      // --- MOCK SEARCH FILTERING ---
      if (filters.query) {
        const lowerCaseQuery = filters.query.toLowerCase();
        fetchedDocuments = fetchedDocuments.filter(doc => 
          doc.title.toLowerCase().includes(lowerCaseQuery)
        );
      }
      setDocuments(fetchedDocuments);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      });
    } catch (error) {
      console.error('Fetch documents error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file, metadata = {}, onProgress) => {
    try {
      setError(null);
      const document = await documentService.uploadDocument(file, metadata, onProgress);
      setDocuments(prev => [document, ...prev]);
      return { success: true, document };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const updateDocument = async (id, data) => {
    try {
      setError(null);
      const updatedDocument = await documentService.updateDocument(id, data);
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDocument : doc)
      );
      return { success: true, document: updatedDocument };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteDocument = async (id) => {
    try {
      setError(null);
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const searchDocuments = async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await documentService.searchDocuments(query);
      setDocuments(results.documents || []);
      
      return { success: true, results };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const changePage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const refreshDocuments = () => {
    fetchDocuments();
  };

  return {
    documents,
    loading,
    error,
    pagination,
    filters,
    uploadDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    updateFilters,
    changePage,
    refreshDocuments,
  };
};