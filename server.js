var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var users = require('./routes/users.js');
var courses = require('./routes/courses.js');
mongoose.connect('mongodb://localhost:27017/educollection');
var UserModel = require('./models/userModel');

passport.use(new Strategy(
  function(username, password, cb) {
    UserModel.findOne({ email: username }, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
  UserModel.findOne({ _id: id }, function(err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

var app = express();

app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.set('view engine', 'pug');

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    res.redirect('/cursos');
  });
  

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/perfil',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.use('/cursos', courses);

app.use('/usuarios', users);

app.listen(3000);
