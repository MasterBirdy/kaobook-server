const express = require("express");
const router = express.Router();
const m = require("../middleware/authcheck");
const Post = require("../models/Post");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");

router.get("/", m.authCheck, (req, res) => {
    res.status(200).json({ success: true, data: req.user });
});

router.get("/:id/profile", m.authCheck, (req, res) => {
    User.findById(req.params.id, (err, result) => {
        if (err)
            return res
                .status(400)
                .json({ success: false, message: "Error", error: err });
        else if (!result) {
            return res
                .status(400)
                .json({ success: false, message: "Not found!" });
        } else {
            return res.status(200).json({
                success: true,
                message: "Success!",
                data: result
            });
        }
    });
});

router.put("/:id/edit", m.authCheck, [
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
    check("email")
        .isLength({ min: 3 })
        .trim()
        .withMessage("You must put in your email")
        .escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                message: "Error with validation",
                errors: errors.array()
            });
        } else {
            User.findById(req.params.id, (err, doc) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "Error",
                        error: err
                    });
                } else {
                    if (!doc) {
                        return res.status(400).json({
                            success: false,
                            message: "Not found!",
                            error: "Error"
                        });
                    } else {
                        doc.first_name = req.body.firstname;
                        doc.last_name = req.body.lastname;
                        doc.email = req.body.email;
                        doc.birthday = new Date(req.body.birthday);
                        doc.gender = req.body.gender;
                        doc.profile_pic = req.body.profilePic
                            ? req.body.profilePic
                            : "";
                        doc.save(err => {
                            if (err) {
                                return res.status(400).json({
                                    success: false,
                                    message: "Error",
                                    error: err
                                });
                            } else {
                                return res.status(200).json({
                                    success: true,
                                    message: "Success!"
                                });
                            }
                        });
                    }
                }
            });
        }
    }
]);

router.get("/:id/timeline", m.authCheck, (req, res) => {
    User.findById(req.params.id)
        .populate({
            path: "timeline",
            model: "Post",
            populate: [
                {
                    path: "author",
                    model: "User",
                    select: ["first_name", "last_name", "profile_pic"]
                },
                {
                    path: "comments",
                    model: "Comment",
                    populate: [
                        {
                            path: "author",
                            model: "User",
                            select: ["first_name", "last_name", "profile_pic"]
                        }
                    ]
                }
            ]
        })
        .exec((err, result) => {
            if (err)
                return res
                    .status(400)
                    .json({ success: false, message: "Error", error: err });
            else if (!result) {
                return res
                    .status(400)
                    .json({ success: false, message: "Not found!" });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "Success!",
                    user: result
                });
            }
        });
});

// add a post to a person's timeline

router.post("/:id/post", m.authCheck, m.friendCheck, [
    check("title")
        .isLength({ min: 1 })
        .trim()
        .withMessage("You must put in a title")
        .escape(),
    check("text")
        .isLength({ min: 1 })
        .trim()
        .withMessage("You must put in some text")
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Errors with posting",
                errors: errors.array()
            });
        } else {
            const post = new Post({
                title: req.body.title,
                text: req.body.text,
                user: req.params.id,
                author: req.body.author
            });
            post.save(err => {
                if (err)
                    return res
                        .status(400)
                        .json({ success: false, message: err.message });
                User.findById(post.user).exec(function(err, results) {
                    if (err)
                        return res
                            .status(400)
                            .json({ success: false, message: err.message });
                    results.timeline.push(post);
                    results.save(err => {
                        if (err)
                            return res
                                .status(400)
                                .json({ success: false, message: err.message });
                        return res.status(200).json({
                            success: true,
                            message: "Success!",
                            post
                        });
                    });
                });
            });
        }
    }
]);

module.exports = router;
