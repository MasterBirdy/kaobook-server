const jwt = require("jsonwebtoken");

module.exports = {
    authCheck: function(req, res, next) {
        console.log("the slayer");
        console.log(req.user);
        if (req.user) {
            next();
        } else {
            const authHeader = req.headers["authorization"];
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
    }
};
