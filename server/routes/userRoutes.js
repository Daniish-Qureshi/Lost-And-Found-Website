const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

// Update Profile
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { name, phone } = req.body
    const updateData = { name, phone }
    if (req.file) updateData.avatar = req.file.path

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all users (admin)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single user (admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User nahi mila' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update user role (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete user (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User delete ho gaya' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router