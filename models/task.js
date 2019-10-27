var mongoose = require('mongoose');
var taskSchema = new mongoose.Schema({
  owner: {
    type: String
  },
  name: {
    type: Number
  },
  status: {
    type: String,
    default: "Not done"
  },
  group: {
    type: Number
  }
});
var Task = mongoose.model('Task', taskSchema);
module.exports = Task;
