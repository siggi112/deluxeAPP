var mongoose = require('mongoose');
var messageSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  text: {
    type: String,
  },
  type: {
    type: String,
  },
  by: {
    type: String,
  },
  owner: {
    type: String,
  },
});
var Message = mongoose.model('Message', messageSchema);
module.exports = Message;
