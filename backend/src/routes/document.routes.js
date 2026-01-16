import express from 'express';
import {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument
} from '../controllers/document.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.post('/upload', upload.single('file'), uploadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
