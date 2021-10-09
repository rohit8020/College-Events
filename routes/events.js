var express = require("express");
var router = express.Router();
var Event = require("../models/event");
var middleware = require("../middleware");
var fileHelper = require("../file");
var { body } = require('express-validator/check');
var { validationResult } = require('express-validator/check');
   

//INDEX -show all events
router.get("/", function(req, res){
    //get all events from database
    Event.find({}, function(err, allevents){
        if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        } else {
            res.render("events/index", {events: allevents});
        }
    })
});

//CREATE - add new event to DB
router.post("/",middleware.isLoggedIn, [
    body('title')
      .isString()
      .isLength({ min: 10 })
      .withMessage("The title should be of minimum 10 letters!!")
      .trim(),
    body('videoLink')
    .custom((value) => {
        if (!(value.startsWith("https://www.youtube.com/embed/"))) {
        throw new Error('Embed the video Link from the youtube, in the videoLink input!');
        }
        return true;
    })
    .trim(),
    body('college')
        .isLength({min: 3, max: 200})
        .withMessage("The College Name should be min of the length 3 and max of the length 200 letters"),
    body('contactEmail')
    .custom((value) => {
        if (!(value.includes("@"))) {
        throw new Error('The input email is not an email!');
        }
        return true;
    })
    .normalizeEmail()
    .trim(),
    body('contactNumber')
    .isNumeric()
    .isLength("10")
    .withMessage("The Mobile Number Should be Indian and of the 10 digit!")
    .trim(),
    body('websiteLink')
    .custom((value) => {
        if (!(value.startsWith("https://")||value.startsWith("http://"))) {
        throw new Error('The entered website link is not the link!');
        }
        return true;
    })
    .trim(),
    body('description')
      .isLength({ min: 10, max: 200000 })
      .withMessage("The Description should we min of 100 letters and max 200000 letters!!")
      .trim()
  ], function(req, res){
   //get data from form and add to events array
   var title = req.body.title;
   var websiteLink=req.body.websiteLink
   var contactNumber=req.body.contactNumber
   var contactEmail=req.body.contactEmail
   var college=req.body.college
   var image = req.file;
   var description = req.body.description;
   var videoLink=req.body.videoLink;
   if(!image){
        req.flash("error", "The file is not of jpg/jpeg/png Type");
        return res.redirect("back");
   }
   if(image.size>800000){
    req.flash("error", "Image Size is greater then 100kb!");
    return res.redirect("back");
   }

   var errors = validationResult(req);

   if (!errors.isEmpty()) {
      console.log(errors.array());
      fileHelper.deleteFile(image.path);
      req.flash("error", errors.array()[0].msg);
      return res.redirect('events/new');
   }

   var img = image.path;

   var author = {
       id: req.user._id,
       username: req.user.username
   }
   var currentTime=new Date
   var time=currentTime.toString()
            time=time.split(" ")
            time=time[0]+" "+time[1]+" "+time[2]+" "+time[3]+" "+time[4]
   var newEvent = {
        title: title, 
        image: img,
        videoLink: videoLink,
        college: college,
        websiteLink: websiteLink,
        contactEmail: contactEmail,
        contactNumber: contactNumber,
        description: description, 
        author: author, 
        videoLink: videoLink,
        time: time
    };

   //create a new event and save to database
   Event.create(newEvent, function(err){
       if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
       }else{
           //redirect back to events page
           req.flash("success", "event Created Successfully!!")
           res.redirect("/events");
       }
   });
});

//NEW -show form to create new event
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("events/new"); 
});

//SHOW --DETAIL BY ID 
router.get("/:id", function(req, res){
     //find the event with provided id
     Event.findById(req.params.id).populate("comments").exec(function(err, foundEvent){
         if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
         } else{
             //render the show template with that event
             res.render("events/show", {event: foundEvent});
         }
     });
});

//EDIT event ROUTE
router.get("/:id/edit", middleware.checkEventOwnership, function(req, res) {
            Event.findById(req.params.id, function(err, foundEvent){
            if(err){
                req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
                res.redirect("back");
            } else{    
            res.render("events/edit", {event: foundEvent});
            }
        });
});

//UPDATE event ROUTE
router.put("/:id", middleware.checkEventOwnership, [
    body('title')
      .isString()
      .isLength({ min: 10 })
      .withMessage("The title should be of minimum 10 letters!!")
      .trim(),
    body('videoLink')
    .custom((value) => {
        if (!(value.startsWith("https://www.youtube.com/embed/"))) {
        throw new Error('Embed the video Link from the youtube, in the videoLink input!');
        }
        return true;
    })
    .trim(),
    body('college')
        .isLength({min: 3, max: 200})
        .withMessage("The College Name should be min of the length 3 and max of the length 200 letters"),
    body('contactEmail')
    .custom((value) => {
        if (!(value.includes("@"))) {
        throw new Error('The input email is not an email!');
        }
        return true;
    })
    .normalizeEmail()
    .trim(),
    body('contactNumber')
    .isNumeric()
    .isLength("10")
    .withMessage("The Mobile Number Should be Indian and of the 10 digit!")
    .trim(),
    body('websiteLink')
    .custom((value) => {
        if (!(value.startsWith("https://")||value.startsWith("http://"))) {
        throw new Error('The entered website link is not the link!');
        }
        return true;
    })
    .trim(),
    body('description')
      .isLength({ min: 10, max: 200000 })
      .withMessage("The Description should we min of 100 letters and max 200000 letters!!")
      .trim()
  ],function(req, res){

    var errors = validationResult(req);

    if (!errors.isEmpty()) {
        if(req.file){
            fileHelper.deleteFile(req.file.path);
        }
        req.flash("error", errors.array()[0].msg);
        return res.redirect('back');
    }
    //find and update the correct event
    var image = req.file;

    if(!image){
        req.flash("error", "The file is not of jpg/jpeg/png Type");
        return res.redirect("back");
    }
    if(image.size>800000){
    req.flash("error", "Image Size is greater then 100kb!");
    return res.redirect("back");
    }

    Event.findById(req.params.id, function(err, event){
        if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        } else{
            var currentTime=new Date
            var time=currentTime.toString()
            time=time.split(" ")
            time=time[0]+" "+time[1]+" "+time[2]+" "+time[3]+" "+time[4]
            event.time=time
            event.college=req.body.college
            event.websiteLink=req.body.websiteLink
            event.contactEmail=req.body.contactEmail
            event.contactNumber=req.body.contactNumber
            event.title=req.body.title;
            event.videoLink=req.body.videoLink;
            event.description=req.body.description;
            if(image){
                fileHelper.deleteFile(event.image);
                event.image=image.path;
            }
            return event.save().then(() => {
                req.flash("success", "event Updated Successfully!!")
                res.redirect("/events/" + req.params.id);
            });
            
        }
    });
});

//DESTROY event ROUTE 
router.delete("/:id", middleware.checkEventOwnership, function(req, res){
    Event.findById(req.params.id, function(err, event){
        if(err)
        {
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        }else{
            fileHelper.deleteFile(event.image);
        }
    })
    Event.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Sorry For Inconvenience, Some Server Problem!!")
            res.redirect("back");
        } else {
            req.flash("success", "Event Deleted Successfully!!")
            res.redirect("/events");
        }
    })
})

module.exports = router;