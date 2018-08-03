const mongoose = require('mongoose');

const ClusterSchema = mongoose.Schema({
    recId: {
        type: Number,
        required: true
    },
    clusterNotes: {
        type: Array,
        required: true
    }
});

const Cluster = module.exports = mongoose.model('cluster', ClusterSchema);