var express = require('express');
var userRoute = express.Router();
var bodyParser = require('body-parser');

var UserModel = require('../models/userModel');

var urlEncodedParser = bodyParser.urlencoded({extended: false});

userRoute.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        UserModel.find(function(error, users){
            if(error) return console.error(error);
            res.render('users/users', {users: users});
    })
})

userRoute.get('/novo',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('users/newUser');
})

userRoute.post('/novo', urlEncodedParser, function(req, res){
    UserModel.findOne({ email: req.body.email }, function(err, user) {
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
                res.render('users/newUserCreated', {name: user.name});
            })
        }
    });
    
})

userRoute.get('/:id',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req,res){
        UserModel.findById(req.params.id, function(error, user){
            if(error) return console.error(error);
            res.render('users/user', {user: user});
    })
})

module.exports = userRoute;