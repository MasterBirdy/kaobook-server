module.exports = {
    authCheck: function(req, res, next) {
        if (!req.user) {
            //if user is not logged in
            return res
                .status(403)
                .json({ success: false, message: "You are not authorized" });
        } else {
            //if logged in
            next();
        }
    }
};
