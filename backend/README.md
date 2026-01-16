# DocuLens AI Backend

Production-ready Node.js backend API for DocuLens AI document management system.

## Tech Stack

- **Node.js** with ES Modules
- **Express.js** - Web framework
- **Supabase** - Database (PostgreSQL)
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config/
│   │   └── db.js                 # Supabase database configuration
│   ├── models/                   # (Not needed with Supabase)
│   ├── controllers/
│   │   ├── document.controller.js    # Document CRUD operations
│   │   ├── analytics.controller.js   # Dashboard & analytics
│   │   └── chat.controller.js        # Chat functionality (mock AI)
│   ├── routes/
│   │   ├── document.routes.js
│   │   ├── analytics.routes.js
│   │   └── chat.routes.js
│   └── middleware/
│       └── upload.middleware.js      # Multer file upload config
├── uploads/                      # Uploaded files directory
├── package.json
├── .env                          # Environment variables
└── README.md
```

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
```

3. Database is already set up with Supabase migrations:
   - `documents` table
   - `chat_history` table

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs on **http://localhost:3001**

## API Endpoints

### Documents
- `GET /documents` - Get all documents (with pagination, filtering)
- `GET /documents/:id` - Get document by ID
- `POST /documents/upload` - Upload new document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/storage` - Get storage information

### Chat
- `POST /chat` - Send chat message (returns mock AI response)
- `GET /chat/history` - Get chat history

## API Response Formats

### Dashboard Stats Response
```json
{
  "totalDocuments": 156,
  "analysedDocuments": 134,
  "highRiskDocuments": 8,
  "pendingDocuments": 14,
  "storageUsed": 1.2,
  "totalStorage": 10,
  "recentActivity": [...],
  "recentDocuments": [...]
}
```

### Document Upload Response
```json
{
  "id": "uuid",
  "title": "Q4 Financial Report.pdf",
  "type": "PDF",
  "category": "Financial",
  "status": "pending",
  "description": "...",
  "file_url": "/uploads/...",
  "file_size": 2453678,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Chat Response
```json
{
  "userMessage": {...},
  "botMessage": {...},
  "response": {
    "content": "AI response text...",
    "metadata": {
      "suggestions": ["...", "..."]
    }
  }
}
```

## File Upload

- **Supported formats**: PDF, DOC, DOCX, TXT, XLSX, PPTX, JPG, PNG
- **Max file size**: 50MB
- **Storage**: Local filesystem (`/uploads` directory)
- Files are accessible via `/uploads/:filename` route

## Database Schema

### documents
- `id` (uuid) - Primary key
- `title` (text) - Document name
- `type` (text) - File extension
- `category` (text) - Document category
- `status` (text) - pending | analysed | high-risk
- `description` (text) - Document description
- `file_url` (text) - File path
- `file_size` (bigint) - Size in bytes
- `project` (text) - Associated project
- `extracted_text` (text) - OCR text (future)
- `created_at`, `updated_at` (timestamptz)

### chat_history
- `id` (uuid) - Primary key
- `document_id` (uuid) - Foreign key to documents
- `role` (text) - user | bot
- `content` (text) - Message content
- `metadata` (jsonb) - Additional data
- `timestamp` (timestamptz)

## Error Handling

All endpoints return consistent error responses:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `404` - Not found
- `500` - Server error

## Future Enhancements

This backend is AI-ready and can be extended with:
- OCR integration for text extraction
- AI-powered document analysis
- Real-time chat with language models
- Advanced search and filtering
- User authentication
- Cloud storage integration

## Testing

```bash
# Test server is running
curl http://localhost:3001

# Test document upload
curl -X POST http://localhost:3001/documents/upload \
  -F "file=@document.pdf" \
  -F "metadata={\"category\":\"Financial\"}"

# Test dashboard stats
curl http://localhost:3001/analytics/dashboard
```

## Notes

- The chat API currently returns mock responses
- RLS policies allow public access (add authentication later)
- Files are stored locally (consider cloud storage for production)
- The frontend expects exact response structures - do not modify keys
