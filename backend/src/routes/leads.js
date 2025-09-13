const express = require('express');
const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();

function buildFilters(query) {
  const filters = {};
  if (query.email_eq) filters.email = query.email_eq;
  if (query.email_contains) filters.email = { $regex: query.email_contains, $options: 'i' };

  if (query.company_eq) filters.company = query.company_eq;
  if (query.company_contains) filters.company = { $regex: query.company_contains, $options: 'i' };

  if (query.city_eq) filters.city = query.city_eq;
  if (query.city_contains) filters.city = { $regex: query.city_contains, $options: 'i' };

  if (query.status) filters.status = query.status;
  if (query.status_in) filters.status = { $in: query.status_in.split(',') };

  if (query.source) filters.source = query.source;
  if (query.source_in) filters.source = { $in: query.source_in.split(',') };

  if (query.score_eq) filters.score = Number(query.score_eq);
  if (query.score_gt) filters.score = { ...(filters.score||{}), $gt: Number(query.score_gt) };
  if (query.score_lt) filters.score = { ...(filters.score||{}), $lt: Number(query.score_lt) };
  if (query.score_between) {
    const [a,b] = query.score_between.split(',').map(Number);
    filters.score = { $gte: a, $lte: b };
  }

  if (query.lead_value_eq) filters.lead_value = Number(query.lead_value_eq);
  if (query.lead_value_gt) filters.lead_value = { ...(filters.lead_value||{}), $gt: Number(query.lead_value_gt) };
  if (query.lead_value_lt) filters.lead_value = { ...(filters.lead_value||{}), $lt: Number(query.lead_value_lt) };
  if (query.lead_value_between) {
    const [a,b] = query.lead_value_between.split(',').map(Number);
    filters.lead_value = { $gte: a, $lte: b };
  }

  if (query.created_on) {
    const d = new Date(query.created_on);
    const next = new Date(d); next.setDate(next.getDate()+1);
    filters.created_at = { $gte: d, $lt: next };
  }
  if (query.created_before) filters.created_at = { ...(filters.created_at||{}), $lt: new Date(query.created_before) };
  if (query.created_after) filters.created_at = { ...(filters.created_at||{}), $gt: new Date(query.created_after) };
  if (query.created_between) {
    const [a,b] = query.created_between.split(',');
    filters.created_at = { $gte: new Date(a), $lte: new Date(b) };
  }

  if (query.last_activity_on) {
    const d = new Date(query.last_activity_on);
    const next = new Date(d); next.setDate(next.getDate()+1);
    filters.last_activity_at = { $gte: d, $lt: next };
  }
  if (query.last_activity_before) filters.last_activity_at = { ...(filters.last_activity_at||{}), $lt: new Date(query.last_activity_before) };
  if (query.last_activity_after) filters.last_activity_at = { ...(filters.last_activity_at||{}), $gt: new Date(query.last_activity_after) };
  if (query.last_activity_between) {
    const [a,b] = query.last_activity_between.split(',');
    filters.last_activity_at = { $gte: new Date(a), $lte: new Date(b) };
  }

  if (query.is_qualified !== undefined) {
    const val = (query.is_qualified === 'true' || query.is_qualified === '1');
    filters.is_qualified = val;
  }

  return filters;
}

function canAccessLead(user, leadDoc) {
  if (!leadDoc) return false;
  if (!user) return false;
  if (user.role === 'admin') return true;
  return leadDoc.created_by && leadDoc.created_by.toString() === user._id.toString();
}

router.post('/', protect, asyncHandler(async (req, res) => {
  const { first_name, last_name, email } = req.body;
  if (!first_name || !last_name || !email) return res.status(400).json({ message: 'Missing required fields' });

  try {
    const payload = { ...req.body, created_by: req.user._id };
    const lead = await Lead.create(payload);
    res.status(201).json(lead);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists for a lead' });
    throw err;
  }
}));

router.get('/', protect, asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Number(req.query.limit || 20));
  const skip = (page - 1) * limit;

  const filters = buildFilters(req.query);

  if (req.user.role !== 'admin') {
    filters.created_by = req.user._id;
  } else {
    if (req.query.created_by) filters.created_by = req.query.created_by;
  }

  const [total, data] = await Promise.all([
    Lead.countDocuments(filters),
    Lead.find(filters).sort({ created_at: -1 }).skip(skip).limit(limit).populate('created_by', 'name email')
  ]);

  const totalPages = Math.ceil(total / limit);
  res.json({ data, page, limit, total, totalPages });
}));

router.get('/:id', protect, asyncHandler(async (req,res) => {
  const lead = await Lead.findById(req.params.id).populate('created_by', 'name email');
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  if (!canAccessLead(req.user, lead)) return res.status(403).json({ message: 'Forbidden' }); 
  res.json(lead);
}));

router.put('/:id', protect, asyncHandler(async (req,res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  if (!canAccessLead(req.user, lead)) return res.status(403).json({ message: 'Forbidden' });

  const updates = { ...req.body };
  delete updates.created_by;

  Object.assign(lead, updates);
  await lead.save();
  res.json(lead);
}));

router.delete('/:id', protect, asyncHandler(async (req,res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  if (!canAccessLead(req.user, lead)) return res.status(403).json({ message: 'Forbidden' });

  await lead.remove();
  res.json({ message: 'Deleted' });
}));

module.exports = router;
