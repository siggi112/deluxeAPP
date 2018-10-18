var mongoose = require('mongoose');
var supplierSchema = new mongoose.Schema({
  name: {
    type: String
  },
  company: {
    type: String
  },
  companyid: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  zip: {
    type: String
  },
  country: {
    type: String
  },
  bookingemail: {
    type: String
  },
  invoiceemail: {
    type: String
  },
  phone: {
    type: String
  },
  website: {
    type: String
  },
  type: {
    type: String
  },
  note: {
    type: String
  },
  checkin: {
    type: String
  },
  checkout: {
    type: String
  },
  status: {
    type: String,
    default: 'Active'
  },
  created: {
  type: Date,
  default: Date.now
}
});
var Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
