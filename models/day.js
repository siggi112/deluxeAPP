var mongoose = require('mongoose');
var daySchema = new mongoose.Schema({
  name: {
    type: String
  },
  number: {
    type: Number
  },
  date: {
    type: String
  },
  accommodation: {
    type: String
  },
  driver: {
    type: String
  },
  booking: {
    type: String
  }
});
var Day = mongoose.model('Day', daySchema);
module.exports = Day;
