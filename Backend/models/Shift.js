const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  start_time: { type: String, required: true }, // "08:00"
  end_time: { type: String, required: true },   // "14:00"
  buildId: { type: mongoose.Schema.Types.ObjectId, ref: "Build", required: true },
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: "Floor", required: true },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "Supervisor", required: true },
  note: { type: String },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Shift", shiftSchema);
