let mongoose = require('mongoose');
let User = mongoose.model('User');

module.exports.generateToken = function(req, res){
        res.json(req.user.generateJwt());
};