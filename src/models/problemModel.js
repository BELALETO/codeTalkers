const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Problem must have a title'],
    },
    slug: {
        type: String,
        required: [true, 'Problem must have a slug'],
    },
    description: {
        type: String,
        required: [true, 'Problem must have a description'],
    },
    tags: {
        type: [String],
        required: [true, 'Problem must have tags'],  
    },
    difficulty: {
        type: String,
        required: [true, 'Problem must have a difficulty'],
    },
    points: {
        type: Number,
        required: [true, 'Problem must have points'],
    },  
},{
    timestamps: true,
    toJSON:{
        virtuals:true,
    },
})

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
