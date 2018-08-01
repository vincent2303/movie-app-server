const mongoose = require('mongoose');

const MovieSchema = mongoose.Schema({
    recId: {
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
    },
    corr: {
        type: [{
            recId: Number,
            corrValue: Number,
            sharedUsers : Number
        }],
        required: true
    }
});

const Movie = module.exports = mongoose.model('movies', MovieSchema);