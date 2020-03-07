const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {type: String, required: true},
    text: {type: String, required: true},
    likes: [{ type : Schema.Types.ObjectId, ref: 'User' }],
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model("Post", postSchema);
