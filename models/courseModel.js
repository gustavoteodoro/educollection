var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema ({
    courseTitle: String,
    courseAuthor: String,
    courseDescription: String,
    courseCategory: String,
    courseUnits: [{
        unitTitle: String,
        videos: [{
            videoTitle: String,
            videoOrigin: String,
            videoCode: String,
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
        commentBody: String,
        commentDate: {type: Date, default: Date.now}
    }],
    courseRating: [{
        ratingValue: Number,
        ratingAuthor: String
    }]
});

var CourseModel = mongoose.model('Course', courseSchema);

module.exports = CourseModel;