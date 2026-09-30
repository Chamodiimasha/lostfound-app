const mongoose = require('mongoose');
const CATEGORIES = ['Electronics', 'Documents', 'Bags', 'Keys', 'Clothing', 'Other'];
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, enum: CATEGORIES, required: true },
  type: { type: String, enum: ['Lost', 'Found'], required: true },
  location: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Open', 'Returned'], default: 'Open' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
const Item = mongoose.model('Item', itemSchema);
Item.CATEGORIES = CATEGORIES;
module.exports = Item;
