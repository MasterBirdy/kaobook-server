require("dotenv").config();
require("./config/passport-setup");
const express = require("express");
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-routes");
const registerRoutes = require("./routes/register-routes");
const postRoutes = require("./routes/post-routes");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");

const app = express();

app.use(
    cookieSession({
        name: "session",
        maxAge: 24 * 60 * 60 * 1000,
        keys: [process.env.COOKIE_KEY]
    })
);

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

const dev_db_url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}?retryWrites=true&w=majority`;
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/registeruser", registerRoutes);
app.use("/post", postRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("app listening on port 3000");
});
