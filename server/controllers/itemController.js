const Item = require('../models/Item')
const matchItems = require('../utils/matchItems')

// Get All Items
const getItems = async (req, res) => {
  try {
    const { type, category, status, search } = req.query
    let query = {}
    if (type) query.type = type
    if (category) query.category = category
    if (status) query.status = status
    if (search) query.title = { $regex: search, $options: 'i' }

    const items = await Item.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Single Item
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('user', 'name email phone')
    if (!item) return res.status(404).json({ message: 'Item nahi mila' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, date } = req.body
    const images = req.files ? req.files.map(f => f.path) : []

    const item = await Item.create({
      title, description, type, category, location, date,
      images, user: req.user._id,
    })

    // Auto match karo background mein
    const populatedItem = await Item.findById(item._id).populate('user')
    matchItems(populatedItem)

    res.status(201).json(item)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get Matches for an Item
const getMatches = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user')
    if (!item) return res.status(404).json({ message: 'Item nahi mila' })

    const oppositeType = item.type === 'lost' ? 'found' : 'lost'
    const potentialMatches = await Item.find({
      type: oppositeType,
      category: item.category,
      status: 'active',
      _id: { $ne: item._id }
    }).populate('user', 'name email')

    const matches = []
    for (const match of potentialMatches) {
      let score = 30 // category match base

      const newWords = item.title.toLowerCase().split(' ').filter(w => w.length > 2)
      const matchWords = match.title.toLowerCase().split(' ').filter(w => w.length > 2)
      const titleMatches = newWords.filter(w => matchWords.includes(w)).length
      score += titleMatches * 20

      const newDesc = item.description.toLowerCase().split(' ').filter(w => w.length > 3)
      const matchDesc = match.description.toLowerCase().split(' ').filter(w => w.length > 3)
      const descMatches = newDesc.filter(w => matchDesc.includes(w)).length
      score += descMatches * 10

      const loc1 = item.location.toLowerCase()
      const loc2 = match.location.toLowerCase()
      if (loc1 === loc2) score += 25
      else if (loc1.includes(loc2) || loc2.includes(loc1)) score += 15

      const daysDiff = Math.abs(new Date(item.date) - new Date(match.date)) / (1000 * 60 * 60 * 24)
      if (daysDiff <= 1) score += 15
      else if (daysDiff <= 7) score += 5

      if (score >= 30) matches.push({ item: match, score: Math.min(score, 100) })
    }

    matches.sort((a, b) => b.score - a.score)
    res.json(matches.slice(0, 5))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update Item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item nahi mila' })

    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' })

    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete Item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item nahi mila' })

    if (item.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' })

    await item.deleteOne()
    res.json({ message: 'Item delete ho gaya' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem, getMatches }