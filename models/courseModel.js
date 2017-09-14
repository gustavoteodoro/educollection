var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema ({
    courseTitle: String,
    courseAuthor: String,
    courseDescription: String,
    courseCategory: String,
    courseCover: String,
    courseKeywords: [],
    courseUnits: [{
        unitTitle: String,
        videos: [{
            videoTitle: String,
            videoOrigin: String,
            videoSource: String
        }],
        files: [{
            fileTitle: String,
            fileSource: String
        }],
        test: [{
            testTitle: String,
            questions: [{
                questionStatement: String,
                answers: [{
                    answerTitle: String,
                    answerTrue: Boolean
                }]
            }]
        }]
    }],
    courseDate: {type: Date, default: Date.now},
    courseComments: [{
        commentAuthor: String,
        commentID: String,
        commentRating: Number,
        commentBody: String
    }]
});

var CourseModel = mongoose.model('Course', courseSchema);

module.exports = CourseModel;