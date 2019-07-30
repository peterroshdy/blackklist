var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var moment = require('moment');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var dashboardRouter = require('./routes/dashboard');

var app = express();

// Passport config
require('./config/passport')(passport);

// Load .env vars
require('dotenv').config();

// Connect to DB
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds151651.mlab.com:51651/blackklist`, 
{useNewUrlParser: true}, 
() => console.log("Connected!"));

// Sessions
app.use(session({
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},
  secret: 'secret-key',
  resave: true, 
  saveUninitialized: true,
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
moment().format();


// Global function to check language
checkLang = (req, res, view, data) => {
  if(req.cookies.lang == 'en'){
    res.render(`en/${view}`, data);
  }else{
    res.render(`ar/${view}`, data);
  }
}

// Passpost middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', dashboardRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error_page', {error: err.status});
});

module.exports = app;
