const isLoggedIn = function (req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash('success', '🗝️ Oops! you must be signed in ');
        return res.redirect('/user/login');
    }
    next();
};
module.exports=isLoggedIn