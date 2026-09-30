const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { httpError, asyncHandler } = require('../middleware/error');

const removeFile = (url) => {
  if (!url || !url.includes('/uploads/')) return;
  fs.unlink(path.join(__dirname, '..', 'uploads', path.basename(url)), () => {});
};
const dropUpload = (req) => { if (req.file) fs.unlink(req.file.path, () => {}); };
const fileUrl = (req) => `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

const validate = (b) => {
  const e = [];
  if (!b.title || b.title.trim().length < 3) e.push('Title must be at least 3 characters');
  if (!b.description || b.description.trim().length < 10) e.push('Description must be at least 10 characters');
  if (!Item.CATEGORIES.includes(b.category)) e.push('Invalid category');
  if (!['Lost', 'Found'].includes(b.type)) e.push('Type must be Lost or Found');
  if (!b.location || !b.location.trim()) e.push('Location is required');
  return e;
};

const loadItem = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid item id');
  const item = await Item.findById(id).populate('reportedBy', 'name email');
  if (!item) throw httpError(404, 'Item not found');
  return item;
};

exports.createItem = asyncHandler(async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) { dropUpload(req); throw httpError(400, errors.join('. ')); }
  const { title, description, category, type, location } = req.body;
  const item = await Item.create({
    title, description, category, type, location,
    image: req.file ? fileUrl(req) : '',
    reportedBy: req.user._id,
  });
  res.status(201).json(item);
});

exports.getItems = asyncHandler(async (req, res) => {
  const filter = {};
  if (['Open', 'Returned'].includes(req.query.status)) filter.status = req.query.status;
  if (['Lost', 'Found'].includes(req.query.type)) filter.type = req.query.type;
  if (req.query.search) filter.title = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  res.json(await Item.find(filter).sort({ createdAt: -1 }).populate('reportedBy', 'name'));
});

exports.getItem = asyncHandler(async (req, res) => res.json(await loadItem(req.params.id)));

exports.updateItem = asyncHandler(async (req, res) => {
  let item;
  try { item = await loadItem(req.params.id); } catch (e) { dropUpload(req); throw e; }
  if (String(item.reportedBy._id) !== String(req.user._id)) { dropUpload(req); throw httpError(403, 'Only the reporter can edit this item'); }
  const errors = validate(req.body);
  if (errors.length) { dropUpload(req); throw httpError(400, errors.join('. ')); }
  const { title, description, category, type, location } = req.body;
  Object.assign(item, { title, description, category, type, location });
  if (req.file) { removeFile(item.image); item.image = fileUrl(req); }
  await item.save();
  res.json(item);
});

exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await loadItem(req.params.id);
  if (String(item.reportedBy._id) !== String(req.user._id)) throw httpError(403, 'Only the reporter can delete this item');
  await Claim.deleteMany({ item: item._id }); // no orphan claims
  removeFile(item.image);
  await item.deleteOne();
  res.json({ message: 'Item deleted' });
});
