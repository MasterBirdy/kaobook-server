const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendTypeSchema = new Schema({
    friend: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        required: true,
        enum: ["Friend", "Sent", "Pending"]
    }
});

module.exports = mongoose.model("FriendType", friendTypeSchema);
