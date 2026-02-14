const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    number_room: { type: Number, required: true },
    capacity: { type: Number, required: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: "Floor" },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Room", roomSchema);
