const mongoose = require('mongoose');

const ClusterRepresentationSchema = mongoose.Schema({
    genre: {
        type: String,
        required: true
    },
    avgAllUser: {
        type: Number,
        required: true
    },
    avgCluster:{
        type: Array,
        required: true
    }
}
);

const ClusterRepresentation = module.exports = mongoose.model('cluster-representation', ClusterRepresentationSchema);
