var express = require('express');
var courseRoute = express.Router();
var bodyParser = require('body-parser');

var CourseModel = require('../models/courseModel');

var urlEncodedParser = bodyParser.urlencoded({extended: false});

courseRoute.get('/', function(req, res){
    CourseModel.find(function(error, courses){
        if(error) return console.error(error);
        res.render('courses/courses', {courses: courses});
    })
})

courseRoute.get('/novo', function(req, res){
    res.render('courses/newCourse');
})

courseRoute.post('/novo', urlEncodedParser, function(req, res){
    var course = new CourseModel({
        name: req.body.name,
        author: req.body.author,
        description: req.body.description,
        category: req.body.category,
        date: req.body.date
    });
    course.save(function(error, course){
        if(error) return console.error(error);
        res.render('courses/newCourseCreated', {name: course.name});
    })
})

courseRoute.get('/:id', function(req,res){
    CourseModel.findById(req.params.id, function(error, course){
        if(error) return console.error(error);
        res.render('courses/course', {course: course});
    })
})

module.exports = courseRoute;