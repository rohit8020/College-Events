var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User     = require("../models/user");
var { body } = require('express-validator/check');
var { validationResult } = require('express-validator/check');


//root route
router.get("/", function(req, res){
   res.render("events/landing"); 
});

//show register form
router.get("/register", function(req, res) {
    res.render("register");
});

//handle signup logic
router.post("/register", [
  body('username')
  .isLength({ min: 5 })
  .withMessage('Username should be of Minimum of 5 Characters!!')
  .trim(),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .custom((value) => {
      if(!value.includes("@")) {
        throw new Error('The Email Should valid!');
      }
      return true;
    })
    .normalizeEmail(),
    body('college')
    .isLength({min:3 , max:200 })
    .withMessage('The college name should be of minimum 3 and maximum of the length 200 letters!')
    .trim(),
    body('password')
    .isLength({ min: 5 })
    .isAlphanumeric()
    .withMessage('Password Should Alphanumeric and Minimum of 5 Characters!!')
    .trim()
],function(req, res) {
    var errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect('back');
    }

    var user={
      username: req.body.username,
      email: req.body.email,
      college: req.body.college
    }
    var newUser = new User(user);

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message)
            res.redirect("register");
        }else{
            passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome To College-Events " + user.username);
            res.redirect("/login");
          })(req,res,next);
        }      
    });
});

//show login form
router.get("/login", function(req, res) {
    res.render("login");
});

//handling login logic
router.post("/login", function(req, res, next){
  passport.authenticate("local", {
    successRedirect: "/events",
    failureRedirect: "/login",
    failureFlash: "Invalid username or password!!",
    successFlash: "Logged In Successfully!!"
})(req,res,next)
});

//logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("error", "Logged You Out!!");
    res.redirect("/events");
})


module.exports = router;