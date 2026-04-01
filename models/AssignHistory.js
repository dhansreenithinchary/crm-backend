const mongoose = require("mongoose");

const assignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  count: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AssignHistory", assignSchema);