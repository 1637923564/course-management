安装passport和passport-local模块
```shell
$ npm i passport passport-local
```
在app.js中，使用express-session中间件后，再使用passport.initialize()中间件和passport.session()中间件
```
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());// 使得基于express的应用程序可以使用passport
app.use(passport.session());// 使得应用程序可以持久登录会话
```
指定"local"对请求进行身份验证(在post请求中)
```shell
passport.authenticate('local', { 
    successRedirect: '/ideas', // 成功后跳转
    failureRedirect: '/users/login', // 失败后跳转
    failureFlash: true // 与connect-flash 配合
})(req, res, next)
```
创建一个新的配置文件夹config，在其根目录中新建passport.js，并导出一个回调函数
```shell
const LocalStrategy = require("passport-local").Strategy
module.exports = (passport) => {
    passport.use(new LocalStrategy({usernameFile: "username"}, (username,password, done) => {
        // 该回调函数的参数就是发送请求时传来的数据:
        // username:用户名
        // password: 密码
        // done(null, false, {message: "错误信息"}) || done(null, data);
    }
}
```
序列化与反序列化，使passport持久化，在passport.js中要导出的回调函数末尾添加
```shell
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
```
在app.js中引入passport.js文件并传入参数passport(require("passport"))