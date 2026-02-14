const mongoose = require("mongoose");

const vacationSchema = new mongoose.Schema({
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "Supervisor", required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  reason: { type: String, required: true },
  note: { type: String },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vacation", vacationSchema);