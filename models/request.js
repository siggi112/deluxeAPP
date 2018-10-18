var mongoose = require('mongoose');
var requestSchema = new mongoose.Schema({
  item: {
    type: String
  },
  file: {
    type: String
  },
  date: {
    type: Date
  },
  supplier: {
    type: String
  },
  suppliername: {
      type: String
  },
  status: {
    type: String
  },
  booking: {
    type: String
  },
  debt: {
    type: Number
  },
  sale: {
    type: Number
  },
  paymentstatus: {
    type: String,
    default: "Unpaid"
  }
});
var Request = mongoose.model('Request', requestSchema);
module.exports = Request;
