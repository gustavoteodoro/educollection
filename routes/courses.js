var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var courseRoute = express.Router();
var bodyParser = require('body-parser');

var CourseModel = require('../models/courseModel');

var urlEncodedParser = bodyParser.urlencoded({extended: false});

courseRoute.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        CourseModel.find(function(error, courses){
            if(error) return console.error(error);
            res.render('courses/courses', {courses: courses, user: req.user});
    })
})

courseRoute.get('/novo',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
    res.render('courses/newCourse');
})

courseRoute.post('/novo', urlEncodedParser, function(req, res){
    var course = new CourseModel({
        courseTitle: req.body.title,
        courseAuthor: req.body.author,
        courseDescription: req.body.description,
        courseCategory: req.body.category,
        courseDate: req.body.date
    });
    course.save(function(error, course){
        if(error) return console.error(error);
        res.render('courses/newCourseCreated', {title: course.title});
    })
})

courseRoute.get('/:id', function(req,res){
    CourseModel.findById(req.params.id, function(error, course){
        if(error) return console.error(error);
        res.render('courses/course', {course: course, user: req.user});
    })
})

courseRoute.post('/:id', urlEncodedParser, function(req, res){
    CourseModel.findById(req.params.id, function(error, course){
        course.courseComments.push({ commentAuthor: req.user.name, commentBody: req.body.commentBody });
        var subdoc = course.courseComments[0];
        console.log(subdoc); // { _id: '501d86090d371bab2c0341c5', name: 'Liesl' }
        console.log(course);
        subdoc.isNew; // true
        course.save(function (err) {
            if (err) return handleError(err)
            res.render('courses/course', {course: course, user: req.user, newComment: true});
        });
    })
})

module.exports = courseRoute;