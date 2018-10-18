var mongoose = require('mongoose');
var itemSchema = new mongoose.Schema({
  name: {
    type: String
  },
  season: {
    type: String
  },
  netrate: {
    type: String
  },
  saleprice: {
    type: String
  },
  partner: {
    type: String
  }
});
var Item = mongoose.model('Item', itemSchema);
module.exports = Item;
