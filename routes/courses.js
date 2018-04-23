var express = require('express');
var multer  = require('multer');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var moment = require('moment');
var shuffle = require('shuffle-array');
var courseRoute = express.Router();

var CourseModel = require('../models/courseModel');
var UserModel = require('../models/userModel');

var urlEncodedParser = bodyParser.urlencoded({extended: false});
var sessionCourses;
moment().format('L');

var upload = multer({ dest: 'public/uploads/' });

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
        res.redirect('/cursos');
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
                var courseFounded = false;
                user.courses.map(function (userCourse){
                    if(userCourse.courseId == course._id){
                        courseFounded = true;
                        var unitFounded = false;
                        userCourse.courseUnits.map(function (userCourseUnit){
                            if(userCourseUnit.unitId == req.params.unitId){
                                unitFounded = true;
                                var videoFounded = false;
                                userCourseUnit.videos.map(function (userVideo){
                                    if(userVideo.videoId == req.params.videoId){
                                        videoFounded = true;
                                    }
                                })
                                if(!videoFounded){
                                    userCourseUnit.videos.push({
                                        videoId: req.params.videoId
                                    })
                                    var subdoc = userCourseUnit.videos[0];
                                    subdoc.isNew; // true
                                    user.save(function (err){
                                        console.log(err);
                                    })
                                }
                            }
                        })
                        if(!unitFounded){
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
                    }
                })
                if(!courseFounded){
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
        test.questions.map(question => {
            question.answers = shuffle(question.answers);
        });
        if(error) return console.error(error);
        res.render('courses/classroom', {
            course: course,
            unit: unit,
            test: test,
            user: req.user
        });
    })
})

courseRoute.post('/:id/sala-de-aula/:unitId/test/:testId', urlEncodedParser, function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        UserModel.findById(req.user.id, function(error, user){
            var unit = course.courseUnits.id(req.params.unitId);
            var test = unit.test.id(req.params.testId);
            var questionNumber = 0;
            var answerCorrect = 0;
            Object.keys(req.body).forEach(function(key) {
                test.questions[questionNumber].answers.map((answer)=>{
                    if(req.body[key] == answer._id){
                        if(answer.answerTrue){
                            answerCorrect = answerCorrect + 1;
                        }   
                    }
                })
                questionNumber = questionNumber + 1;
            });
            if(user.courses[0]){
                var courseFounded = false;
                user.courses.map(function (userCourse){
                    if(userCourse.courseId == course._id){
                        courseFounded = true;
                        var unitFounded = false;
                        userCourse.courseUnits.map(function (userCourseUnit){
                            if(userCourseUnit.unitId == req.params.unitId){
                                unitFounded = true;
                                var testFounded = false;
                                userCourseUnit.test.map(function (userTest){
                                    var currentScore;
                                    var currentMaxScore;
                                    if(userTest.testId == req.params.testId){
                                        testFounded = true;
                                        currentScore = userTest.testScore;
                                        currentMaxScore = userTest.testMaxScore;
                                        console.log(currentScore);
                                        console.log(currentMaxScore);
                                        if(currentScore > 0) {
                                            if(currentMaxScore > 0) {
                                                if(((currentMaxScore/currentScore)*100) > ((questionNumber/answerCorrect)*100)){
                                                    userCourseUnit.test.id(userTest._id).remove();
                                                    userCourseUnit.test.push({
                                                        testId: test._id,
                                                        testScore: answerCorrect,
                                                        testMaxScore: questionNumber
                                                    });
                                                    user.save(function (err){
                                                        console.log(err);
                                                    })
                                                }
                                            } else if (answerCorrect > currentScore) {
                                                userCourseUnit.test.id(userTest._id).remove();
                                                userCourseUnit.test.push({
                                                    testId: test._id,
                                                    testScore: answerCorrect,
                                                    testMaxScore: questionNumber
                                                });
                                                user.save(function (err){
                                                    console.log(err);
                                                })
                                            } else {
                                                return false;
                                            }
                                        } else if(answerCorrect > 0) {
                                            userCourseUnit.test.id(userTest._id).remove();
                                            userCourseUnit.test.push({
                                                testId: test._id,
                                                testScore: answerCorrect,
                                                testMaxScore: questionNumber
                                            });
                                            user.save(function (err){
                                                console.log(err);
                                            })
                                        } else {
                                            return false;
                                        }
                                    }
                                })
                                if(!testFounded){
                                    userCourseUnit.test.push({
                                        testId: req.params.testId,
                                        testScore: answerCorrect,
                                        testMaxScore: questionNumber
                                    })
                                    var subdoc = userCourseUnit.videos[0];
                                    subdoc.isNew; // true
                                    user.save(function (err){
                                        console.log(err);
                                    })
                                }
                            }
                        })
                        if(!unitFounded){
                            userCourse.courseUnits.push({
                                unitId: req.params.unitId,
                                test: [{
                                    testId: req.params.testId,
                                    testScore: answerCorrect,
                                    testMaxScore: questionNumber
                                }]
                            })
                            var subdoc = userCourse.courseUnits[0];
                            subdoc.isNew; // true
                            user.save(function (err){
                                console.log(err);
                            })
                        }
                    }
                })
                if(!courseFounded){
                    user.courses.push({
                        courseId: course._id,
                        courseUnits: [{
                            unitId: req.params.unitId,
                            test: [{
                                testId: req.params.testId,
                                testScore: answerCorrect,
                                testMaxScore: questionNumber
                            }]
                        }]
                    });
                    var subdoc = user.courses[0];
                    subdoc.isNew; // true
                    user.save(function (err) {
                        console.log(err);
                    });
                }
            } else {
                user.courses.push({
                    courseId: course._id,
                    courseUnits: [{
                        unitId: req.params.unitId,
                        test: [{
                            testId: req.params.testId,
                            testScore: answerCorrect,
                            testMaxScore: questionNumber
                        }]
                    }]
                });
                var subdoc = user.courses[0];
                subdoc.isNew; // true
                user.save(function (err) {
                    if (err) return handleError(err);
                });
            }
            if(error) return console.error(error);
            res.render('courses/classroom', {
                course: course,
                unit: unit,
                testDone: test,
                user: req.user,
                answerCorrect: answerCorrect
            });
        })
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


// Editar video
courseRoute.get('/:id/unidade/:unitId/editar-video/:videoId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        var video = unit.videos.id(req.params.videoId);
        if(error) return console.error(error);
        res.render('courses/editVideo', {
            course: course,
            user: req.user,
            unit: unit,
            video: video
        });
    })
})



// Editar video Enviar
courseRoute.post('/:id/unidade/:unitId/editar-video/:videoId', urlEncodedParser, function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        var video = unit.videos.id(req.params.videoId);
        video.set({
            videoTitle: req.body.videoTitle,
            videoOrigin: req.body.videoOrigin,
            videoSource: req.body.videoSource
        })
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
courseRoute.post('/:id/unidade/:unitId/addFile', upload.any(), function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        course.courseUnits.id(req.params.unitId).files.push({
            fileTitle: req.body.fileTitle,
            fileSource: req.files[0].filename
        });
        var subdoc = course.courseUnits[0];
        subdoc.isNew; // true
        course.save(function (err) {
            if (err) return handleError(err)
            res.redirect('/cursos/'+course._id);
        });
    })
})

courseRoute.get('/:id/unidade/:unitId/exluir-arquivo/:fileId', function(req,res){
    require('connect-ensure-login').ensureLoggedIn(),
    CourseModel.findById(req.params.id, function(error, course){
        var unit = course.courseUnits.id(req.params.unitId);
        var file = unit.files.id(req.params.fileId);
        if(error) return console.error(error);
        file.remove();
        course.save(function (err){
            if (err) return handleError(err)
            res.redirect('/cursos/'+course._id);
        })
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
            test: test,
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
                    answerTitle: req.body.fakeOption2,
                    answerTrue: false
                },
                {
                    answerTitle: req.body.fakeOption3,
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