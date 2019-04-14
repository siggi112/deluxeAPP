var mongoose = require('mongoose');
var driverSchema = new mongoose.Schema({
  name: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  id: {
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
var Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;
