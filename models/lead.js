var mongoose = require('mongoose');
var leadSchema = new mongoose.Schema({
  firstname: {
    type: String
  },
  email: {
    type: String
  },
  country: {
    type: String
  },
  phone: {
    type: String
  },
  travellers: {
    type: String
  },
  pax: {
    type: Number
  },
  budget: {
    type: String
  },
  arrivaldate: {
    type: Date
  },
  departuredate: {
    type: Date
  },
  startdate: [{}],
  trip: {
    type: String
  },
  notes: {
    type: String
  },
  referencenumber: {
    type: String,
    unique: true,
  },
  total: {
    type: Number
  },
  trip: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'Website'
  },
  assignedId: {
    type: String,
  },
  assignedName: {
    type: String,
},
  status: {
    type: String,
    default: 'New'
  },
});

var Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
