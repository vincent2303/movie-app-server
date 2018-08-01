const express = require('express');
const router = express.Router();
let passport = require('passport');

const User = require('../models/user');

//controllers
let createAccount = require('../controllers/register').createAccount;
let generateToken = require('../controllers/generateToken').generateToken;
let checkToken = require('../controllers/checkToken').checkToken;

// ------- test ---------

router.get("/user", (req, res)=>{
    User.find(function(err, user){
        if(err){
            res.json(err)
        }
        else{
            res.json(user)
        }
    })
});

// ----------- register and login -----------

//register
router.post("/register", createAccount);

//login
router.post('/getUserWithPassword',
    passport.authenticate('local', { session: false }),
    generateToken,
    (req, res)=>{
        res.json({user: req.user, token: req.token})
    }
);
// autoLogin
router.get('/getUserByToken',
    checkToken,
    (req, res, next)=>{
        User.findOne({email: req.user.email}, (err, user)=>{
            res.json(user)
        })
    }
);

// ----------- Protected Routes with token authentification -----------
// to use this routes, user must have a valid token in header of the request

// test authentification
router.get('/testAuth', checkToken, (req, res)=>{
    res.json({msg: "reussite auth"})
})

router.put("/userUpdate", checkToken ,(req, res, next) =>{
    User.findByIdAndUpdate(req.user._id, {$set: req.body}, function (err, result){
        User.findOne({_id: req.user._id}, (err, user)=>{
            user.salt = undefined
            user.hash = undefined
            res.json(user)
        })
    })
});

module.exports = router;