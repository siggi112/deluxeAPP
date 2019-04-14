var mongoose = require('mongoose');
var transferSchema = new mongoose.Schema({
  type: {
    type: String
  },
  bookingid: {
    type: String
  },
  bookingname: {
    type: String
  },
  date: {
    type: Date
  },
  flightnumber: {
    type: String
  },
  flighttime: {
    type: String
  },
  pickuptime: {
    type: String
  },
  location: {
    type: String
  },
  people: {
    type: String
  },
  extraInfo: {
    type: String
  },
  driver: {
    type: String
  },
  driverPhone: {
    type: String
  },
  status: {
    type: String,
    default: "Not Confirmed"
  },
  created: {
  type: Date,
  default: Date.now
}
});
var Transfer = mongoose.model('Transfer', transferSchema);
module.exports = Transfer;
