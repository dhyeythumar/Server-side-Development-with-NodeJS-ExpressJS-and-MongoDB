var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const mongoose = require('mongoose');
var passport = require('passport');

var authenticate = require('./authenticate');
var config = require('./config');

// ============ Connecting to the database ============
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then(db =>
    { console.log("Connected to the database") }, 
    err => { console.log(err)}
);
// ============================================
// Import router files.
var indexRouter = require('./routes/index');
var userRouter = require('./routes/userRouter');
var dishRouter = require('./routes/dishRouter');
var favoriteRouter = require('./routes/favoriteRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');

var app = express();
// Serving through secure traffic only.
app.all('*', (req, res, next) => {
    if (req.secure) {
        return next();
    }
    else {
        res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// <<< Enter point for auth with passport & auth with express-session.
app.use(passport.initialize());
// >>> Exit point.

// Routers
app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/dishes', dishRouter);
app.use('/favorites', favoriteRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload',uploadRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;


// :::::::::::::::::::::::::::::::::::::::::::::::: NOTE ::::::::::::::::::::::::::::::::::::::::::::::
// Whenever there is "next(err)" call means it directly calls to the error handler
// by skipping all the middlewares.

// And normal "next()" means to execute the next middleware in the line.
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// The Authentication settings are in app.js, authentication.js, userRouter.js & user.js files.

//:::::::::::::::::::::::::::::: Authentication with Passport & Session :::::::::::::::::::::::::::
// var session = require('express-session');
// var FileStore = require('session-file-store')(session);
// var passport = require('passport');
// var authenticate = require('./authenticate');
// 
// app.use(session({
//     name: 'session-id',
//     secret: '12345-67890-09876-54321',
//     saveUninitialized: false,
//     resave: false,
//     store: new FileStore()
// }));
// 
// app.use(passport.initialize());
// app.use(passport.session());
// 
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// 
// const auth = (req, res, next) => {
//     console.log(req.user);

//     if (!req.user) {
//         var err = new Error('You are not authenticated!');
//         err.status = 403;
//         next(err);
//     }
//     else
//         next();
// }
// app.use(auth);
// <<< check authenticate.js & userRouter.js
// >>>


// :::::::::::::::::::::::::::::::: Authentication with express-session ::::::::::::::::::::::::::::::::
// var session = require('express-session');
// var FileStore = require('session-file-store')(session);
// 
// app.use(session({
//     name: 'session-id',
//     secret: '12345-67890-09876-54321',
//     saveUninitialized: false,
//     resave: false,
//     store: new FileStore()
// }));
// 
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// 
// const auth = (req, res, next) => {
//     console.log(req.session);
//     if(!req.session.user) {
//         var err = new Error('You are not authenticated!');
//         err.status = 403;
//         return next(err);
//     }
//     else {
//         if (req.session.user === 'authenticated') {
//             next();
//         }
//         else {
//             var err = new Error('You are not authenticated!');
//             err.status = 403;
//             return next(err);
//         }
//     }
// }
// app.use(auth);
// <<< check userRouter.js [rest of the code is there]
// <<< Also check the users.js model file.



// :::::::::::::::::::::::::::::::: Basic Authentication with cookies ::::::::::::::::::::::::::::::::
// var cookieParser = require('cookie-parser');
// app.use(cookieParser('12345-67890-09876-54321'));
// 
// const auth = (req, res, next) => {
//     if (!req.signedCookies.user)
//     {
//         var authHeader = req.headers.authorization;
//         if (!authHeader) {
//             res.setHeader('WWW-Authenticate', 'Basic');
//             next(createError(401));
//             return;
//         }
//         var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//         var user = auth[0];
//         var pass = auth[1];
//         if (user == 'admin' && pass == 'password') {
//             res.cookie(name, 'test', 'user', 'admin', {signed: true, maxAge: 360000});
//             next(); // authorized
//         } else {
//             res.setHeader('WWW-Authenticate', 'Basic');      
//             next(createError(401));
//         }
//     }
//     else{
//         if (req.signedCookies.user === 'admin')
//             next();
//         else
//             next(createError(401));
//     }
// }
// app.use(auth);
// <<< In userRouter.js
// app.get('/logout', (req, res, next) =>{
//     if(res.cookie) {
//         res.clearCookie('test');
//         res.send('cookie has been cleared');
//     }
//     else {
//         var err = new Error('You are not logged in!');
//         err.status = 403;
//         next(err);
//     }
// });
// >>>