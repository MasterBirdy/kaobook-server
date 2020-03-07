const express = require("express");
const router = express.Router();
const m = require("../middleware/authcheck");
const Post = require("../models/Post");
const User = require("../models/User");
const { validationResult, check } = require("express-validator");
const bcrypt = require("bcryptjs");

router.post("/", [
    check("firstname")
        .isLength({ min: 1 })
        .trim()
        .withMessage("You must put in your first name")
        .escape(),
    check("lastname")
        .isLength({ min: 1 })
        .trim()
        .withMessage("You must put in your last name")
        .escape(),
    check("password")
        .isLength({ min: 8 })
        .withMessage("Passwords should be 8 characters or longer")
        .trim()
        .escape(),
    check("email")
        .isLength({ min: 3 })
        .trim()
        .withMessage("You must put in your email")
        .escape(),
    (req, res, next) => {
        debugger;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                message: "Error with validation",
                errors: errors.array()
            });
        } else {
            User.findOne({ email: req.body.email }, function(err, results) {
                if (err) {
                    return res
                        .status(400)
                        .json({ success: false, message: "Error", error: err });
                } else if (results !== null) {
                    return res.status(400).json({
                        success: false,
                        message: "Email already exists"
                    });
                } else {
                    bcrypt.hash(
                        req.body.password,
                        10,
                        (err, hashedPassword) => {
                            if (err) {
                                return res.status(400).json({
                                    success: false,
                                    message: "Error with validation",
                                    error: err
                                });
                            }
                            const user = new User({
                                first_name: req.body.firstname,
                                last_name: req.body.lastname,
                                email: req.body.email,
                                birthday: new Date(req.body.birthday),
                                gender: req.body.gender,
                                password: hashedPassword
                            });
                            user.save(err => {
                                if (err) {
                                    return res.status(400).json({
                                        success: false,
                                        message: "Error with saving user",
                                        error: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        success: true,
                                        message: "User saved"
                                    });
                                }
                            });
                        }
                    );
                }
            });
        }
    }
]);

module.exports = router;
