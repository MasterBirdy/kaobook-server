const express = require("express");
const router = express.Router();
const m = require("../middleware/authcheck");
const Post = require("../models/Post");
const User = require("../models/User");
const { validationResult, check } = require("express-validator");

router.get("/", m.authCheck, (req, res) => {
    res.status(200).json({ success: true, data: req.user });
});

router.get("/:id/timeline", (req, res) => {
    User.findById(req.params.id)
        .populate({
            path: "timeline",
            model: "Post",
            populate: {
                path: "author",
                model: "User",
                select: ["first_name", "last_name", "profile_pic"]
            }
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
                    timeline: result.timeline
                });
            }
        });
});

router.post("/:id/post", m.authCheck, [
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
