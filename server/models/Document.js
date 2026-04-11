const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true
  },
  type: {
    type: String,
    default: 'PDF'
  },
  size: {
    type: String,
    default: '0 KB'
  },
  shared: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    default: ''
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'pending_signature', 'signed'],
    default: 'draft'
  },
  signatureUrl: {
    type: String,
    default: null
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
