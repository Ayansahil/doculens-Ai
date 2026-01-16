# API Reference - DocuLens AI Backend

Quick reference for all API endpoints.

## Base URL
```
http://localhost:3001
```

---

## Documents API

### Get All Documents
```http
GET /documents
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `status` (string) - Filter by status
- `type` (string) - Filter by file type
- `category` (string) - Filter by category
- `query` (string) - Search in title/description

**Response:**
```json
{
  "documents": [...],
  "total": 156,
  "page": 1,
  "limit": 10,
  "totalPages": 16
}
```

---

### Get Single Document
```http
GET /documents/:id
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Financial Report.pdf",
  "type": "PDF",
  "category": "Financial",
  "status": "analysed",
  "description": "Q4 2024 report",
  "file_url": "/uploads/...",
  "file_size": 2453678,
  "project": "Finance Review",
  "extracted_text": null,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

### Upload Document
```http
POST /documents/upload
Content-Type: multipart/form-data
```

**Body:**
- `file` (file) - Required. The file to upload
- `metadata` (JSON string) - Optional metadata

**Metadata Structure:**
```json
{
  "title": "Custom Title",
  "category": "Financial",
  "description": "Document description",
  "project": "Project Name"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/documents/upload \
  -F "file=@document.pdf" \
  -F 'metadata={"category":"Financial","description":"Test doc"}'
```

**Response:** Same as Get Single Document

---

### Update Document
```http
PUT /documents/:id
Content-Type: application/json
```

**Body:**
```json
{
  "title": "New Title",
  "category": "Legal",
  "description": "Updated description",
  "status": "analysed"
}
```

**Response:** Updated document object

---

### Delete Document
```http
DELETE /documents/:id
```

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

---

## Analytics API

### Get Dashboard Statistics
```http
GET /analytics/dashboard
```

**Response:**
```json
{
  "totalDocuments": 156,
  "analysedDocuments": 134,
  "highRiskDocuments": 8,
  "pendingDocuments": 14,
  "storageUsed": 1.2,
  "totalStorage": 10,
  "recentActivity": [
    {
      "id": "activity-1",
      "user": "System",
      "type": "upload",
      "document": "Financial Report.pdf",
      "status": "Analysed",
      "time": "2 hours ago"
    }
  ],
  "recentDocuments": [
    {
      "id": "uuid",
      "title": "Document.pdf",
      "type": "PDF",
      "category": "Financial",
      "status": "High Risk",
      "date": "2025-01-15T10:30:00Z",
      "description": "Document description"
    }
  ]
}
```

---

### Get Storage Information
```http
GET /analytics/storage
```

**Response:**
```json
{
  "used": 1.2,
  "total": 10,
  "percentage": 12,
  "available": 8.8
}
```

---

## Chat API

### Send Chat Message
```http
POST /chat
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Summarize this document",
  "documentId": "uuid-or-null"
}
```

**Response:**
```json
{
  "userMessage": {
    "id": "uuid",
    "document_id": null,
    "role": "user",
    "content": "Summarize this document",
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "botMessage": {
    "id": "uuid",
    "document_id": null,
    "role": "bot",
    "content": "Here's a summary...",
    "metadata": "{\"suggestions\":[\"...\",\"...\"]}",
    "timestamp": "2025-01-15T10:30:01Z"
  },
  "response": {
    "content": "Here's a summary...",
    "metadata": {
      "suggestions": ["Get detailed breakdown", "View recommendations"]
    }
  }
}
```

---

### Get Chat History
```http
GET /chat/history?documentId=uuid
```

**Query Parameters:**
- `documentId` (string, optional) - Filter by document

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "document_id": "uuid",
      "role": "user",
      "content": "Message text",
      "metadata": null,
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 10
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Human-readable error message",
  "error": "Detailed error information"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## File Upload Constraints

- **Max Size**: 50MB (52,428,800 bytes)
- **Allowed Types**:
  - PDF (application/pdf)
  - DOC (application/msword)
  - DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
  - TXT (text/plain)
  - XLSX (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
  - PPTX (application/vnd.openxmlformats-officedocument.presentationml.presentation)
  - JPG/JPEG (image/jpeg)
  - PNG (image/png)

---

## Document Status Values

- `pending` - Uploaded, awaiting processing
- `analysed` - Processing complete
- `high-risk` - High-risk content detected

---

## Testing Examples

### JavaScript/Fetch
```javascript
// Upload document
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('metadata', JSON.stringify({
  category: 'Financial',
  description: 'Test document'
}));

const response = await fetch('http://localhost:3001/documents/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

### cURL
```bash
# Get dashboard stats
curl http://localhost:3001/analytics/dashboard

# Upload document
curl -X POST http://localhost:3001/documents/upload \
  -F "file=@document.pdf" \
  -F 'metadata={"category":"Financial"}'

# Send chat message
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Summarize document","documentId":null}'

# Get documents with filters
curl "http://localhost:3001/documents?status=analysed&category=Financial&page=1&limit=10"
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all IDs
- The chat API returns mock responses (AI integration pending)
- Files are served from `/uploads/:filename`
- CORS is enabled for frontend origins
