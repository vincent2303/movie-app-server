let dotenv = require('dotenv');
dotenv.load();

let MongoClient = require('mongodb').MongoClient;
let fs = require('fs')
let Papa = require('papaparse')


console.log(process.env.movie_data_path)
fs.readFile(process.env.movie_data_path, 'utf8', function(err, csvString){
    if(err){
        console.log(err)
    }
    if(csvString){
        let movieTable = Papa.parse(csvString).data // id, title, genres, imageURL
        let d_movie = new Map() // movieID --> {title, genres, url (image url)}  (genre is array of genres)
        console.log("creating dictionnary movies")
        console.log("should be empty : ", movieTable[movieTable.length - 1])
        let movieNumber = movieTable.length - 1 // last line is empty
        for (let index = 0; index < movieNumber; index++) {
            let movieInfo = movieTable[index];
            d_movie.set(Number(movieInfo[0]), { "title":movieInfo[1], "genres":movieInfo[2].split("|"), "url":movieInfo[3] })
        }
        console.log("map created")
        console.log("number of movies :", movieNumber)
        console.log("getting average rating data")
        fs.readFile(process.env.average_data_path, 'utf8', function(err, csvString){
            if(err){
                console.log(err)
            }
            if(csvString){
                let averageTable = Papa.parse(csvString).data // movieID, average, numberRating
                console.log("should be empty : ",averageTable[averageTable.length - 1])
                let averageNumber = averageTable.length - 1
                if(averageNumber != movieNumber){
                    console.log("---- error data coherence -----")
                    console.log("not the same movie number in average and movie files...")
                    console.log("stop here")
                }
                else{
                    let coherence = true
                    console.log("adding average and number of rating")
                    for (let index = 0; index < averageNumber; index++) {
                        movieInfo = averageTable[index]
                        if(!d_movie.has(Number(movieInfo[0]))){
                            console.log("---- error data coherence -----")
                            console.log("not the same movie ID in average and movie files...")
                            console.log("movies won't be added to the database")
                            coherence = false
                        }
                        else{
                            d_movie.get(Number(movieInfo[0])).average = Number(movieInfo[1])
                            d_movie.get(Number(movieInfo[0])).ratingNumber = Number(movieInfo[2])
                        }
                    }
                    if(coherence){
                        console.log("done")
                        console.log("adding movies to the database")
                        MongoClient.connect(process.env.url_dataBase, function(err, db) {
                            if (err) throw err;
                            let dbo = db.db("movieData");
                            let movieIdArray = Array.from(d_movie.keys());
                            for (let index = 0; index < movieNumber; index++) {
                                let movie = d_movie.get(movieIdArray[index]);
                                movie.id = movieIdArray[index]
                                dbo.collection(process.env.movieCollectionName).insertOne(movie, function(err, res) {
                                  if (err) throw err;
                                  db.close();
                                });
                            }
                            console.log(movieNumber," added to the database")
                            console.log("")
                            console.log("-- END --")
                        });
                    }
                }
            }
        })
    }
})