const prisma = require('../config/prisma');
const matchItems = require('../utils/matchItems');

// 1. Get All Items
const getItems = async (req, res) => {
  try {
    const { type, category, status, search } = req.query;
    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const items = await prisma.item.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = items.map(item => ({
      ...item,
      _id: item.id,
      user: item.user ? { ...item.user, _id: item.user.id } : null
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Single Item
const getItemById = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } }
    });
    if (!item) return res.status(404).json({ message: 'Item nahi mila' });
    res.json({ ...item, _id: item.id, user: item.user ? { ...item.user, _id: item.user.id } : null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Create Item
const createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, date } = req.body;
    const images = req.files ? req.files.map(f => f.path) : [];

    const item = await prisma.item.create({
      data: {
        title, description, type, category, location,
        date: new Date(date),
        images,
        userId: req.user.id,
      }
    });

    matchItems({ ...item, userId: item.userId }).catch(err => console.error(err));

    res.status(201).json({ ...item, _id: item.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get Matches
const getMatches = async (req, res) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ message: 'Item nahi mila' });
    // ... matching logic humne matchItems logic mein handle ki hai
    res.json({ message: "Matching logic triggered" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Update Item
const updateItem = async (req, res) => {
  try {
    const updated = await prisma.item.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ ...updated, _id: updated.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Delete Item
const deleteItem = async (req, res) => {
  try {
    await prisma.item.delete({ where: { id: req.params.id } });
    res.json({ message: 'Item delete ho gaya' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CRITICAL: Yeh export hona bahut zaroori hai!
module.exports = { 
  getItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem, 
  getMatches 
};