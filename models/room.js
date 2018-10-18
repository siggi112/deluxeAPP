var mongoose = require('mongoose');
var roomSchema = new mongoose.Schema({
  type: {
    type: String
  },
  sleeps: {
    type: Number
  },
  numberofrooms: {
    type: String
  },
  supplier: {
    type: String
  }
});
var Room = mongoose.model('Room', roomSchema);
module.exports = Room;
