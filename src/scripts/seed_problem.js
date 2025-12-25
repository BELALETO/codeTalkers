const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('../models/problemModel');
const TestCase = require('../models/testCaseModel');
const { connectDB } = require('../config/database');

dotenv.config();

const seed = async () => {
    try {
        await connectDB();

        // Check if problem exists
        let problem = await Problem.findOne({ title: 'Hello World' });
        if (problem) {
            console.log('Problem "Hello World" already exists.');
        } else {
            problem = await Problem.create({
                title: 'Hello World',
                description: 'Write a program that prints "Hello" to stdout.',
                tags: ['basics'],
                difficulty: 'Easy',
                points: 10,
                constraints: {
                    timeLimit: 1000,
                    memoryLimit: 256
                },
                starterCode: [
                    { language: 'cpp', code: '#include <iostream>\nint main() {\n    // your code here\n    return 0;\n}' },
                    { language: 'python', code: 'print("Hello")' }
                ],
                examples: []
            });
            console.log('Created "Hello World" problem.');
        }

        // Create or update test case
        await TestCase.findOneAndUpdate(
            { problem: problem._id },
            {
                problem: problem._id,
                input: ' ',
                expectedOutput: 'Hello',
                isPublic: true,
                order: 1
            },
            { upsert: true, new: true }
        );
        console.log('Upserted test case.');

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
