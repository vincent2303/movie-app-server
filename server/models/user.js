const mongoose = require("mongoose");
let crypto = require('crypto');
let jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    urlImage:{
        type: String,
        required: true
    },
    ratings:{
        type: Array,
        required: true
    },
    salt: String,
    hash: String
});

UserSchema.methods.setUser = function(name, email, password){
    this.name = name;
    this.email = email;
    this.ratings = [];
    this.urlImage = "https://sguru.org/wp-content/uploads/2017/06/cool-anonymous-profile-pictures-1699946_orig.jpg";
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
  
    return jwt.sign({
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000),
    }, process.env.token_secret);
};

const User = module.exports = mongoose.model('User', UserSchema);