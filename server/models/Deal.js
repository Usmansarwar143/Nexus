const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  startup: {
    name: { type: String, required: true },
    logo: { type: String, default: '' },
    industry: { type: String, default: '' }
  },
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  entrepreneurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: String,
    required: true
  },
  equity: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'],
    default: 'Due Diligence'
  },
  stage: {
    type: String,
    default: ''
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Deal', dealSchema);
