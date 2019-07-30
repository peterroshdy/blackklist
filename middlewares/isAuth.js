module.exports = {
    checkAuth: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash("error_msg", "من فضلك قم بتسجيل الدخول أولًا");
        res.redirect("/auth");
    }
}