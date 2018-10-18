var mongoose = require('mongoose');
var carSchema = new mongoose.Schema({
  make: {
    type: String
  },
  model: {
    type: String
  },
  passengers: {
    type: String
  },
  number: {
    type: String
  },
  year: {
    type: String
  },
  drive: {
    type: String
  },
  created: {
  type: Date,
  default: Date.now
},
status: {
  type: String,
  default: "Active"
}
});
var Car = mongoose.model('Car', carSchema);
module.exports = Car;
