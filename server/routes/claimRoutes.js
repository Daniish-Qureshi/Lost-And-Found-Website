const express = require('express');
const router = express.Router();
const { createClaim, getClaims, updateClaim } = require('../controllers/claimController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/:itemId', protect, createClaim);
router.get('/', protect, adminOnly, getClaims);
router.put('/:id', protect, adminOnly, updateClaim);

module.exports = router;