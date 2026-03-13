const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// Change Password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ message: 'User nahi mila' })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Current password galat hai!' })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ message: 'Password change ho gaya!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router;