const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema({
  number_floor: { type: Number, required: true },
  build: { type: mongoose.Schema.Types.ObjectId, ref: "Build" },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
});

module.exports = mongoose.model("Floor", floorSchema);
