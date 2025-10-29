const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  iban: {
    type: String,
    required: true,
    trim: true,
    // validate: {
    //   validator: v => /^[0-9A-Z]{15,34}$/.test(v),
    //   message: props => `${props.value} is not a valid IBAN`
    // }
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  payoutId: {        // معرف العملية في Stripe بعد التنفيذ
    type: String
  },
  status: {          // حالة العملية: pending, paid, failed
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
