var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema ({
    name: String,
    email: String,
    password: String,
    admin: Boolean,
    courses: [{
        courseId: String,
        courseUnits: [{
            unitId: String,
            videos: [{
                videoId: String
            }],
            test: [{
                testId: String,
                testScore: Number
            }]
        }]
    }]
});

var UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;