const express = require('express');
const router = express.Router()

const Movie = require('../models/movie');

// find movies by title and filter by genre, avg and popularity
router.post('/movies',(req, res)=>{
    if (req.body.genreFilter == "any") {
        Movie.find({title: {$regex: req.body.title}, average: {$gte: req.body.minAverage}, ratingNumber: {$gte: req.body.minRating}}, function(err, findedMovies){
            if(err) throw err
            else{
                res.json(findedMovies)
            }
        })
    }
    else{
        Movie.find({title: {$regex: req.body.title}, genres: req.body.genreFilter, average: {$gte: req.body.minAverage}, ratingNumber: {$gte: req.body.minRating}}, function(err, findedMovies){
            if(err) throw err
            else{
                res.json(findedMovies)
            }
        })
    }
})

module.exports = router;