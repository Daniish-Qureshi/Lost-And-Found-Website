const Claim = require('../models/Claim')
const Item = require('../models/Item')
const Notification = require('../models/Notification')

const createClaim = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).populate('user')
    if (!item) return res.status(404).json({ message: 'Item nahi mila' })

    if (item.user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Apna khud ka item claim nahi kar sakte' })

    const claim = await Claim.create({
      item: req.params.itemId,
      claimant: req.user._id,
      description: req.body.description,
    })

    item.claims.push(claim._id)
    await item.save()

    // Notification to item owner
    await Notification.create({
      recipient: item.user._id,
      sender: req.user._id,
      type: 'claim',
      message: `${req.user.name} ne tumhara item "${item.title}" claim kiya hai`,
      item: item._id,
    })

    res.status(201).json(claim)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('item', 'title type')
      .populate('claimant', 'name email')
      .sort({ createdAt: -1 })
    res.json(claims)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item')
    if (!claim) return res.status(404).json({ message: 'Claim nahi mila' })

    claim.status = req.body.status
    await claim.save()

    if (req.body.status === 'approved') {
      await Item.findByIdAndUpdate(claim.item._id, { status: 'claimed' })
    }

    // Notify claimant
    await Notification.create({
      recipient: claim.claimant,
      sender: req.user._id,
      type: req.body.status === 'approved' ? 'claim_approved' : 'claim_rejected',
      message: req.body.status === 'approved'
        ? `🎉 Tumhara claim "${claim.item?.title}" approve ho gaya!`
        : `❌ Tumhara claim "${claim.item?.title}" reject ho gaya`,
      item: claim.item._id,
    })

    res.json(claim)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createClaim, getClaims, updateClaim }