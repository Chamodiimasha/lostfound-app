const mongoose = require('mongoose');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { httpError, asyncHandler } = require('../middleware/error');

const loadClaim = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid claim id');
  const claim = await Claim.findById(id).populate('item').populate('claimant', 'name email');
  if (!claim) throw httpError(404, 'Claim not found');
  return claim;
};
const checkMessage = (m) => {
  if (!m || m.trim().length < 5) throw httpError(400, 'Message must be at least 5 characters (say how you can prove ownership)');
};

// CREATE - rules: item must be Open, cannot claim own item, no duplicate active claim
exports.createClaim = asyncHandler(async (req, res) => {
  const { itemId, message } = req.body;
  if (!mongoose.isValidObjectId(itemId)) throw httpError(400, 'Valid itemId is required');
  checkMessage(message);
  const item = await Item.findById(itemId);
  if (!item) throw httpError(404, 'Item not found');
  if (item.status !== 'Open') throw httpError(409, 'This item has already been returned');
  if (String(item.reportedBy) === String(req.user._id)) throw httpError(400, 'You cannot claim your own item');
  const existing = await Claim.findOne({ item: itemId, claimant: req.user._id, status: { $in: ['Pending', 'Approved'] } });
  if (existing) throw httpError(409, 'You already have an active claim on this item');
  res.status(201).json(await Claim.create({ item: itemId, claimant: req.user._id, message }));
});

exports.getMyClaims = asyncHandler(async (req, res) => {
  res.json(await Claim.find({ claimant: req.user._id }).sort({ createdAt: -1 }).populate('item', 'title image status type'));
});

exports.getClaimsForItem = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.itemId)) throw httpError(400, 'Invalid item id');
  const item = await Item.findById(req.params.itemId);
  if (!item) throw httpError(404, 'Item not found');
  if (String(item.reportedBy) !== String(req.user._id)) throw httpError(403, 'Only the reporter can see claims');
  res.json(await Claim.find({ item: item._id }).sort({ createdAt: -1 }).populate('claimant', 'name email'));
});

exports.getClaim = asyncHandler(async (req, res) => {
  const claim = await loadClaim(req.params.id);
  const isReporter = String(claim.item.reportedBy) === String(req.user._id);
  if (!isReporter && String(claim.claimant._id) !== String(req.user._id)) throw httpError(403, 'Not allowed');
  res.json(claim);
});

// UPDATE - claimant may edit the message only while Pending
exports.updateClaim = asyncHandler(async (req, res) => {
  const claim = await loadClaim(req.params.id);
  if (String(claim.claimant._id) !== String(req.user._id)) throw httpError(403, 'Not your claim');
  if (claim.status !== 'Pending') throw httpError(409, 'Only pending claims can be edited');
  checkMessage(req.body.message);
  claim.message = req.body.message;
  await claim.save();
  res.json(claim);
});

// STATUS CHANGE - reporter approves/rejects.
// Approve => item becomes Returned AND all other Pending claims are auto-rejected.
exports.decideClaim = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) throw httpError(400, 'Status must be Approved or Rejected');
  const claim = await loadClaim(req.params.id);
  if (String(claim.item.reportedBy) !== String(req.user._id)) throw httpError(403, 'Only the reporter can decide claims');
  if (claim.status !== 'Pending') throw httpError(409, `Claim is already ${claim.status}`);
  if (status === 'Approved') {
    if (claim.item.status !== 'Open') throw httpError(409, 'Item has already been returned');
    await Item.findByIdAndUpdate(claim.item._id, { status: 'Returned' });
    await Claim.updateMany({ item: claim.item._id, _id: { $ne: claim._id }, status: 'Pending' }, { status: 'Rejected' });
  }
  claim.status = status;
  await claim.save();
  res.json(claim);
});

// CANCEL - claimant withdraws. Cancelling an Approved claim re-opens the item.
exports.cancelClaim = asyncHandler(async (req, res) => {
  const claim = await loadClaim(req.params.id);
  if (String(claim.claimant._id) !== String(req.user._id)) throw httpError(403, 'Not your claim');
  if (!['Pending', 'Approved'].includes(claim.status)) throw httpError(409, `A ${claim.status} claim cannot be cancelled`);
  if (claim.status === 'Approved') await Item.findByIdAndUpdate(claim.item._id, { status: 'Open' });
  claim.status = 'Cancelled';
  await claim.save();
  res.json(claim);
});

// DELETE - claimant removes a finished (Rejected/Cancelled) claim from their history
exports.deleteClaim = asyncHandler(async (req, res) => {
  const claim = await loadClaim(req.params.id);
  if (String(claim.claimant._id) !== String(req.user._id)) throw httpError(403, 'Not your claim');
  if (!['Rejected', 'Cancelled'].includes(claim.status)) throw httpError(409, 'Cancel the claim before deleting it');
  await claim.deleteOne();
  res.json({ message: 'Claim deleted' });
});
