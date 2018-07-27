const mongoose = require('mongoose');

const MovieSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    genres: {
        type: [String],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    average: {
        type: Number,
        required: true
    },
    ratingNumber: {
        type: Number,
        required: true
    }
});

const Movie = module.exports = mongoose.model('movies', MovieSchema);