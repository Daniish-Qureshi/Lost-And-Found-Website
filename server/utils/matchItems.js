const prisma = require('../config/prisma');

const matchItems = async (newItem) => {
  try {
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';

    const potentialMatches = await prisma.item.findMany({
      where: {
        type: oppositeType,
        category: newItem.category,
        status: 'active',
        NOT: { id: newItem.id },
        userId: { not: newItem.userId }
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    const matches = [];
    for (const item of potentialMatches) {
      let score = 30; // Base score for same category
      
      const newWords = newItem.title.toLowerCase().split(' ').filter(w => w.length > 2);
      const itemWords = item.title.toLowerCase().split(' ').filter(w => w.length > 2);
      score += newWords.filter(w => itemWords.includes(w)).length * 20;

      const loc1 = newItem.location.toLowerCase();
      const loc2 = item.location.toLowerCase();
      if (loc1 === loc2) score += 25;

      if (score >= 30) {
        matches.push({ item: { ...item, _id: item.id }, score: Math.min(score, 100) });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    // Send notifications
    for (const match of matches.slice(0, 3)) {
      await prisma.notification.create({
        data: {
          recipientId: newItem.userId,
          type: 'item_match',
          message: `🔍 Match mila! "${match.item.title}" match karta hai`,
          itemId: match.item.id,
        }
      });
    }

    return matches;
  } catch (err) {
    console.log('Match error:', err);
    return [];
  }
};

module.exports = matchItems;