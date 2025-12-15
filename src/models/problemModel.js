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
    constraints: {
        timeLimit: {
            type: Number,
            default: 1000, // milliseconds
        },
        memoryLimit: {
            type: Number,
            default: 256, // megabytes
        },
    },
    starterCode: [
        {
            language: {
                type: String,
                required: true,
            },
            code: {
                type: String,
                required: true,
            },
        },
    ],
    examples: [
        {
            input: String,
            output: String,
            explanation: String,
        },
    ],
},{
    timestamps: true,
    toJSON:{
        virtuals:true,
    },
    toObject: {
        virtuals: true
    }
})

// Virtual populate for test cases
problemSchema.virtual('testCases', {
    ref: 'TestCase',
    foreignField: 'problem',
    localField: '_id'
});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
