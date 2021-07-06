var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var PostSchema = new Schema({
    'post_body' : String, //post content
    'post_image' : String, //post image
    'created_on' : {type: Date, default: new Date()},
    'last_updated' : {type: Date},
    'user' : { //this is the owner of the post.
       type: Schema.Types.ObjectId,
       ref: 'User'
    },
    'liked_by' : {type: [String]}, //for storing list of users that have liked a post.
    'comments' : [{ //for storing list of users that have commented.
        'sender' : {
            type: Schema.Types.ObjectId,
            ref: 'User'
         },
        'comment' : String
    }],
    'shares' : {type: Number, default: 0},
    'likes' : {type: Number, default: 0},
    'restriction_level': {type: String, default: "PUBLIC"}
});

module.exports = mongoose.model('Post', PostSchema);