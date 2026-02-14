const mongoose = require("mongoose");

const buildSchema = new mongoose.Schema({
    number_build: { type: Number, required: true },
    floors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Floor" }],
});

module.exports = mongoose.model("Build", buildSchema);
