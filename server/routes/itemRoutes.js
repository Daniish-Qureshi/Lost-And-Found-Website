const express = require('express')
const router = express.Router()
const { getItems, getItemById, createItem, updateItem, deleteItem, getMatches } = require('../controllers/itemController')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')
const rateLimit = require('express-rate-limit')
const { Profanity, ProfanityOptions } = require('@2toad/profanity')

const options = new ProfanityOptions()
options.wholeWord = false
const profanity = new Profanity(options)
profanity.addWords(['chutiya', 'madarchod', 'bhenchod', 'harami', 'kutta', 'kamina', 'randi', 'gaandu', 'saala', 'lund', 'gand', 'bhosdike', 'mc', 'bc'])

const postLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  validate: { xForwardedForHeader: false },
  keyGenerator: (req) => req.user?.id || 'anonymous',
  message: { message: 'Bahut zyada items post kar rahe ho! 10 minute baad try karo.' }
})

router.get('/', getItems)
router.get('/:id/matches', protect, getMatches)
router.get('/:id', getItemById)

router.post('/', protect, postLimit, upload.array('images', 3), (req, res, next) => {
  const { title, description } = req.body

  if (!title || title.trim().length < 3)
    return res.status(400).json({ message: 'Title kam se kam 3 characters ka hona chahiye!' })
  if (title.length > 100)
    return res.status(400).json({ message: 'Title 100 characters se zyada nahi ho sakta!' })
  if (!description || description.trim().length < 10)
    return res.status(400).json({ message: 'Description kam se kam 10 characters ka hona chahiye!' })
  if (description.length > 500)
    return res.status(400).json({ message: 'Description 500 characters se zyada nahi ho sakta!' })
  if (profanity.exists(title) || profanity.exists(description))
    return res.status(400).json({ message: 'Aapki post mein inappropriate words hain. Please sahi language use karo.' })

  next()
}, createItem)

router.put('/:id', protect, (req, res, next) => {
  const { title, description } = req.body
  if (title && title.length > 100)
    return res.status(400).json({ message: 'Title 100 characters se zyada nahi ho sakta!' })
  if (description && description.length > 500)
    return res.status(400).json({ message: 'Description 500 characters se zyada nahi ho sakta!' })
  if (profanity.exists(title) || profanity.exists(description))
    return res.status(400).json({ message: 'Inappropriate words hain. Please sahi language use karo.' })
  next()
}, updateItem)

router.delete('/:id', protect, deleteItem)

module.exports = router