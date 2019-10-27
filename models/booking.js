var mongoose = require('mongoose');
var bookingSchema = new mongoose.Schema({
    firstname: {
      type: String
    },
    lastname: {
      type: String
    },
    bookingnumber: {
       type: String,
       unique: true,
   },
    cart: [{}],
    email: {
      type: String
    },
    phonenumber: {
      type: String
    },
    address: {
      type: String
    },
    zip: {
      type: String
    },
    city: {
      type: String
    },
    country: {
      type: String
    },
    arrivaldate: {
      type: Date
    },
    departuredate: {
      type: String
    },
    travellers: {
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
    itinerary: {
      type: String
    },
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "Pending"
  }
});
var Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
