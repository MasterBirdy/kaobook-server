const express = require("express");
const router = express.Router();
const m = require("../middleware/authcheck");
const User = require("../models/User");
const FriendType = require("../models/FriendType");

// see friends of your profile
router.get("/:id/", (req, res) => {
    User.findById(req.params.id)
        .populate({
            path: "friends",
            model: "FriendType",
            populate: [
                {
                    path: "friend",
                    model: "User",
                    select: ["first_name", "last_name", "profile_pic"]
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
                    friends: result.friends
                });
            }
        });
});

router.post("/:id/", m.authCheck, (req, res) => {
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
                    return res.status(400).json({
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

router.post("/:id/accept", m.authCheck, (req, res) => {
    FriendType.findById(req.params.id).exec((err, result) => {
        if (err)
            return res
                .status(400)
                .json({ success: false, message: "Error", error: err });
        else if (!result) {
            return res
                .status(400)
                .json({ success: false, message: "Not found!" });
        } else {
            if (result.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect friend status type"
                });
            }
            result.status = "Friend";
            result.save(err => {
                if (err)
                    return res.status(400).json({
                        success: false,
                        message: "Error",
                        error: err
                    });
                else {
                    User.findById(result.friend)
                        .populate("friends")
                        .exec((err, resultB) => {
                            if (err)
                                return res.status(400).json({
                                    success: false,
                                    message: "Error",
                                    error: err
                                });
                            else if (!resultB) {
                                return res.status(400).json({
                                    success: false,
                                    message: "Not found!"
                                });
                            } else {
                                const friend = resultB.friends.find(friend => {
                                    return (
                                        friend.friend.toString() ===
                                        req.body.id.toString()
                                    );
                                });
                                FriendType.findById(
                                    friend.id,
                                    (err, result) => {
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
                                            result.status = "Friend";
                                            result.save(err => {
                                                if (err)
                                                    return res
                                                        .status(400)
                                                        .json({
                                                            success: false,
                                                            message: "Error",
                                                            error: err
                                                        });
                                                else {
                                                    return res
                                                        .status(200)
                                                        .json({
                                                            success: true,
                                                            message: "Success"
                                                        });
                                                }
                                            });
                                        }
                                    }
                                );
                            }
                        });
                }
            });
        }
    });
});

router.delete("/:id/cancel", m.authCheck, (req, res) => {
    User.findById(req.body.id, (err, result) => {
        if (err)
            return res
                .status(400)
                .json({ success: false, message: "Error", error: err });
        else if (!result) {
            return res
                .status(400)
                .json({ success: false, message: "Not found! me?" });
        } else {
            result.friends = result.friends.filter(friend => {
                return friend._id.toString() !== req.params.id.toString();
            });
            result.save(err => {
                if (err)
                    return res
                        .status(400)
                        .json({ success: false, message: "Error", error: err });
                else {
                    FriendType.findById(req.params.id, (err, resultFriend) => {
                        if (err)
                            return res.status(400).json({
                                success: false,
                                message: "Error",
                                error: err
                            });
                        else if (!resultFriend) {
                            return res.status(400).json({
                                success: false,
                                message: "Not found! or me?"
                            });
                        } else {
                            User.findById(resultFriend.friend)
                                .populate("friends")
                                .exec((err, resultOtherUser) => {
                                    if (err)
                                        return res.status(400).json({
                                            success: false,
                                            message: "Error",
                                            error: err
                                        });
                                    else if (!resultOtherUser) {
                                        return res.status(400).json({
                                            success: false,
                                            message: "Not found! or even me?"
                                        });
                                    } else {
                                        const foundFriendType = resultOtherUser.friends.find(
                                            friend => {
                                                return (
                                                    friend.friend.toString() ===
                                                    req.body.id.toString()
                                                );
                                            }
                                        );
                                        if (!foundFriendType) {
                                            return res.status(400).json({
                                                success: false,
                                                message: "Not found! or me!!!"
                                            });
                                        } else {
                                            resultOtherUser.friends = resultOtherUser.friends.filter(
                                                friend => {
                                                    return (
                                                        friend.friend.toString() !==
                                                        req.body.id.toString()
                                                    );
                                                }
                                            );
                                            resultOtherUser.save(err => {
                                                if (err)
                                                    return res
                                                        .status(400)
                                                        .json({
                                                            success: false,
                                                            message: "Error",
                                                            error: err
                                                        });
                                                else {
                                                    FriendType.deleteOne(
                                                        {
                                                            _id:
                                                                foundFriendType._id
                                                        },
                                                        err => {
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
                                                                FriendType.deleteOne(
                                                                    {
                                                                        _id:
                                                                            req
                                                                                .params
                                                                                .id
                                                                    },
                                                                    err => {
                                                                        if (err)
                                                                            return res
                                                                                .status(
                                                                                    400
                                                                                )
                                                                                .json(
                                                                                    {
                                                                                        success: false,
                                                                                        message:
                                                                                            "Error",
                                                                                        error: err
                                                                                    }
                                                                                );
                                                                        else {
                                                                            return res
                                                                                .status(
                                                                                    200
                                                                                )
                                                                                .json(
                                                                                    {
                                                                                        success: true,
                                                                                        message:
                                                                                            "Success!"
                                                                                    }
                                                                                );
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        }
                                                    );
                                                }
                                            });
                                        }
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
