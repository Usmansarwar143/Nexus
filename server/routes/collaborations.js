const express = require('express');
const CollaborationRequest = require('../models/CollaborationRequest');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// GET /api/collaborations — get collaboration requests for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let filter;
    if (role === 'entrepreneur') {
      filter = { entrepreneurId: userId };
    } else {
      filter = { investorId: userId };
    }

    const requests = await CollaborationRequest.find(filter)
      .populate('investorId', 'name avatarUrl email role')
      .populate('entrepreneurId', 'name avatarUrl email role startupName')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/collaborations — create a new collaboration request
router.post('/', auth, roleAuth('investor'), async (req, res) => {
  try {
    const { entrepreneurId, message } = req.body;

    const request = await CollaborationRequest.create({
      investorId: req.user._id,
      entrepreneurId,
      message
    });

    const populated = await request.populate([
      { path: 'investorId', select: 'name avatarUrl email role' },
      { path: 'entrepreneurId', select: 'name avatarUrl email role startupName' }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/collaborations/:id — update collaboration request status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected' });
    }

    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the entrepreneur can accept/reject
    if (request.entrepreneurId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    request.status = status;
    await request.save();

    const populated = await request.populate([
      { path: 'investorId', select: 'name avatarUrl email role' },
      { path: 'entrepreneurId', select: 'name avatarUrl email role startupName' }
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
