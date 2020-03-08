const express = require("express");
const router = express.Router();
const m = require("../middleware/authcheck");
const Post = require("../models/Post");
const User = require("../models/User");
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

router.post("/:id/", m.authCheck, (req, res) => {
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
                like.equals(req.body.id)
            );
            if (isInArray) {
                result.likes = result.likes.filter(
                    like => !like.equals(req.body.id)
                );
            } else {
                result.likes.push(req.body.id);
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

module.exports = router;
