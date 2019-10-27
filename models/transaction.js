var mongoose = require('mongoose');
var transactionSchema = new mongoose.Schema({
  bookingId: {
    type: String
  },
  bookingname: {
    type: String
  },
  referencenumber: {
    type: String
  },
  amount: {
    type: Number
  },
  status: {
    type: String
  },
  date: {
    type: Date
  },
  orderhash: {
    type: String
  },
  reason: {
    type: String
  },
  method: {
    type: String,
    default: "Credit Card"
  },
  created: {
    type: Date,
    default: Date.now
  }
});
var Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
