const express = require('express');
const Deal = require('../models/Deal');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/deals — get all deals for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let filter;
    if (role === 'investor') {
      filter = { investorId: userId };
    } else {
      filter = { entrepreneurId: userId };
    }

    const deals = await Deal.find(filter)
      .populate('investorId', 'name avatarUrl')
      .populate('entrepreneurId', 'name avatarUrl startupName')
      .sort({ lastActivity: -1 });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/deals — create a new deal
router.post('/', auth, async (req, res) => {
  try {
    const { startup, entrepreneurId, amount, equity, status, stage } = req.body;

    const deal = await Deal.create({
      startup,
      investorId: req.user._id,
      entrepreneurId,
      amount,
      equity,
      status: status || 'Due Diligence',
      stage,
      lastActivity: new Date()
    });

    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
