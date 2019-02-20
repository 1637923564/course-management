const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");
require("../models/Users.js");
const User = mongoose.model("user")

const router = express.Router();

// 注册
router.get("/register", (req, res) => {
    res.render("users/register");
});
router.post("/register", (req, res) => {
    let errors = [];
    if(req.body.password.length < 5) {
        errors.push({text: "密码不能小于四位！"});
    }
    if(req.body.password !== req.body.password2) {
        errors.push({text: "两次输入的密码不一致"});
    }
    if(errors.length !== 0) {
        res.render("users/register", {
            errors: errors,
            name: req.body.name,
            email: req.body.email
        });
    }else {
        User.findOne({
            email: req.body.email
        }).then(data => {
            if(data) {
                req.flash("error_msg", "邮箱已注册，请重新输入");
                res.redirect("/users/register");
            }else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    const createUserObj = req.body;
                    createUserObj.password = hash;
                    delete createUserObj.password2;
                    new User(createUserObj)
                        .save()
                        .then(data => {
                            req.flash("success_msg", "注册成功，请登录您的账号！");
                            res.redirect("/users/login");
                        });
                })
            }
        })
    }
});
// 登录
router.get("/login", (req, res) => {
	if(req.user) {
		req.logout();
	}
    res.render("users/login");
});
router.post("/login", (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});
// 退出登录
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "已退出登录！");
    res.redirect("/users/login");
})


module.exports = router;