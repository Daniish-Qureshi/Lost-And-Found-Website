const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
const { protect } = require('../middleware/auth')

// Get my notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name')
      .populate('item', 'title')
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ message: 'All read' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Mark one as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ message: 'Read' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router