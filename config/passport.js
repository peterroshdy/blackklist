const LocalStrategy = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Load user model
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(new LocalStrategy(
        {usernameField: 'email'},
        (email, password, done) => {
            //Match user email
            User.findOne({email: email}).then(user => {
                if(!user){
                    return done(null, false, {message: "There is no account linked to this email address"});
                }

                //Match user password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) throw err;
                    if(isMatch){
                        return done(null, user);
                    }else{
                        return done(null, false, {message: "Wrong password!"});
                    }
                })
            }).catch(err => console.log(err));
    }));

    passport.use(new RememberMeStrategy(
        (token, done) => {
            Token.consume(token, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
            return done(null, user);
        });
    },
    (user, done) => {
        var token = utils.generateToken(64);
        Token.save(token, { userId: user.id }, function(err) {
            if (err) { return done(err); }
            return done(null, token);
        });
    }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });

    

}
