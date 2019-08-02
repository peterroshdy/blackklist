const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');


/* GET auth page. */
router.get('/auth', (req, res) => {
    checkLang(req, res, 'auth/auth');
});

/* Sign-Up */
router.post("/signup", (req, res) =>{
    const { name, email, password, password2 } = req.body
    let bad_msgs = []
    let good_msgs = []

    if(!name || !email || !password || !password2){
        bad_msgs.push({msg: "يجب عدم ترك أي حقول فارغة"});
    }

    if(name.length > 100){
        bad_msgs.push({msg: "يجب أن تكون عدد أحرف الأسم أقل من 100 حرف"});
    }

    if (password !== password2) {
        bad_msgs.push({msg:"كلمات المرور غير متطابقة"});
    }

    if (password.length < 6) {
        bad_msgs.push({msg:"يجب أن تكون كلمة المرور 6 أحرف علي الأقل"});
    }

    if(bad_msgs.length > 0){
        res.render("auth/auth", {bad_msgs, name, reg_email: email});
    }else{
        User.findOne({email: email}).then(user => {
            if(user){
                bad_msgs.push({msg: "البريد الإلكتروني موجود مسبقًا"})
                res.render("auth/auth", {bad_msgs, name, reg_email: email});
            }else{
                const nUser = new User({name, email, password});
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(nUser.password, salt, (err, hash) =>{
                        if (err) throw err;
                        nUser.password = hash;
                        nUser.save().then(user => {
                            req.flash('success_msg', "تم تسجيل الحساب بنجاح، قم بتسجيل الدخول");
                            res.redirect('/auth');
                        }).catch(err => console.log(err))
                    });
                });
            }
        });
    }
});

/* Login */
router.post('/login', 
  passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true }),
  function(req, res, next) {
    // issue a remember me cookie if the option was checked
    if (!req.body.remember_me) { return next(); }

    var token = utils.generateToken(64);
    Token.save(token, { userId: req.user.id }, function(err) {
      if (err) { return done(err); }
      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
      return next();
    });
  },
  function(req, res) {
    res.redirect('/');
  });

/* Logout */
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg",  "تم تسجيل الخروج بنجاح");
    res.redirect('/auth');
});

module.exports = router;
