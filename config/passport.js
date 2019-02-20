const LocalStrategy = require("passport-local").Strategy;
const bcypt = require("bcrypt");
const mongoose = require("mongoose");
require("../models/Users.js");
const User = mongoose.model("user");


module.exports = (passport) => {
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        // 登录验证
        User.findOne({
            email: email
        }).then(data => {
            if(!data) {
                return done(null, false, {message: "没有找到该用户！"});
            }
            bcypt.compare(password, data.password, (err, isPass) => {
                if(err) {console.log(err)}
                if(isPass) {
                    return done(null, data);
                }else {
                    return done(null, false, {message: "密码或账号错误！"})
                }
            })
        })
    }));
    // 序列化和反序列化，登录状态持久化
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });  
    passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}  