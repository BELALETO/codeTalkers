const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('../models/problemModel');
const TestCase = require('../models/testCaseModel');
const { connectDB, disconnectDB } = require('../config/database');

dotenv.config();

const testCasesData = [
    // Sum of Two Numbers
    {
        problemTitle: 'Sum of Two Numbers',
        input: '2 3',
        expectedOutput: '5',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Sum of Two Numbers',
        input: '-10 20',
        expectedOutput: '10',
        isPublic: false,
        order: 2
    },

    // Difference of Two Numbers
    {
        problemTitle: 'Difference of Two Numbers',
        input: '5 3',
        expectedOutput: '2',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Difference of Two Numbers',
        input: '3 5',
        expectedOutput: '-2',
        isPublic: false,
        order: 2
    },

    // Product of Two Numbers
    {
        problemTitle: 'Product of Two Numbers',
        input: '4 6',
        expectedOutput: '24',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Product of Two Numbers',
        input: '100000 100000',
        expectedOutput: '10000000000',
        isPublic: false,
        order: 2
    },

    // Check Even or Odd
    {
        problemTitle: 'Check Even or Odd',
        input: '7',
        expectedOutput: 'ODD',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Check Even or Odd',
        input: '10',
        expectedOutput: 'EVEN',
        isPublic: false,
        order: 2
    },

    // Maximum of Two Numbers
    {
        problemTitle: 'Maximum of Two Numbers',
        input: '3 9',
        expectedOutput: '9',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Maximum of Two Numbers',
        input: '-5 -2',
        expectedOutput: '-2',
        isPublic: false,
        order: 2
    },

    // Sum of Array
    {
        problemTitle: 'Sum of Array',
        input: '5\n1 2 3 4 5',
        expectedOutput: '15',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Sum of Array',
        input: '3\n-1 -2 -3',
        expectedOutput: '-6',
        isPublic: false,
        order: 2
    },

    // Maximum Element in Array
    {
        problemTitle: 'Maximum Element in Array',
        input: '4\n1 9 3 7',
        expectedOutput: '9',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Maximum Element in Array',
        input: '5\n-10 -20 -3 -40 -5',
        expectedOutput: '-3',
        isPublic: false,
        order: 2
    },

    // Reverse a String
    {
        problemTitle: 'Reverse a String',
        input: 'hello',
        expectedOutput: 'olleh',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Reverse a String',
        input: 'abcd',
        expectedOutput: 'dcba',
        isPublic: false,
        order: 2
    },

    // Palindrome String
    {
        problemTitle: 'Palindrome String',
        input: 'level',
        expectedOutput: 'YES',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Palindrome String',
        input: 'hello',
        expectedOutput: 'NO',
        isPublic: false,
        order: 2
    },

    // Count Digits
    {
        problemTitle: 'Count Digits',
        input: '12345',
        expectedOutput: '5',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Count Digits',
        input: '0',
        expectedOutput: '1',
        isPublic: false,
        order: 2
    },

    // Factorial
    {
        problemTitle: 'Factorial',
        input: '5',
        expectedOutput: '120',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Factorial',
        input: '0',
        expectedOutput: '1',
        isPublic: false,
        order: 2
    },

    // Fibonacci Number
    {
        problemTitle: 'Fibonacci Number',
        input: '7',
        expectedOutput: '13',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Fibonacci Number',
        input: '1',
        expectedOutput: '1',
        isPublic: false,
        order: 2
    },

    // Check Power of Two
    {
        problemTitle: 'Check Power of Two',
        input: '8',
        expectedOutput: 'YES',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Check Power of Two',
        input: '10',
        expectedOutput: 'NO',
        isPublic: false,
        order: 2
    },

    // GCD of Two Numbers
    {
        problemTitle: 'GCD of Two Numbers',
        input: '24 36',
        expectedOutput: '12',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'GCD of Two Numbers',
        input: '7 13',
        expectedOutput: '1',
        isPublic: false,
        order: 2
    },

    // LCM of Two Numbers
    {
        problemTitle: 'LCM of Two Numbers',
        input: '4 6',
        expectedOutput: '12',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'LCM of Two Numbers',
        input: '5 7',
        expectedOutput: '35',
        isPublic: false,
        order: 2
    },

    // Linear Search
    {
        problemTitle: 'Linear Search',
        input: '5\n1 2 3 4 5\n3',
        expectedOutput: '2',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Linear Search',
        input: '4\n10 20 30 40\n25',
        expectedOutput: '-1',
        isPublic: false,
        order: 2
    },

    // Binary Search
    {
        problemTitle: 'Binary Search',
        input: '5\n1 2 3 4 5\n4',
        expectedOutput: '3',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Binary Search',
        input: '5\n1 2 3 4 5\n6',
        expectedOutput: '-1',
        isPublic: false,
        order: 2
    },

    // Count Vowels
    {
        problemTitle: 'Count Vowels',
        input: 'hello',
        expectedOutput: '2',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Count Vowels',
        input: 'bcdfg',
        expectedOutput: '0',
        isPublic: false,
        order: 2
    },

    // Valid Parentheses
    {
        problemTitle: 'Valid Parentheses',
        input: '()[]{}',
        expectedOutput: 'YES',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Valid Parentheses',
        input: '(]',
        expectedOutput: 'NO',
        isPublic: false,
        order: 2
    },

    // Two Sum
    {
        problemTitle: 'Two Sum',
        input: '4\n2 7 11 15\n9',
        expectedOutput: '0 1',
        isPublic: true,
        order: 1
    },
    {
        problemTitle: 'Two Sum',
        input: '3\n3 2 4\n6',
        expectedOutput: '1 2',
        isPublic: false,
        order: 2
    }
];

async function importTestCases() {
    try {
        await connectDB();

        const problems = await Problem.find();
        if (problems.length === 0) {
            console.log('No problems found. Please import problems first.');
            process.exit(1);
        }

        const problemMap = {};
        problems.forEach(p => {
            problemMap[p.title] = p._id;
        });

        const testCasesToInsert = [];
        const missingProblems = new Set();

        for (const data of testCasesData) {
            const problemId = problemMap[data.problemTitle];
            if (problemId) {
                testCasesToInsert.push({
                    ...data,
                    problem: problemId
                });
            } else {
                missingProblems.add(data.problemTitle);
            }
        }

        if (missingProblems.size > 0) {
            console.warn('Warning: Could not find problems matching these titles:', Array.from(missingProblems));
        }

        if (testCasesToInsert.length > 0) {
            await TestCase.deleteMany(); // Optional: clear existing test cases before importing
            await TestCase.insertMany(testCasesToInsert);
            console.log(`Successfully imported ${testCasesToInsert.length} test cases.`);
        } else {
            console.log('No test cases to import.');
        }

        disconnectDB();
    } catch (error) {
        console.error('Error importing test cases:', error);
        process.exit(1);
    }
}

async function deleteTestCases() {
    try {
        await connectDB();
        await TestCase.deleteMany();
        console.log('Test cases deleted successfully.');
        disconnectDB();
    } catch (error) {
        console.error('Error deleting test cases:', error);
        process.exit(1);
    }
}

if (process.argv.includes('--import')) {
    importTestCases();
} else if (process.argv.includes('--delete')) {
    deleteTestCases();
} else {
    console.log('Please specify --import or --delete');
}
