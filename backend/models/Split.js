const mongoose = require('mongoose');

const SplitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  members: [
    {
      name: { type: String, required: true },
      share: { type: Number, required: true },
      amountPaid: { type: Number, default: 0 },
      paid: { type: Boolean, default: false }
    }
  ],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Split', SplitSchema);