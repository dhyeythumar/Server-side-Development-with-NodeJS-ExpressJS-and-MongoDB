var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config.js');
var Users = require('./models/users');

passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);

    Users.findOne({_id: jwt_payload._id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        else if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    });
}));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    }
    else {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    } 
}

// Only for login through facebook id.
exports.facebookPassport = passport.use(new FacebookTokenStrategy(
    {   clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    },
    (accessToken, refreshToken, profile, done) => {
        Users.findOne({facebookId: profile.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else {
                user = new Users({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err)
                        return done(err, false);
                    else
                        return done(null, user);
                });
            }
        });
    }
));

// To work with JWT first signup and then login.
// After login copy the token returned in the json response and set the request-headers as :-
// Key: Authorization & Value: bearer <token-value>

// Now to work with facebook-token system first get the access token from facebook 
// and then query "/facebook/token" route to obtain JWT token by usig this access token as follows:--
// Use in request-headers:
// Key: Authorization & Value: Bearer <facebook-access-token-value> || 
// Key: access_token & Value: <facebook-access-token-value> ||
// Use in URL as:
// .../facebook/token?access_token=<facebook-access-token-value>

//:::::::::::::::::::::::::::::::::::: Note OAuth ::::::::::::::::::::::::::::::::::::
// To work with OAuth you first have to get your client ID and secret by registering to OAuth providers such as facebook developer version.

//:::::::::::::::::::::::::::::::::::: Authentication with Passport ::::::::::::::::::::::::::::::::::::
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var User = require('./models/users');
// 
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
