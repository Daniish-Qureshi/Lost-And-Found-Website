const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

// Get all conversations
router.get('/', protect, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = messages.map(m => ({
      ...m,
      _id: m.id,
      sender: m.sender ? { ...m.sender, _id: m.sender.id } : null,
      receiver: m.receiver ? { ...m.receiver, _id: m.receiver.id } : null,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages between two users (with optional itemId filter)
router.get('/:receiverId', protect, async (req, res) => {
  try {
    const { itemId } = req.query;
    const where = {
      OR: [
        { senderId: req.user.id, receiverId: req.params.receiverId },
        { senderId: req.params.receiverId, receiverId: req.user.id }
      ]
    };
    if (itemId) where.itemId = itemId;

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages.map(m => ({ ...m, _id: m.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;