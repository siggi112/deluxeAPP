var mongoose = require('mongoose');
var travellerSchema = new mongoose.Schema({
    name: {
      type: String
    },
    type: {
      type: String
    },
    bookingid: {
      type: String
    },
    birthdate: {
      type: String
    },
  created: {
    type: Date,
    default: Date.now
  }
});
var Traveller = mongoose.model('Traveller', travellerSchema);
module.exports = Traveller;
