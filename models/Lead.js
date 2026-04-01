const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    source: String,

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isAssigned: {
      type: Boolean,
      default: false,
    },

    called: {
      type: Boolean,
      default: false,
    },

    response: {
      type: String,
      enum: ["interested", "not_interested", "no_answer", "callback"],
      default: "no_answer",
    },

    isViewed: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
    },
    interResults: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);