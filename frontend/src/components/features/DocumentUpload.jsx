import { useState, useCallback, useRef } from 'react';
import { Upload, File, X, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { validateFile, formatFileSize } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

const DocumentUpload = ({ onUploadComplete, className = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const { addNotification, updateUploadProgress, removeUploadProgress } = useApp();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        const fileWithId = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0,
          error: null
        };
        validFiles.push(fileWithId);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      addNotification({
        type: 'error',
        message: `File validation failed: ${errors.join(', ')}`
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    removeUploadProgress(fileId);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);

    for (const fileItem of files) {
      if (fileItem.status === 'uploaded') continue;

      try {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading', error: null } : f
        ));

        // Simulate upload progress
        const uploadPromise = simulateFileUpload(fileItem.file, (progress) => {
          updateUploadProgress(fileItem.id, progress);
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress } : f
          ));
        });

        await uploadPromise;

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploaded', progress: 100 } : f
        ));

        removeUploadProgress(fileItem.id);

        addNotification({
          type: 'success',
          message: `${fileItem.name} uploaded successfully`
        });

      } catch (error) {
        console.error('Upload error:', error);
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'error', 
            error: error.message || 'Upload failed' 
          } : f
        ));

        removeUploadProgress(fileItem.id);

        addNotification({
          type: 'error',
          message: `Failed to upload ${fileItem.name}: ${error.message}`
        });
      }
    }

    setUploading(false);

    // Call onUploadComplete if provided
    const uploadedFiles = files.filter(f => f.status === 'uploaded');
    if (onUploadComplete && uploadedFiles.length > 0) {
      onUploadComplete(uploadedFiles);
    }
  };

  // Simulate file upload with progress
  const simulateFileUpload = (file, onProgress) => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          onProgress(progress);
          
          // Simulate random success/failure
          if (Math.random() > 0.1) { // 90% success rate
            setTimeout(resolve, 500);
          } else {
            reject(new Error('Upload failed'));
          }
        } else {
          onProgress(progress);
        }
      }, 200);
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📈';
    return '📄';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'uploading':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
        );
      default:
        return <File size={16} className="text-gray-400" />;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
        />

        <div className="space-y-4">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload size={24} className="text-gray-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Drop files here</h3>
            <p className="text-gray-600">or click to browse</p>
          </div>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mx-auto"
          >
            Choose Files
          </Button>
          
          <p className="text-sm text-gray-500">
            Supports: PDF, DOC, DOCX, TXT, XLSX, PPTX (Max 50MB each)
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
                disabled={uploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.every(f => f.status === 'uploaded')}
                loading={uploading}
              >
                Upload Files
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <div className="text-2xl">{getFileIcon(fileItem.type)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileItem.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fileItem.status, fileItem.error)}
                      {!uploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                          className="p-1 hover:bg-red-50 text-red-500"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileItem.size)}
                    </p>
                    {fileItem.status === 'uploading' && (
                      <span className="text-xs text-primary-600">
                        {Math.round(fileItem.progress)}%
                      </span>
                    )}
                  </div>

                  {fileItem.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {fileItem.error && (
                    <p className="text-xs text-red-600 mt-1">{fileItem.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Metadata Form */}
      {files.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Document Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Project"
              placeholder="Enter project name"
              helperText="Optional: Associate with a project"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Select category</option>
                <option value="financial">Financial</option>
                <option value="legal">Legal</option>
                <option value="academic">Academic</option>
                <option value="business">Business</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Optional: Add a description for these documents"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default DocumentUpload;

DocumentUpload.propTypes = {
 className: PropTypes.string,
 onUploadComplete: PropTypes.func,
};