const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  first_name: { type: String, required:true },
  last_name: { type: String, required:true },
  email: { type: String, required:true, lowercase:true },
  phone: { type: String },
  company: { type: String },
  city: { type: String },
  state: { type: String },

  source: {
    type: String,
    enum: ['website','facebook_ads','google_ads','referral','events','other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['new','contacted','qualified','lost','won'],
    default: 'new'
  },
  score: { type: Number, min:0, max:100, default:0 },
  lead_value: { type: Number, default: 0 },
  last_activity_at: { type: Date, default: null },
  is_qualified: { type: Boolean, default: false },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Lead', leadSchema);
