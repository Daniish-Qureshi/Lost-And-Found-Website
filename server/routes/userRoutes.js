const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all users (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users.map(u => ({ ...u, _id: u.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = { name, phone };
    if (req.file) updateData.avatar = req.file.path;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true }
    });

    res.json({ ...user, _id: user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single user
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true }
    });
    if (!user) return res.status(404).json({ message: 'User nahi mila' });
    res.json({ ...user, _id: user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ ...user, _id: user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User delete ho gaya' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;