var express = require('express');
var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var moment = require('moment');
var courseRoute = express.Router();
var bodyParser = require('body-parser');

var CourseModel = require('../models/courseModel');
var UserModel = require('../models/userModel');

var urlEncodedParser = bodyParser.urlencoded({extended: false});
var sessionCourses;
moment().format('L');


courseRoute.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        CourseModel.find().sort('-courseDate').exec(function(error, courses){
            if(error) return console.error(error);
            sessionCourses = courses;
            res.render('courses/courses', {
                courses: courses,
                user: req.user
            });
    })
})

courseRoute.get('/novo',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
    res.render('courses/newCourse', {
        user: req.user
    });
})

courseRoute.post('/novo', urlEncodedParser, function(req, res){
    var keywords = req.body.keywords.split(", ");
    var course = new CourseModel({
        courseTitle: req.body.title,
        courseAuthor: req.body.author,
        courseDescription: req.body.description,
        courseCategory: req.body.category,
        courseCover: req.body.covers,
        courseKeywords: keywords,
        courseDate: req.body.date
    });
    course.save(function(error, course){
        if(error) return console.error(error);
        res.render('courses/newCourseCreated', {
            title: req.body.title,
            user: req.user
        });
    })
})

courseRoute.get('/:id', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        if(error) return console.error(error);
        res.render('courses/course', {
            courses: sessionCourses,
            course: course,
            courseDateFormated: moment(course.courseDate).format('L'),
            user: req.user
        });
    })
})

courseRoute.get('/:id/sala-de-aula/:unitId/video/:videoId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    

    CourseModel.findById(req.params.id, function(error, course){
        UserModel.findById(req.user.id, function(error, user){
            if(user.courses[0]){
                user.courses.map(function (userCourse){
                    if(userCourse.courseId == course._id){
                        userCourse.courseUnits.map(function (userCourseUnit){
                            if(userCourseUnit.unitId == req.params.unitId){
                                var founded = false;
                                userCourseUnit.videos.map(function (userVideo){
                                    if(userVideo.videoId == req.params.videoId){
                                        founded = true;
                                    }
                                })
                                if(!founded){
                                    userCourseUnit.videos.push({
                                        videoId: req.params.videoId
                                    })
                                    var subdoc = userCourseUnit.videos[0];
                                    subdoc.isNew; // true
                                    user.save(function (err){
                                        console.log(err);
                                    })
                                }
                            } else {
                                userCourse.courseUnits.push({
                                    unitId: req.params.unitId,
                                    videos: [{
                                        videoId: req.params.videoId
                                    }]
                                })
                                var subdoc = userCourse.courseUnits[0];
                                subdoc.isNew; // true
                                user.save(function (err){
                                    console.log(err);
                                })
                            }
                        })
                    } else{
                        user.courses.push({
                            courseId: course._id,
                            courseUnits: [{
                                unitId: req.params.unitId,
                                videos: [{
                                    videoId: req.params.videoId
                                }]
                            }]
                        });
                        var subdoc = user.courses[0];
                        subdoc.isNew; // true
                        user.save(function (err) {
                            console.log(err);
                        });
                    }
                })
            } else {
                user.courses.push({
                    courseId: course._id,
                    courseUnits: [{
                        unitId: req.params.unitId,
                        videos: [{
                            videoId: req.params.videoId
                        }]
                    }]
                });
                var subdoc = user.courses[0];
                subdoc.isNew; // true
                user.save(function (err) {
                    if (err) return handleError(err);
                });
            }
        })

        var unit = course.courseUnits.id(req.params.unitId);
        var video = unit.videos.id(req.params.videoId);
        if(error) return console.error(error);
        res.render('courses/classroom', {
            course: course,
            unit: unit,
            video: video,
            user: req.user
        });
    })
})

courseRoute.get('/:id/sala-de-aula/:unitId/test/:testId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        var test = unit.test.id(req.params.testId);
        if(error) return console.error(error);
        res.render('courses/classroom', {
            course: course,
            unit: unit,
            test: test,
            user: req.user
        });
    })
})


courseRoute.get('/:id/editar', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        if(error) return console.error(error);
        res.render('courses/editCourse', {
            course: course,
            user: req.user
        });
    })
})

courseRoute.get('/:id/excluir', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        if(req.user.admin){
            course.remove({ _id: req.params.id }, function (error) {
                if(error) return console.error(error);
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    })
})

// Adicionar comentário

courseRoute.post('/:id', urlEncodedParser, function(req, res){
    CourseModel.findById(req.params.id, function(error, course){
        course.courseComments.push({
            commentAuthor: req.user.name,
            commentBody: req.body.commentBody,
            commentID: req.user._id,
            commentRating: req.body.courseRating
        });
        var subdoc = course.courseComments[0];
        sessionCourses = sessionCourses;
        subdoc.isNew; // true
        course.save(function (err) {
            if (err) return handleError(err)
            res.render('courses/course', {
                courses: sessionCourses,
                course: course,
                user: req.user,
                newComment: true
            });
        });
    })
})

// Excluir comentário

courseRoute.get('/:id/excluirComentario/:commentId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        course.courseComments.pull({
            _id: req.params.commentId
        });
        course.save(function (err) {
            if(error) return console.error(error);
            res.redirect('/cursos/'+course._id);
        });
    })
})


// Criar unidade

courseRoute.post('/:id/criarUnidade', urlEncodedParser, function(req, res){
    CourseModel.findById(req.params.id, function(error, course){
        course.courseUnits.push({
            unitTitle: req.body.unitTitle
        });
        var subdoc = course.courseUnits[0];
        subdoc.isNew; // true
        course.save(function (err) {
            if (err) return handleError(err)
            res.redirect('/cursos/'+course._id);
        });
    })
})

// Excluir unidade
courseRoute.get('/:id/excluirUnidade/:unitId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        course.courseUnits.pull({
            _id: req.params.unitId
        });
        course.save(function (err) {
            if(error) return console.error(error);
            res.redirect('/cursos/'+course._id);
        });
    })
})

// Adicionar vídeo
courseRoute.get('/:id/unidade/:unitId/addVideo', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        if(error) return console.error(error);
        res.render('courses/newVideo', {
            course: course,
            user: req.user,
            unit: unit
        });
    })
})

// Adicionar vídeo enviar
courseRoute.post('/:id/unidade/:unitId/addVideo', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        course.courseUnits.id(req.params.unitId).videos.push({
            videoTitle: req.body.videoTitle,
            videoOrigin: req.body.videoOrigin,
            videoSource: req.body.videoSource
        });
        var subdoc = course.courseUnits[0];
        subdoc.isNew; // true
        course.save(function (err) {
            if (err) return handleError(err)
            res.redirect('/cursos/'+course._id);
        });
    })
})

// Adicionar arquivo
courseRoute.get('/:id/unidade/:unitId/addFile', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        if(error) return console.error(error);
        res.render('courses/newFile', {
            course: course,
            user: req.user,
            unit: unit
        });
    })
})

// Adicionar arquivo enviar
courseRoute.post('/:id/unidade/:unitId/addFile', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        course.courseUnits.id(req.params.unitId).files.push({
            fileTitle: req.body.fileTitle,
            fileOrigin: req.body.fileOrigin
        });
        var subdoc = course.courseUnits[0];
        subdoc.isNew; // true
        course.save(function (err) {
            if (err) return handleError(err)
            res.redirect('/cursos/'+course._id);
        });
    })
})

// Adicionar teste
courseRoute.get('/:id/unidade/:unitId/addTest', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        if(error) return console.error(error);
        res.render('courses/newTest', {
            course: course,
            user: req.user,
            unit: unit
        });
    })
})

// Adicionar teste enviar
courseRoute.post('/:id/unidade/:unitId/addTest', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        course.courseUnits.id(req.params.unitId).test.push({
            testTitle: req.body.testTitle
        });
        var subdoc = course.courseUnits[0];
        subdoc.isNew; // true
        course.save(function (err) {
            if (err) return handleError(err)
            res.redirect('/cursos/'+course._id+'/unidade/'+unit._id+'/editarProva/'+unit.test.pop()._id);
        });
    })
})

// Ver teste
courseRoute.get('/:id/unidade/:unitId/prova/:testId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        var test = unit.test.id(req.params.testId);
        if(error) return console.error(error);
        res.render('courses/test', {
            course: course,
            user: req.user,
            unit: unit,
            test: test
        });
    })
})


// Editar teste
courseRoute.get('/:id/unidade/:unitId/editarProva/:testId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        var test = unit.test.id(req.params.testId);
        if(error) return console.error(error);
        res.render('courses/editTest', {
            course: course,
            user: req.user,
            unit: unit,
            test: test
        });
    })
})

// Editar teste - adicionar questão
courseRoute.post('/:id/unidade/:unitId/editarProva/:testId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        var test = unit.test.id(req.params.testId)
        test.questions.push({
            questionStatement: req.body.testTitle,
            answers: [
                {
                    answerTitle: req.body.trueOption,
                    answerTrue: true
                },
                {
                    answerTitle: req.body.fakeOption1,
                    answerTrue: false
                },
                {
                    answerTitle: req.body.fakeOption1,
                    answerTrue: false
                },
                {
                    answerTitle: req.body.fakeOption1,
                    answerTrue: false
                }
            ]
        });
        var subdoc = test.questions[0];
        subdoc.isNew; // true
        course.save(function (err) {
            if (err) return handleError(err)
            res.redirect('/cursos/'+course._id+'/unidade/'+unit._id+'/editarProva/'+unit.test.pop()._id);
        });
    })
})




module.exports = courseRoute;