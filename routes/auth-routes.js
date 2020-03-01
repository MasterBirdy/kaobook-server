const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get(
    "/facebook",
    passport.authenticate("facebook", {
        scope: ["email"]
    })
);

router.get(
    "/facebook/redirect",
    passport.authenticate("facebook"),
    (req, res) => {
        console.log(req.user);
        res.redirect("/");
    }
);

module.exports = router;
