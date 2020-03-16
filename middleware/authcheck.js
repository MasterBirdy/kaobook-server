const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = {
    authCheck(req, res, next) {
        if (req.user) {
            next();
        } else {
            const authHeader = req.headers["authorization"];
            console.log(req.headers);
            console.log(authHeader);
            const token = authHeader && authHeader.split(" ")[1];
            if (!token) {
                //if user is not logged in
                return res
                    .status(401)
                    .json({ success: false, message: "No token." });
            } else {
                jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                    if (err)
                        return res.status(403).json({
                            success: false,
                            message: "You are not authorized"
                        });
                    console.log("the not slayer");
                    req.user = user._doc;
                    next();
                });
            }
        }
    },
    friendCheck(req, res, next) {
        if (!(req.body.author && req.body.recipient)) {
            return res
                .status(400)
                .json({ success: false, message: "No author or recipient" });
        }
        if (req.body.author.toString() === req.body.recipient.toString()) {
            next();
        } else {
            User.findById(req.body.author)
                .populate("friends")
                .exec((err, result) => {
                    if (err)
                        return res.status(400).json({
                            success: false,
                            message: "Error",
                            error: err
                        });
                    else if (!result) {
                        return res.status(400).json({
                            success: false,
                            message: "Not found! me?"
                        });
                    } else {
                        const isFound = result.friends.some(friend => {
                            console.log("the great bird");
                            console.log(friend.friend);
                            console.log(req.body.recipient);
                            return (
                                friend.friend.toString() ===
                                    req.body.recipient.toString() &&
                                friend.status === "Friend"
                            );
                        });
                        if (isFound) {
                            next();
                        } else {
                            return res.status(403).json({
                                success: false,
                                message: "Not found on friends list!"
                            });
                        }
                    }
                });
        }
    }
};
