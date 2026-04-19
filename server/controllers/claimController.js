const prisma = require('../config/prisma');

const createClaim = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: req.params.itemId },
      include: { user: true }
    });
    if (!item) return res.status(404).json({ message: 'Item nahi mila' });

    if (item.userId === req.user.id)
      return res.status(400).json({ message: 'Apna khud ka item claim nahi kar sakte' });

    const claim = await prisma.claim.create({
      data: {
        itemId: req.params.itemId,
        claimantId: req.user.id,
        description: req.body.description,
      }
    });

    // Notification to item owner
    await prisma.notification.create({
      data: {
        recipientId: item.userId,
        senderId: req.user.id,
        type: 'claim',
        message: `${req.user.name} ne tumhara item "${item.title}" claim kiya hai`,
        itemId: item.id,
      }
    });

    res.status(201).json({ ...claim, _id: claim.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClaims = async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      include: {
        item: { select: { id: true, title: true, type: true } },
        claimant: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    const mapped = claims.map(c => ({
      ...c, _id: c.id,
      item: { ...c.item, _id: c.item.id },
      claimant: { ...c.claimant, _id: c.claimant.id }
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClaim = async (req, res) => {
  try {
    const claim = await prisma.claim.findUnique({
      where: { id: req.params.id },
      include: { item: true }
    });
    if (!claim) return res.status(404).json({ message: 'Claim nahi mila' });

    const updated = await prisma.claim.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });

    if (req.body.status === 'approved') {
      await prisma.item.update({ where: { id: claim.itemId }, data: { status: 'claimed' } });
    }

    await prisma.notification.create({
      data: {
        recipientId: claim.claimantId,
        senderId: req.user.id,
        type: req.body.status === 'approved' ? 'claim_approved' : 'claim_rejected',
        message: req.body.status === 'approved'
          ? `🎉 Tumhara claim "${claim.item?.title}" approve ho gaya!`
          : `❌ Tumhara claim "${claim.item?.title}" reject ho gaya`,
        itemId: claim.itemId,
      }
    });

    res.json({ ...updated, _id: updated.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClaim, getClaims, updateClaim };