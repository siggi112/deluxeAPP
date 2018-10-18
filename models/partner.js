var mongoose = require('mongoose');
var partnerSchema = new mongoose.Schema({
  name: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  website: {
    type: String
  },
  info: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Active'
  },
  tours: [{}],
});
var Partner = mongoose.model('Partner', partnerSchema);
module.exports = Partner;
