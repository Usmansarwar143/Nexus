const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// GET /api/payments Get current user's transaction history
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ userId: req.user._id }, { targetUserId: req.user._id }]
    })
    .populate('targetUserId', 'name email avatarUrl')
    .populate('userId', 'name email avatarUrl')
    .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/deposit Mock integration for adding funds
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount, source } = req.body; // source like 'stripe' or 'paypal'
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Creating pending transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      referenceId: `mock_${source}_${Date.now()}`,
      description: `Deposit via ${source || 'Card'}`
    });

    // Simulate payment gateway processing delay (Mock)
    setTimeout(async () => {
      try {
        // Assume success for mock
        const user = await User.findById(req.user._id);
        if (user) {
          user.walletBalance = (user.walletBalance || 0) + Number(amount);
          await user.save();
          
          transaction.status = 'completed';
          await transaction.save();
        }
      } catch (err) {
        console.error("Delayed mock processing failed", err);
      }
    }, 1000); // 1-second delay block

    // Return the pending state instantly to show UI updating
    res.status(202).json({ message: 'Deposit processing...', transaction });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/withdraw Mock withdrawal of funds
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, destination } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const user = await User.findById(req.user._id);
    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Deduct immediately on our end
    user.walletBalance -= Number(amount);
    await user.save();

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'withdraw',
      amount,
      status: 'completed', // For mock sim, we mark it completed immediately or pending
      referenceId: `wd_${Date.now()}`,
      description: `Withdrawal to ${destination || 'Bank Account'}`
    });

    res.json({ message: 'Withdrawal successful', transaction, newBalance: user.walletBalance });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/transfer Transfer funds to another user
router.post('/transfer', auth, async (req, res) => {
  try {
    const { targetUserId, amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(targetUserId);

    if (!receiver) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if ((sender.walletBalance || 0) < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Process balances
    sender.walletBalance -= Number(amount);
    receiver.walletBalance = (receiver.walletBalance || 0) + Number(amount);

    await sender.save();
    await receiver.save();

    // Log transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      targetUserId: targetUserId,
      type: 'transfer',
      amount,
      status: 'completed',
      referenceId: `trf_${Date.now()}`,
      description: description || `Transfer from ${sender.name} to ${receiver.name}`
    });

    res.json({ message: 'Transfer successful', transaction });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
