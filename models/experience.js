var mongoose = require('mongoose');
var experienceSchema = new mongoose.Schema({
    name: {
      type: String
    },
    type: {
      type: String
    },
    bookingid: {
      type: String
    },
    arrivaldate: {
      type: String
    },
    departuredate: {
      type: String
    },
    travellersCount: {
      type: String
    },
    specialrequest: {
      type: String
    },
    arrivalflight: {
      type: String
    },
    departureflight: {
      type: String
    },
    finalprice: {
      type: Number
    },
  created: {
    type: Date,
    default: Date.now
  }
});
var Experience = mongoose.model('Experience', experienceSchema);
module.exports = Experience;
