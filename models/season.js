var mongoose = require('mongoose');
var seasonSchema = new mongoose.Schema({
  name: {
    type: String
  },
  start: {
      type: Date
  },
  supplier: {
      type: String
  }
});

var Season = mongoose.model('Season', seasonSchema);
module.exports = Season;
