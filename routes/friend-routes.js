const express = require("express");
const router = express.Router();
const m = require("../middleware/authcheck");
const User = require("../models/User");
const FriendType = require("../models/FriendType");

router.post("/:id/", (req, res) => {
    User.findById(req.params.id)
        .populate("friends")
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
                if (req.params.id.toString() === req.body.id.toString()) {
                    return res
                        .status(400)
                        .json({
                            success: false,
                            message: "Can't add yourself"
                        });
                }
                if (
                    result.friends.some(friend => {
                        return (
                            friend.friend.toString() === req.body.id.toString()
                        );
                    })
                )
                    return res.status(400).json({
                        success: false,
                        message: "Friend already found!"
                    });

                const friendTypeA = new FriendType({
                    friend: req.body.id,
                    status: "Pending"
                });
                friendTypeA.save(err => {
                    if (err)
                        return res.status(400).json({
                            success: false,
                            message: "Error",
                            error: err
                        });
                    else {
                        result.friends.push(friendTypeA);
                        result.save(err => {
                            if (err)
                                return res.status(400).json({
                                    success: false,
                                    message: "Error",
                                    error: err
                                });
                            else {
                                User.findById(req.body.id, (err, resultB) => {
                                    if (err)
                                        return res.status(400).json({
                                            success: false,
                                            message: "Error",
                                            error: err
                                        });
                                    else if (!result) {
                                        return res.status(400).json({
                                            success: false,
                                            message: "Not found!"
                                        });
                                    } else {
                                        const friendTypeB = new FriendType({
                                            friend: req.params.id,
                                            status: "Sent"
                                        });
                                        friendTypeB.save(err => {
                                            if (err)
                                                return res.status(400).json({
                                                    success: false,
                                                    message: "Error",
                                                    error: err
                                                });
                                            else {
                                                resultB.friends.push(
                                                    friendTypeB
                                                );
                                                resultB.save(err => {
                                                    if (err)
                                                        return res
                                                            .status(400)
                                                            .json({
                                                                success: false,
                                                                message:
                                                                    "Error",
                                                                error: err
                                                            });
                                                    else {
                                                        return res
                                                            .status(200)
                                                            .json({
                                                                success: true,
                                                                message:
                                                                    "Success!"
                                                            });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
});

module.exports = router;
