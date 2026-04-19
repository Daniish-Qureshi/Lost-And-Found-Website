const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma'); // Purana model hatakar Prisma import kiya
const { protect } = require('../middleware/auth');

// Get my notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      include: {
        sender: { select: { name: true } }, // Populate ki jagah include
        item: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // limit(20) ki jagah take
    });

    // Frontend support ke liye _id map kar dein
    const mapped = notifications.map(n => ({
      ...n,
      _id: n.id,
      sender: n.sender ? { ...n.sender, _id: n.senderId } : null,
      item: n.item ? { ...n.item, _id: n.itemId } : null
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        recipientId: req.user.id, 
        read: false 
      },
      data: { read: true }
    });
    res.json({ message: 'All read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark one as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json({ message: 'Read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;