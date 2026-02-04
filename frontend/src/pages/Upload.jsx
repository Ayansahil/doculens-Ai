import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentUpload from "../components/features/DocumentUpload";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { FileText, ArrowUp, CircleCheck as CheckCircle } from "lucide-react";

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUploadComplete = (files) => {
    const safeFiles = Array.isArray(files) ? files : files ? [files] : [];
    setUploadedFiles(safeFiles);
    setShowSuccess(true);

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleViewDocuments = () => {
    navigate("/documents");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="text-center flex-shrink-0">
        <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
          <ArrowUp size={32} className="text-primary-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Upload your documents for AI-powered analysis. Supported formats
          include PDF, DOC, DOCX, TXT, XLSX, and PPTX files.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="p-6 bg-green-50 border-green-200 my-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">
                Upload Successful!
              </h3>
              <p className="text-green-700 mt-1">
                {uploadedFiles.length} file(s) have been uploaded and are ready
                for analysis.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDocuments}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              View Documents
            </Button>
          </div>
        </Card>
      )}

      {/* Upload Interface */}
      <div className="flex-1 flex flex-col items-center gap-4 mt-4 overflow-y-auto">
        <div className="w-full max-w-4xl">
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        </div>

        <div className="w-full max-w-4xl space-y-6">
          {/* Upload Tips */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Upload Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-primary-500" />
                  Supported File Types
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PDF documents</li>
                  <li>• Microsoft Word (DOC, DOCX)</li>
                  <li>• Plain text files (TXT)</li>
                  <li>• Excel spreadsheets (XLSX)</li>
                  <li>• PowerPoint presentations (PPTX)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary-500" />
                  Best Practices
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Maximum file size: 50MB</li>
                  <li>• Use descriptive file names</li>
                  <li>• Ensure text is clear and readable</li>
                  <li>• Group related documents by project</li>
                  <li>• Add relevant descriptions and categories</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Recent Uploads */}
          {uploadedFiles.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Recently Uploaded
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDocuments}
                >
                  View All Documents
                </Button>
              </div>

              <div className="space-y-3">
                {uploadedFiles.slice(0, 3).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-600">
                        {Math.round((file.size / 1024 / 1024) * 100) / 100} MB •
                        Uploaded successfully
                      </p>
                    </div>
                    <div className="text-green-500">
                      <CheckCircle size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
