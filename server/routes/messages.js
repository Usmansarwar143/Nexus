const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/conversations — get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    // Group by conversation partner
    const conversationMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.senderId.toString() === userId.toString()
        ? msg.receiverId.toString()
        : msg.senderId.toString();

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          lastMessage: msg,
          updatedAt: msg.createdAt
        });
      }
    }

    // Populate partner info
    const conversations = [];
    for (const [partnerId, conv] of conversationMap) {
      const partner = await User.findById(partnerId).select('name avatarUrl isOnline role');
      conversations.push({
        id: `conv-${userId}-${partnerId}`,
        participants: [userId.toString(), partnerId],
        partner,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt
      });
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/messages/:userId — get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/messages — send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
