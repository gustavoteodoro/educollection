var express = require('express');
var userRoute = express.Router();
var bodyParser = require('body-parser');

var UserModel = require('../models/userModel');
var CourseModel = require('../models/courseModel');

var urlEncodedParser = bodyParser.urlencoded({extended: false});

userRoute.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        UserModel.find(function(error, users){
            if(error) return console.error(error);
            res.render('users/users', {
                users: users,
                user: req.user
            });
    })
})

userRoute.get('/:id/excluir', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    UserModel.findById(req.params.id, function(error, user){
        if(req.user.admin){
            user.remove({ _id: req.params.id }, function (error) {
                if(error) return console.error(error);
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    })
})

userRoute.get('/novo',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('users/newUser', {
            user: req.user
        });
})

userRoute.post('/novo', urlEncodedParser, function(req, res){
    require('connect-ensure-login').ensureLoggedIn(),
    UserModel.findOne({ email: req.body.email }, function(err, user) {
        if(req.user.admin){
            if(user){
                res.render('users/userExist', {email: req.body.email});
            }else {
                var user = new UserModel({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    admin: (req.body.admin=='on')
                });
                user.save(function(error, user){
                    if(error) return console.error(error);
                    res.redirect('/usuarios');
                })
            }
        } else {
            res.redirect('/');
        }
    });
    
})

userRoute.get('/:id',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req,res){
        UserModel.findById(req.params.id, function(error, user){
            CourseModel.find(function(error, courses){
                if(error) return console.error(error);
                res.render('users/user', {
                    user: user,
                    courses: courses
                });
        })
    })
})

userRoute.get('/:id/certificado/:courseId',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req,res){
        UserModel.findById(req.params.id, function(error, user){
            CourseModel.findById(req.params.courseId, function(error, course){
                if(error) return console.error(error);
                res.render('users/certificate', {
                    user: user,
                    course: course
                });
            })
        })
    }
)




module.exports = userRoute;
