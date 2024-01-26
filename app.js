require('dotenv').config();
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')

//? Routes Imported From /routes 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//? Middlewares 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(flash())

//? Express Session Setup
app.use(expressSession({
  resave:false,
  saveUninitialized: false,
  secret: 'mdmdmdmd'
}));
//? Passport Setup 
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

//? Using Routers 
app.use('/', indexRouter);
app.use('/users', usersRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server Running on Port ${port}`);
})