let mongoose = require('mongoose');
let User = mongoose.model('User');

module.exports.generateToken = function(req, res, next){
        req.token = req.user.generateJwt()
        next()
};