var mongoose = require('mongoose');
var detailsSchema = new mongoose.Schema({
  address: {
    type: String
  },
  zip: {
    type: String
  },
  date: {
    type: String
  },
  phonenumber: {
    type: String
  },
  printed: {
    type: Boolean,
    default: false
  },
  city: {
    type: String
  },
  pax: {
    type: Number
  },
  email: {
    type: String
  },
  country: {
    type: String
  },
  arrivaldate: {
    type: Date
  },
  departuredate: {
    type: Date
  },
  bookingnumber: {
    type: String
  },
  arrivalflight: {
    type: String
  },
  departureflight: {
    type: String
  },
  specialrequest: {
    type: String
  },
  itinerary: {
    type: String
  },
});
var Detail = mongoose.model('Detail', detailsSchema);
module.exports = Detail;
