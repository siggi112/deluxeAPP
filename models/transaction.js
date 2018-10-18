var mongoose = require('mongoose');
var transactionSchema = new mongoose.Schema({
  bookingId: {
    type: String
  },
  bookingname: {
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
  created: {
    type: Date,
    default: Date.now
  }
});
var Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
