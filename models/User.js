const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    facebookId: { type: String },
    email: { type: String, required: true },
    name: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);
