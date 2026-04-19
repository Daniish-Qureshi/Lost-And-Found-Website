const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect, adminOnly } = require('../middleware/auth');

// GET ALL CLAIMS (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      include: {
        claimant: true,
        item: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = claims.map(c => ({
      ...c,
      _id: c.id,
      claimant: c.claimant ? { ...c.claimant, _id: c.claimant.id } : null,
      item: c.item ? { ...c.item, _id: c.item.id } : null
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE CLAIM
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, message } = req.body;
    const claim = await prisma.claim.create({
      data: {
        itemId,
        description: message || "",
        claimantId: req.user.id,
        status: 'pending'
      }
    });
    res.status(201).json({ ...claim, _id: claim.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE CLAIM STATUS (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const claim = await prisma.claim.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    res.json({ ...claim, _id: claim.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;