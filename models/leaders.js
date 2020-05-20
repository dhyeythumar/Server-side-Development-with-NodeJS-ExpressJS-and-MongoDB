const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Document Schema.
const leaderSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    abbr: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false      
    },
}, {
    timestamps: true
});

// This automatically creates the collection (table) named as "Leaders" if it doesn't find it. 
var Leaders = mongoose.model('Leader', leaderSchema);

module.exports = Leaders;