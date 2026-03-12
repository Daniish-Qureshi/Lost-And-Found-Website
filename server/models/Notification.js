const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['claim', 'claim_approved', 'claim_rejected', 'item_match', 'message'],
    required: true
  },
  message: { type: String, required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  read: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)