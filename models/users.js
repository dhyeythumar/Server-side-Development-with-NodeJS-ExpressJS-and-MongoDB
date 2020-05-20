var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }
});

// Using the passport-local-mongoose package.
User.plugin(passportLocalMongoose);

// This automatically creates the collection (table) named as "Users" if it doesn't find it.
module.exports = mongoose.model('User', User);


// :::::::::::::::::::::::::::::::: Authentication with express-session  ::::::::::::::::::::::::::::::::
// This doesn't uses the passport-local-mongoose so define the username & password field on your own.