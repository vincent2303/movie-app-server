const express = require('express');
const router = express.Router();
let passport = require('passport');

const User = require('../models/user');
const ClusterRepresentation = require('../models/clusterRepresentation');
const Cluster = require('../models/cluster');


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

router.get('/getClusterRepresentation',(req, res)=>{
    ClusterRepresentation.find((err, find)=>{
        console.log(find)
        res.json(find)
    })
})

router.get('/getClusterData', checkToken, (req, res)=>{
    User.findOne({_id: req.user._id},{_id: 0, ratings: 1}, (err, ratings)=>{
        RatedMovies = [] // movies rated from the user
        ratings.ratings.forEach(rating => {
            RatedMovies.push(rating[0])
        });
        let clusterTable = []
        // ************* Je comprend pas pourquoi la condition {recId: 31} par exmple ne fonctionne pas...
        // fait betement...
        Cluster.find({}, {clusterNotes: 1, recId:1, _id:0}, (err, clusterRow)=>{
            clusterRow.forEach(row=>{
                if (RatedMovies.includes(row.recId)) {
                    clusterTable.push(row)
                }
            })
            res.json(clusterTable)
        })
    })
})

module.exports = router;