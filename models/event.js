var mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
    title: String,
    image: String,
    videoLink: String,
    college: String,
    contactNumber: String,
    contactEmail: String,
    websiteLink: String,
    description: String,
    time: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
        
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
        
        ]
});

module.exports = mongoose.model("event", eventSchema);