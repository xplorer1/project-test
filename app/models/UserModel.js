let mongoose = require('mongoose');
let Schema   = mongoose.Schema;
let bcrypt = require('bcrypt');
var saltRounds = 10;

let UserSchema = new Schema({
    'email' : {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: function(v) {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: '{VALUE} is not a valid email!'
        }
    },
    'password' : {type: String},
    'created_on' : { type: Date, default: new Date() },
    'verified': { type: Boolean, default: false },
    'verified_on': { type: Date, default: new Date() },
    'verification_code': { type: String },
	'password_reset_token' : {type: String},
    'password_reset_token_expires': {type: Date},
});

// hash the password before the user is saved
UserSchema.pre('save', function (next) {
    var user = this;

    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(saltRounds, function(err, salt) {
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        // change the password to the hashed version
	        user.password = hash;
	        next();
	    });
	});
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function (password) {
	var user = this;
	
	bcrypt.compare((user.password, password), function(err, result) {
		if(err) return err.message;
		
    	return result
	});
};

module.exports = mongoose.model('User', UserSchema);