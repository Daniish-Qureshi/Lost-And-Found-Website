const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  category: {
    type: String,
    enum: ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Books', 'Sports', 'Keys', 'Wallet', 'Other'],
    required: true
  },
  status: { type: String, enum: ['active', 'claimed', 'closed'], default: 'active' },
  images: [{ type: String }],
  location: { type: String, required: true },
  date: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claims: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Claim' }],
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);