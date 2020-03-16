const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { validationResult, check } = require("express-validator");
const jwt = require("jsonwebtoken");

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
        res.redirect("http://localhost:8080/redirect");
    }
);

router.get("/getfacebookauth", (req, res) => {
    if (req.user) {
        User.findById(req.user._id, (err, user) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Error?",
                    error: err
                });
            } else if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User not found!"
                });
            } else {
                jwt.sign(
                    { ...user },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" },
                    (err, token) => {
                        if (err) {
                            return res.status(400).json({
                                success: false,
                                message: "Error?",
                                error: err
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                message: "Success!",
                                token
                            });
                        }
                    }
                );
            }
        });
    } else {
        return res
            .status(403)
            .json({ success: false, message: "No user existing on facebook" });
    }
});

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
                } else if (user === null) {
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
                                jwt.sign(
                                    { ...user },
                                    process.env.JWT_SECRET,
                                    { expiresIn: "24h" },
                                    (err, token) => {
                                        if (err) {
                                            return res.status(400).json({
                                                success: false,
                                                message: "Error?",
                                                error: err
                                            });
                                        }
                                        req.user = user;
                                        return res.status(200).json({
                                            success: true,
                                            message: "Success!",
                                            token
                                        });
                                    }
                                );
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
    req.logout();
    res.redirect("http://localhost:8080/");
});

module.exports = router;
