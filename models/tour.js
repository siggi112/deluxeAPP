var mongoose = require('mongoose');
var tourSchema = new mongoose.Schema({
  name: {
    type: String
  },
  type: {
    type: String
  },
  duration: {
    type: String
  },supplier: {
      type: String
  }, vat: {
    type: String
},
  created: {
  type: Date,
  default: Date.now
}
});
var Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
