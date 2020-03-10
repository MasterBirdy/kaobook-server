const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const commentSchema = new Schema({
    text: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now() }
});

commentSchema.set("toJSON", { virtuals: true });

commentSchema.virtual("formatted_date").get(function() {
    return moment(this.date).format("LLL");
});

module.exports = mongoose.model("Comment", commentSchema);
