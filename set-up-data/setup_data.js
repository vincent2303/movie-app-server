let dotenv = require('dotenv');
dotenv.load();

let MongoClient = require('mongodb').MongoClient;
let fs = require('fs')
let Papa = require('papaparse')

// movie: {recId, title, genres, url, average, ratingNumber, corr:[(recId, corrValue, sharedUsers)]}

let createMovieMap_Info = function(csvString, d_movie){ // with an instanciated d_movie, generate map movieId --> {title:, genres:, imageUrl}
    if(csvString){
        let movieTable = Papa.parse(csvString).data // id, title, genres, imageURL
        let movieNumber = movieTable.length - 1 // last line is empty
        for (let index = 0; index < movieNumber; index++) {
            let movieInfo = movieTable[index];
            d_movie.set(Number(movieInfo[0]), { "title":movieInfo[1], "genres":movieInfo[2].split("|"), "url":movieInfo[3] })
        }
        console.log("map movie info created")
    }
}

let createMovieMap_Average = function(csvString, d_average){ //with instanciated d_average, generate map movieId --> {average: , ratingNumber: }
    if(csvString){
        let averageTable = Papa.parse(csvString).data // movieID, average, numberRating
        let averageNumber = averageTable.length - 1
        for (let index = 0; index < averageNumber; index++) {
            movieId = Number(averageTable[index][0])
            average = Number(averageTable[index][1])
            numberRating = Number(averageTable[index][2])
            d_average.set(movieId, {average: average, numberRating: numberRating})
        }
        console.log("map movie average created")
    }
}

let createMovieMap_corr = function(csvString, d_corr){ // movieId --> [[movieId, corrValue, sharedUsers]]
    let corrTable = Papa.parse(csvString).data // 1st column id movie1, 2nd id movie2, 3rd correlation value, 4th number shared User
    let numberCorr = corrTable.length - 1
    for (let index = 0; index < numberCorr; index++) {
        let movieId1 = Number(corrTable[index][0])
        let movieId2 =  Number(corrTable[index][1])
        let corrValue =  Number(corrTable[index][2])
        let sharedUser =  Number(corrTable[index][3])
        if(!d_corr.has(movieId1)){
            d_corr.set(movieId1, [[movieId2, corrValue, sharedUser]]) 
        }
        else{
            d_corr.get(movieId1).push([movieId2, corrValue, sharedUser])
        }
        if(!d_corr.has(movieId2)){
            d_corr.set(movieId2, [[movieId1, corrValue, sharedUser]])
        }
        else{
            d_corr.get(movieId2).push([movieId1, corrValue, sharedUser])
        }
    }
    console.log("map movie correlation created")
}

let addToMongodb = function(d_movie, d_corr, d_average){
    console.log("cheking coherence average/movieInfo")
    movieIdArray = Array.from(d_movie.keys())
    if(movieIdArray.length != Array.from(d_average.keys()).length){
        console.log("ERROR : not the same movie number...")
    }
    else{
        console.log("coherence ok")
        MongoClient.connect(process.env.url_dataBase, function(err, db) {
            if (err) throw err;
            let dbo = db.db("movieData");
            movieIdArray.forEach(movieId => {
                movie = d_movie.get(movieId)
                movie.recId = movieId
                movie.average = d_average.get(movieId).average
                movie.ratingNumber = d_average.get(movieId).numberRating
                if(d_corr.has(movieId)){
                    movie.corr = d_corr.get(movieId)
                }
                else{
                    movie.corr = []
                }
                dbo.collection(process.env.movieCollectionName).insertOne(movie, function(err, res) {
                    if (err) throw err;
                    db.close();
                });
            });
        })
    }
}

console.log("starting")

// creating movieInfo map
let d_movie = new Map()
fs.readFile(process.env.movie_data_path, 'utf8', function(err, csvString){
    if(err){
        console.log(err)
    }
    else{
        createMovieMap_Info(csvString, d_movie)
        // creating movie average map
        let d_average = new Map()
        fs.readFile(process.env.average_data_path, 'utf8', function(err, csvString){
            if(err){
                console.log(err)
            }
            else{
                createMovieMap_Average(csvString, d_average)
                let d_corr = new Map()
                fs.readFile(process.env.correlation_data_path, 'utf8', function(err, csvString){
                    if(err){
                        console.log(err)
                    }
                    else{
                        createMovieMap_corr(csvString, d_corr)
                        addToMongodb(d_movie, d_corr, d_average)
                    }
                })
            }
        })
    }
})