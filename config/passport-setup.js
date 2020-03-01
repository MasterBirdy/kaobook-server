require("dotenv").config();
const passport = require("passport");
const FacebookStrategy = require("passport-facebook");
const User = require("../models/User");

passport.serializeUser((user, done) => {
    console.log(user.id);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.APP_ID,
            clientSecret: process.env.APP_SECRET,
            callbackURL: "/auth/facebook/redirect"
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({ facebookId: profile.id }).then(currentUser => {
                if (currentUser) {
                    console.log("here is the current user: ", currentUser);
                    done(null, currentUser);
                } else {
                    new User({
                        facebookId: profile.id,
                        name: profile.displayName,
                        email: "abc@123.com"
                    })
                        .save()
                        .then(newUser => {
                            console.log("new user created: " + newUser);
                            done(null, newUser);
                        })
                        .catch(err => console.log(err));
                }
            });
        }
    )
);
