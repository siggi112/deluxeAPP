var mongoose = require('mongoose');
var priceSchema = new mongoose.Schema({
  isk: {
    type: Number
  },
  breakfast: {
    type: Number
  },
  tax: {
    type: Number
  },
  use: {
    type: String,
    default: "ISK"
  },
  season: {
    type: String
  },
  item: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});
var Price = mongoose.model('Price', priceSchema);
module.exports = Price;
