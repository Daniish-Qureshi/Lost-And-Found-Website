const express = require('express')
const router = express.Router()
const { getItems, getItemById, createItem, updateItem, deleteItem, getMatches } = require('../controllers/itemController')
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.get('/', getItems)
router.get('/:id/matches', protect, getMatches)
router.get('/:id', getItemById)
router.post('/', protect, upload.array('images', 5), createItem)
router.put('/:id', protect, updateItem)
router.delete('/:id', protect, deleteItem)

module.exports = router