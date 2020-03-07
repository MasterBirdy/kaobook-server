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
            callbackURL: "/auth/facebook/redirect",
            profileFields: [
                "id",
                "first_name",
                "last_name",
                "email",
                "picture.type(large)",
                "birthday",
                "gender"
            ]
        },
        (accessToken, refreshToken, profile, done) => {
            console.log("HIII");
            console.log(profile._json.picture.data);
            console.log(profile);
            User.findOne({ facebookId: profile.id }).then(currentUser => {
                if (currentUser) {
                    console.log("here is the current user: ", currentUser);
                    done(null, currentUser);
                } else {
                    new User({
                        facebookId: profile.id,
                        first_name: profile._json.first_name,
                        last_name: profile._json.last_name,
                        email: profile._json.email,
                        profile_pic: profile._json.picture.data.url,
                        birthday: new Date(profile._json.birthday),
                        gender: profile._json.gender
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
