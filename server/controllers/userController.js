const prisma = require('../config/prisma');

// Saare users fetch karne ke liye (Admin Dashboard ke liye)
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Frontend compatibility: id ko _id mein map karein
    const mapped = users.map(u => ({ ...u, _id: u.id }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers };