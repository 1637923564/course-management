module.exports = {
    guardFromAuthenticated: (req , res , next) => {
        if(req.isAuthenticated()) {
            return next();
        }else {
            req.flash("error_msg", "请先登录！");
            res.redirect("/users/login");
        }
    }
}