const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { validationResult, check } = require("express-validator");

router.get(
    "/facebook",
    passport.authenticate("facebook", {
        failureRedirect: "http://localhost:8080",
        scope: [
            "public_profile",
            "email",
            "user_photos",
            "user_birthday",
            "user_gender"
        ]
    })
);

router.get(
    "/facebook/redirect",
    passport.authenticate("facebook"),
    (req, res) => {
        console.log("HIII");
        console.log(req.user);
        res.redirect("http://localhost:8080/");
    }
);

router.post("/login", [
    check("email")
        .isLength({ min: 1 })
        .trim()
        .withMessage("You must put in your email")
        .escape(),
    check("password")
        .isLength({ min: 8 })
        .withMessage("Passwords should be 8 characters or longer")
        .trim()
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                message: "Error with validation",
                errors: errors.array()
            });
        } else {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (err) {
                    return res
                        .status(400)
                        .json({ success: false, message: "Error", error: err });
                } else if (results === null) {
                    return res.status(400).json({
                        success: false,
                        message: "Email not found"
                    });
                } else {
                    bcrypt.compare(
                        req.body.password,
                        user.password,
                        (err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    success: false,
                                    message: "Error",
                                    error: err
                                });
                            } else if (result) {
                                res.cookie("auth", token);
                                return res.status(200).json({
                                    success: true,
                                    message: "Success!"
                                });
                            } else {
                                return res.status(400).json({
                                    success: false,
                                    message: "Passwords do not match"
                                });
                            }
                        }
                    );
                }
            });
        }
    }
]);

router.get("/logout", (req, res) => {
    console.log(req.user);
    console.log("BYYYE");
    req.logout();
    res.redirect("http://localhost:8080/");
});

module.exports = router;
