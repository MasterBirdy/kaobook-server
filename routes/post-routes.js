const express = require("express");
const router = express.Router();
const m = require("../middleware/authcheck");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { validationResult, check } = require("express-validator");

router.get("/:id/", (req, res) => {
    Post.findById(req.params.id, (err, result) => {
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
                message: "Success!"
            });
        }
    });
});

// like/unlike
router.post("/:id/", m.authCheck, m.friendCheck, (req, res) => {
    Post.findById(req.params.id, (err, result) => {
        if (err)
            return res
                .status(400)
                .json({ success: false, message: "Error", error: err });
        else if (!result) {
            return res
                .status(400)
                .json({ success: false, message: "Not found!" });
        } else {
            const isInArray = result.likes.some(like =>
                like.equals(req.body.author)
            );
            if (isInArray) {
                result.likes = result.likes.filter(
                    like => !like.equals(req.body.author)
                );
            } else {
                result.likes.push(req.body.author);
            }
            result.save(err => {
                if (err)
                    return res
                        .status(400)
                        .json({ success: false, message: "Error", error: err });
                return res.status(200).json({
                    success: true,
                    message: "Success!",
                    removed: isInArray,
                    post: result
                });
            });
        }
    });
});

// add a comment to a user post on a timeline

router.post("/:id/comment", m.authCheck, m.friendCheck, [
    check("text")
        .isLength({ min: 1 })
        .trim()
        .withMessage("You must put in some text")
        .escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Errors with posting",
                errors: errors.array()
            });
        }
        Post.findById(req.params.id, (err, result) => {
            if (err)
                return res
                    .status(400)
                    .json({ success: false, message: "Error", error: err });
            else if (!result) {
                return res
                    .status(400)
                    .json({ success: false, message: "Not found!" });
            } else {
                const comment = new Comment({
                    text: req.body.text,
                    author: req.body.author,
                    post: req.params.id
                });
                comment.save(err => {
                    if (err)
                        return res.status(400).json({
                            success: false,
                            message: "Error",
                            error: err
                        });
                    else {
                        result.comments.push(comment);
                        result.save(err => {
                            if (err)
                                return res.status(400).json({
                                    success: false,
                                    message: "Error",
                                    error: err
                                });
                            else {
                                return res.status(200).json({
                                    success: true,
                                    message: "Success!",
                                    comment
                                });
                            }
                        });
                    }
                });
            }
        });
    }
]);

module.exports = router;
