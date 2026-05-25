const mongoose = require('mongoose');

const LendBorrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personName: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['lent', 'borrowed'], required: true },
  note: { type: String },
  dueDate: { type: Date },
  settled: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LendBorrow', LendBorrowSchema);
