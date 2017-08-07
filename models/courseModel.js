var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema ({
    name: String,
    author: String,
    description: String,
    category: String,
    date: {type: Date, default: Date.now},
    comments: [{ body: String, date: Date }],
    votes: Number
});

var CourseModel = mongoose.model('Course', courseSchema);

module.exports = CourseModel;