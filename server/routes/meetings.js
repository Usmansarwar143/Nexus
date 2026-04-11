const express = require('express');
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to check time overlap
// time format is "HH:MM"
const checkOverlap = (start1, duration1, start2, duration2) => {
  const [h1, m1] = start1.split(':').map(Number);
  const [h2, m2] = start2.split(':').map(Number);
  
  const start1Mins = h1 * 60 + m1;
  const end1Mins = start1Mins + duration1;
  
  const start2Mins = h2 * 60 + m2;
  const end2Mins = start2Mins + duration2;
  
  return Math.max(start1Mins, start2Mins) < Math.min(end1Mins, end2Mins);
};

// GET /api/meetings
// Fetch existing meetings for the current user
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ entrepreneurId: req.user._id }, { investorId: req.user._id }]
    })
    .populate('entrepreneurId', 'name startupName avatarUrl')
    .populate('investorId', 'name avatarUrl')
    .sort({ date: 1, startTime: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/meetings
// Schedule a new meeting
router.post('/', auth, async (req, res) => {
  try {
    let { title, entrepreneurId, investorId, date, startTime, durationMinutes, notes } = req.body;
    
    // Parse the incoming string date object completely strictly to its YYYY-MM-DD boundary (ignore time aspects to cleanly match)
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0,0,0,0);

    // 1. Check for Conflicts (Double Booking)
    // Find any meeting on the same normalized date for either party that is pending or accepted
    const startOfDay = new Date(normalizedDate);
    const endOfDay = new Date(normalizedDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingMeetings = await Meeting.find({
      $or: [
        { entrepreneurId: { $in: [entrepreneurId, investorId] } },
        { investorId: { $in: [entrepreneurId, investorId] } }
      ],
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['pending', 'accepted'] }
    });

    for (let meeting of existingMeetings) {
      if (checkOverlap(startTime, durationMinutes, meeting.startTime, meeting.durationMinutes)) {
        return res.status(409).json({ message: 'Time slot is already booked for one of the participants. Please select another time.' });
      }
    }

    // 2. Create Meeting
    // Optionally create a random meeting link
    const meetingLink = `https://meet.nexus.com/${Math.random().toString(36).substring(2, 10)}`;

    const meeting = new Meeting({
      title,
      entrepreneurId,
      investorId,
      date: normalizedDate,
      startTime,
      durationMinutes,
      notes,
      meetingLink
    });

    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/meetings/:id/status
// Update meeting status (accept, reject, cancel)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Ensure the current user is part of the meeting
    if (meeting.entrepreneurId.toString() !== req.user._id.toString() &&
        meeting.investorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }

    meeting.status = status;
    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
