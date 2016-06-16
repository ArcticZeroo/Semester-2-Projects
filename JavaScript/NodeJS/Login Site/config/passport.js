var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../app/models/user');
var enable          = require('./enable.js');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // LOCAL SIGNUP //
    passport.use('local-signup', new LocalStrategy({
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        process.nextTick(function() {
        if(enable.signup_enabled){
            // Make sure everything is entered properly.
            if(password.length > 32){
                return done(null, false, req.flash('signupMessage', 'Password is too long (max 32 characters).'));
            }
            if(password.length < 6){
                return done(null, false, req.flash('signupMessage', 'Password is too short (min 6 characters).'));
            }
            if(username.length > 16){
                return done(null, false, req.flash('signupMessage', 'Username is too long (max 16 characters).'));
            }
            if(username.length < 6){
                return done(null, false, req.flash('signupMessage', 'Username is too short (min 6 characters).'));
            }
            var password_regex = new RegExp("^[A-Za-z0-9_.!@#$%^&*+-]+$");
            if(!password_regex.test(password)){
                return done(null, false, req.flash('signupMessage', 'Invalid characters in password.'));
            }
            var username_regex = new RegExp("^[A-Za-z0-9_]+$");
            if(!username_regex.test(password)){
                return done(null, false, req.flash('signupMessage', 'Invalid characters in password.'));
            }

            User.findOne({ 'local.username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if theres already a user with that username
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {

                    // if there is no user with that username
                    // create the user
                    var newUser            = new User();

                    // set the user's local credentials
                    newUser.local.username = username;
                    newUser.local.password = newUser.generateHash(password);

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });
        }else{
            return done(null, false, req.flash('signupMessage', 'Signup is not currently enabled. Please try again later.'));
        }
        });

    }));

    // LOCAL LOGIN //
    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        process.nextTick(function() {
        if(enable.login_enabled){
            if(password.length > 32){
                return done(null, false, req.flash('loginMessage', 'Password is too long (max 32 characters).'));
            }
            if(password.length < 6){
                return done(null, false, req.flash('loginMessage', 'Password is too short (min 6 characters).'));
            }
            if(username.length > 16){
                return done(null, false, req.flash('loginMessage', 'Username is too long (max 16 characters).'));
            }
            if(username.length < 6){
                return done(null, false, req.flash('loginMessage', 'Username is too short (min 6 characters).'));
            }
            var password_regex = new RegExp("^[A-Za-z0-9_.!@#$%^&*+-]+$");
            if(!password_regex.test(password)){
                return done(null, false, req.flash('loginMessage', 'Invalid characters in password.'));
            }
            var username_regex = new RegExp("^[A-Za-z0-9_]+$");
            if(!username_regex.test(password)){
                return done(null, false, req.flash('loginMessage', 'Invalid characters in password.'));
            }

            User.findOne({ 'local.username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if there is no user, return.
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'Incorrect username or password.'));
                } 
                if(!user.validPassword(password)){
                    return done(null, false, req.flash('loginMessage', 'Incorrect username or password.'));
                }
                return done(null, user);
            });    
        }else{
            return done(null, false, req.flash('loginMessage', 'Login is not currently enabled. Please try again later.'));
        }
        });
    }));

};