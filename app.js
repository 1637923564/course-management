const express = require("express");
const exHandlebars = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

const ideasRouter = require("./routes/ideasRouter.js");
const homeRouter = require("./routes/homeRouter.js");
const userRouter = require("./routes/userRouter.js");
require("./config/passport.js")(passport);

const app = express();

// 连接数据库
mongoose.connect("mongodb://localhost/course-management-app")
        .then(() => {
            console.log("mongoose is connect...");
        })
        .catch(err => {
            console.log(err);
        });
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session())
app.use(flash());
// 配置全局变量
app.use((req , res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user;
    next();
});
// 配置模板引擎
app.engine("handlebars", exHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");


app.use("/", homeRouter);
app.use("/ideas", ideasRouter);
app.use("/users", userRouter);

app.listen(58888, ()=>console.log("http://localhost:58888"));
