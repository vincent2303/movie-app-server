let express = require('express');
let mongoose = require('mongoose');
let bodyparser = require('body-parser');
let cors = require('cors');
let passport = require('passport');
require('./passport-config/passport');

var app = express();
let http = require('http').Server(app);

app.use(cors());
app.use(bodyparser.json());
app.use(passport.initialize());

// env variables
var dotenv = require('dotenv');
dotenv.load();

//routes
const movieRoutes = require('./routes/movie_routes');
const userRoutes = require('./routes/user_routes');


app.use(process.env.api, movieRoutes);
app.use(process.env.api, userRoutes);

//port
const port = process.env.port;

//connexion à mongodb
mongoose.connect(process.env.url_dataBase);

mongoose.connection.on('connected', ()=>{
    console.log("connection mongodb on :", process.env.url_dataBase)
});

http.listen(port, ()=>{
    console.log('listening on port:'+ port)
});