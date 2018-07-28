let mongoose = require('mongoose');
let User = mongoose.model('User');

module.exports.createAccount = function(req, res, next){
    console.log(req.body)
    let newUser = new User();
    newUser.setUser(req.body.name, req.body.email, req.body.password);
    newUser.save((err, user)=>{
        if(err){
            res.json(err);
        }
        else{
            res.json('user added');
        }
    });
};

