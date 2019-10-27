var mongoose = require('mongoose');
var cleaningSchema = new mongoose.Schema({
  car: {
    type: String
  },
  status: {
    type: String,
    default: "In progress"
  },
  date: {
    type: Date,
    default: Date.now,
  },
  km: {
    type: Number
  },
  driver: {
    type: String
  }
});
var Cleaning = mongoose.model('Cleaning', cleaningSchema);
module.exports = Cleaning;
