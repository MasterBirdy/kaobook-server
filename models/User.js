const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    facebookId: { type: String },
    email: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    password: { type: String },
    profile_pic: { type: String },
    birthday: { type: Date },
    gender: { type: String, enum: ["male", "female", "non-binary"] },
    timeline: [{ type: Schema.Types.ObjectId, ref: "Post" }]
});

userSchema.set("toJSON", { virtuals: true });

userSchema.virtual("name").get(function() {
    return this.first_name + " " + this.last_name;
});

module.exports = mongoose.model("User", userSchema);
