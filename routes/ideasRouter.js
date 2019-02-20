const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const guard = require("../helpers/guard.js");
require("../models/Ideas.js");
const Ideas = mongoose.model("ideas");

// 加载数据
router.get("/", guard.guardFromAuthenticated, (req, res) => {
    Ideas.find({user: req.user.email})
         .then(data => {
            res.render("ideas/ideas", {
                ideas: data
            });
         });
});
// 实现添加数据
router.get("/add", guard.guardFromAuthenticated, (req, res) => {
    res.render("ideas/add");
});
router.post("/add", (req, res) => {
    function toAdd() {
        let newUser = req.body;
        newUser.user = req.user.email;
        new Ideas(newUser)
            .save()
            .then(data => {
                req.flash("success_msg", "数据添加成功！");
                res.redirect("/ideas");
            });
    }
    _hint(toAdd, req, res);
});
// 实现删除数据
router.post("/:id", guard.guardFromAuthenticated, (req, res) => {
    Ideas.remove({
        _id: req.params.id
    })
    .then(() => {
        req.flash("success_msg", "数据删除成功！");
        res.redirect("/ideas");
    });
});
// 实现编辑
router.get("/edit/:id", guard.guardFromAuthenticated, (req, res) => {
    Ideas.findOne({
        _id: req.params.id,
    })
    .then(data => {
        if(data.user != req.user.email) {
            req.flash("error_msg", "非法操作~~~!");
            res.redirect("/ideas");
        }else if(data) {
            res.render("ideas/edit", {
                idea: data
            });
        }
    })
});
router.post("/edit/:id", (req, res) => {
    _hint(toEdit, req, res);
    function toEdit() {
        Ideas.findOne({
            _id: req.params.id
        })
        .then(data => {
            data.title = req.body.title;
            data.details = req.body.details;
            data.save()
                .then(data => {
                    req.flash("success_msg", "数据编辑成功！");
                    res.redirect("/ideas");
                });
        })
    }
})

// 课程添加与编辑的报错信息
function _hint(tar, req, res) {
    let errors = [];
    if(!req.body.title) {
        errors.push({text: "请填写课程标题"});
    }
    if(!req.body.details) {
        errors.push({text: "请输入课程详情"});
    }
    if(errors.length !== 0) {
        res.render("ideas/add", {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }else {
        tar();
    }
}

module.exports = router;