const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const postSchema = new Schema({
    title: { type: String, required: true },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now() }
});

postSchema.set("toJSON", { virtuals: true });

postSchema.virtual("formatted_date").get(function() {
    return moment(this.date).format("LL");
});

module.exports = mongoose.model("Post", postSchema);
