import { useState, useCallback, useEffect } from 'react';
import DocumentList from '../components/features/DocumentList';
import ChatBot from '../components/features/ChatBot';
import { useDocuments } from '../hooks/useDocuments';
import { useApp } from '../context/AppContext';

const Documents = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { documents, loading, error, searchDocuments, updateFilters } = useDocuments();
  const { searchQuery } = useApp();

  useEffect(() => {
    // When global search query changes, update filters
    updateFilters({ query: searchQuery });
  }, [searchQuery, updateFilters]);

  const handleDocumentAction = (action, document) => {
    switch (action) {
      case 'view':
        setSelectedDocument(document);
        break;
      case 'edit':
        console.log('Edit document:', document);
        // Implement edit functionality
        break;
      case 'delete':
        console.log('Delete document:', document);
        // Implement delete functionality
        break;
      case 'download':
        console.log('Download document:', document);
        // Implement download functionality
        break;
      default:
        console.log('Unknown action:', action, document);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Documents</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Search */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-1">Manage and analyze your documents</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="lg:col-span-2">
          <DocumentList
            documents={documents}
            loading={loading}
            onDocumentAction={handleDocumentAction}
          />
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ChatBot 
              documentId={selectedDocument?.id} 
              className="h-[600px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;