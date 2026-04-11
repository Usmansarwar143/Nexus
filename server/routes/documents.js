const express = require('express');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

// GET /api/documents — get documents for current user
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { ownerId: req.user._id },
        { shared: true }
      ]
    }).sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/documents — create document metadata & upload file
router.post('/', auth, upload.single('document'), async (req, res) => {
  try {
    const { shared } = req.body;
    let url = '';
    let name = 'Untitled Document';
    let type = 'PDF';
    let size = '0 KB';

    if (req.file) {
      url = `http://localhost:5000/uploads/documents/${req.file.filename}`;
      name = req.file.originalname;
      const mbSize = (req.file.size / (1024 * 1024)).toFixed(2);
      size = mbSize > 0.1 ? `${mbSize} MB` : `${(req.file.size / 1024).toFixed(0)} KB`;
      // determine type
      if (req.file.mimetype === 'application/pdf') type = 'PDF';
      else if (req.file.mimetype.includes('image')) type = 'Image';
      else type = 'Document';
    } else {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const document = await Document.create({
      name,
      type,
      size,
      shared: shared === 'true' || shared === true,
      url,
      status: 'draft',
      ownerId: req.user._id
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/documents/:id/sign -- accept base64 signature
router.post('/:id/sign', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Only owner can sign
    const { signature } = req.body; 
    if (!signature) {
       return res.status(400).json({ message: "No signature provided" });
    }
    
    const matches = signature.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `sig-${Date.now()}.png`;
      const filepath = path.join(__dirname, '..', 'uploads', 'signatures', filename);
      
      fs.writeFileSync(filepath, buffer);
      
      document.signatureUrl = `http://localhost:5000/uploads/signatures/${filename}`;
      document.status = 'signed';
      await document.save();
      
      return res.json(document);
    }
    
    res.status(400).json({ message: "Invalid signature format" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/documents/:id — delete a document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only owner can delete
    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
