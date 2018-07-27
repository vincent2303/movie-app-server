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

//cregister
router.post("/register", createAccount);

//login
router.post('/login',
    passport.authenticate('local', { session: false }),
    generateToken
);

// ----------- Protected Routes with token authentification -----------
// to use this routes, user must have a valid token in header of the request

// test authentification
router.get('/testAuth', checkToken, (req, res)=>{
    res.json({msg: "reussite auth"})
})

module.exports = router;