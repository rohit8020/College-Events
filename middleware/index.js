var middlewareObj = {};
var Event = require("../models/event");
var Comment = require("../models/comment");

middlewareObj.checkEventOwnership = function(req, res, next){
    if(req.isAuthenticated()){
            Event.findById(req.params.id, function(err, foundEvent){
            if(err){
                req.flash("error", "Event NOT FOUND!!")
                res.redirect("back");
            } else {
                 //does the user own the event?
                 if(foundEvent.author.id.equals(req.user._id)){
                     next();
                 } else{
                     req.flash("error", "You Don't Have That Permission")
                     res.redirect("back");
                 }
            }
        });
    } else{
        req.flash("error", "Please LogIn First!!")
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "Comment NOT FOUND!!")
                res.redirect("back");
            } else {
                 //does the user own the event?
                 if(foundComment.author.id.equals(req.user._id)){
                     next();
                 } else{
                     req.flash("error", "You Don't Have That Permission")
                     res.redirect("back");
                 }
            }
        });
    } else{
        req.flash("error", "Please LogIn First!!")
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please LogIn First!!")
    res.redirect("/login");
}

module.exports = middlewareObj;