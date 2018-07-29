const express = require('express');
const router = express.Router()

const Movie = require('../models/movie');

// find movies by title and filter by genre, avg and popularity
// gives the number of movies in the request (numberMovies)
// return only 20 movies from where the user asked (skipedMovies)
router.post('/movies',(req, res)=>{
    let skipedMovies = req.skipedMovies
    let movieQuery = {title: {$regex: req.body.title}, average: {$gte: req.body.minAverage}, ratingNumber: {$gte: req.body.minRating}};
    if(req.body.genreFilter != "any"){
        movieQuery.genres = req.body.genreFilter;
    }
    Movie.find(movieQuery, function(err, findedMovies){
        if(err) throw err
        else{
            console.log(movieQuery)
            console.log(findedMovies)
            res.json(findedMovies)
        }
    })
})

module.exports = router;