var mongoose = require('mongoose');
var travellerSchema = new mongoose.Schema({
    name: {
      type: String
    },
    bookingid: {
      type: String
    },
    age: {
      type: String
    },
    height: {
      type: String
    },
    weight: {
      type: String
    },
  created: {
    type: Date,
    default: Date.now
  }
});
var Traveller = mongoose.model('Traveller', travellerSchema);
module.exports = Traveller;
