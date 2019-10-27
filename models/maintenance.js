var mongoose = require('mongoose');
var maintenanceSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  date: {
      type: Date
  },
  service: {
    type: String,
  },
  km: {
    type: String,
  },
  note: {
    type: String,
  },
  car: {
    type: String,
  },
});
var Maintenance = mongoose.model('Maintenance', maintenanceSchema);
module.exports = Maintenance;
