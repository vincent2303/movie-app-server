const express = require('express');
const router = express.Router();
let passport = require('passport');

const User = require('../models/user');
const ClusterRepresentation = require('../models/clusterRepresentation');
const Cluster = require('../models/cluster');
const Movie = require('../models/movie');


//controllers
let createAccount = require('../controllers/register').createAccount;
let generateToken = require('../controllers/generateToken').generateToken;
let checkToken = require('../controllers/checkToken').checkToken;

// function random index
let randomIndex = function(arrayLength) {
    return Math.floor(Math.random() * (0 - arrayLength) ) + arrayLength;
}

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

router.get('/getCorrelationRecommendation', checkToken, (req, res)=>{ // return a maximum of 5 random with two conditions : movies the user liked (note>=3.5) and each movie must have at least one correlated movie
    User.findOne({_id: req.user._id},{_id: 0, ratings: 1},(err, ratings)=>{
        let ratedMovies = ratings.ratings
        let movieLiked = [] // Array of recId movie the user liked
        ratedMovies.forEach(rating => {
            if(rating[1]>=3.5){
                movieLiked.push(rating[0])
            }
        });
        let selectedMovies = []
        Movie.find({recId: {$in: movieLiked}}, (err, movies)=>{
            while(movies.length>0 && selectedMovies.length<5){
                let index = randomIndex(movies.length)
                if(movies[index].corr.length>0){
                    selectedMovies.push(movies[index])
                }
                movies.splice(index, 1)
            }
            res.json(selectedMovies)
        })
    })
})

router.post('/getClusterRecommendation', (req, res)=>{ // return array of 8 recId
    let recommendation = []
    Cluster.find((err, movies)=>{
        while(recommendation.length<8 && movies.length>0){
            let index = randomIndex(movies.length)
            let movie = movies[index]
            if(movie.clusterNotes[req.body.clusterNumber]>=3.5) {
                recommendation.push(movie.recId)
            }
            movies.splice(index, 1)
        }
        res.json(recommendation)
    })
})

router.get('/getIdentity/:_id', (req, res)=>{
    let _id = req.params._id.substr(1)
    console.log(_id)
    User.findOne({_id: _id}, (err, user)=>{
        console.log("reponse")
        res.json({urlImage: user.urlImage, name: user.name, _id: user.id})
    })
})

module.exports = router;