const Item = require('../models/Item')
const Notification = require('../models/Notification')

const matchItems = async (newItem) => {
  try {
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost'

    // Same category ke items dhundo
    const potentialMatches = await Item.find({
      type: oppositeType,
      category: newItem.category,
      status: 'active',
      _id: { $ne: newItem._id },
      user: { $ne: newItem.user }
    }).populate('user', 'name email')

    const matches = []

    for (const item of potentialMatches) {
      let score = 0

      // Category match — 30 points
      if (item.category === newItem.category) score += 30

      // Title words match
      const newWords = newItem.title.toLowerCase().split(' ').filter(w => w.length > 2)
      const itemWords = item.title.toLowerCase().split(' ').filter(w => w.length > 2)
      const titleMatches = newWords.filter(w => itemWords.includes(w)).length
      score += titleMatches * 20

      // Description words match
      const newDesc = newItem.description.toLowerCase().split(' ').filter(w => w.length > 3)
      const itemDesc = item.description.toLowerCase().split(' ').filter(w => w.length > 3)
      const descMatches = newDesc.filter(w => itemDesc.includes(w)).length
      score += descMatches * 10

      // Location match
      const newLoc = newItem.location.toLowerCase()
      const itemLoc = item.location.toLowerCase()
      if (newLoc === itemLoc) score += 25
      else if (newLoc.includes(itemLoc) || itemLoc.includes(newLoc)) score += 15

      // Date proximity (within 7 days)
      const daysDiff = Math.abs(new Date(newItem.date) - new Date(item.date)) / (1000 * 60 * 60 * 24)
      if (daysDiff <= 1) score += 15
      else if (daysDiff <= 3) score += 10
      else if (daysDiff <= 7) score += 5

      if (score >= 30) {
        matches.push({ item, score })
      }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score)

    // Top 3 matches ke liye notifications bhejo
    for (const match of matches.slice(0, 3)) {
      // Notify new item owner
      await Notification.create({
        recipient: newItem.user,
        type: 'item_match',
        message: `🔍 Match mila! "${match.item.title}" tumhare item se match karta hai (${match.score}% match)`,
        item: match.item._id,
      })

      // Notify matched item owner
      await Notification.create({
        recipient: match.item.user._id,
        type: 'item_match',
        message: `🔍 Match mila! "${newItem.title}" tumhare item se match karta hai`,
        item: newItem._id,
      })
    }

    return matches
  } catch (err) {
    console.log('Match error:', err)
    return []
  }
}

module.exports = matchItems