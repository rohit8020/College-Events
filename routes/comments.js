var express = require("express");
var router = express.Router({mergeParams: true});
var Event = require("../models/event");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var { body } = require('express-validator/check');
var { validationResult } = require('express-validator/check');

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find event by id
    var id= req.params.id
    Event.findById(id, function(err, event) {
        if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        } else{
            res.render("comments/new", {event: event});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, 
                body('comment')
                .isLength({ min: 5, max: 500 })
                .withMessage("The Comment should we min of 5 letters and max 500 letters!!")
                .trim(),function(req, res){
    //lookup for event using id
    var errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect('back');
    }
    Event.findById(req.params.id, function(err, event){
        if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        } else{
            var cmnt=req.body.comment
            var currentTime=new Date
            var time=currentTime.toString()
            time=time.split(" ")
            time=time[0]+" "+time[1]+" "+time[2]+" "+time[3]+" "+time[4]
            var comment={
                text: cmnt,
                time: time
            }
            Comment.create(comment, function(err, comment){
                if(err){
                    req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
                    res.redirect("back");
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username
                    //save comment
                    try {
                        comment.save();
                        event.comments.push(comment);
                        event.save();
                    } catch (error) {
                        req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
                        res.redirect("back");
                    }
                    req.flash("success", "Comment Created Successfully!!")
                    res.redirect("/events/" + event._id);
                }
            })
        }
    })
})

//EDIT COMMENT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        } else {
            res.render("comments/edit", {event_id: req.params.id, comment: foundComment});
        }
    })
    
});

//UPDATE COMMENT
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
            var cmnt=req.body.comment
            var currentTime=new Date
            var time=currentTime.toString()
            time=time.split(" ")
            time=time[0]+" "+time[1]+" "+time[2]+" "+time[3]+" "+time[4]
            var comment={
                text: cmnt,
                time: time
            }
    Comment.findByIdAndUpdate(req.params.comment_id, comment, function(err, updatedComment){
        if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        } else {
            req.flash("success", "Comment Updated Successfully!!");
            res.redirect("/events/" + req.params.id);
        }
    });
});

//DESTROY COMMENT
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        } else {
            req.flash("success", "Comment Deleted!!");
            res.redirect("/events/" + req.params.id);
        }
    })
});



module.exports = router;