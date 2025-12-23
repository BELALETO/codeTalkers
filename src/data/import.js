const { connectDB, disconnectDB } = require('../config/database');
const fs = require('fs');
const Problem = require('../models/problemModel');
const path = require('path');
const slugify = require('slugify');

const problems = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'problems.json'))
);

async function importProblems() {
  try {
    connectDB();
    // pre-save hooks are not fired for insertMany, so we must create the slugs manually
    const problemsWithSlugs = problems.map((problem) => {
      return { ...problem, slug: slugify(problem.title, { lower: true }) };
    });
    await Problem.insertMany(problemsWithSlugs);
    console.log('Problems imported successfully');
    disconnectDB();
  } catch (error) {
    console.error('Error importing problems:', error);
  }
}

async function deleteProblems() {
  try {
    connectDB();
    await Problem.deleteMany();
    console.log('Problems deleted successfully');
    disconnectDB();
  } catch (error) {
    console.error('Error deleting problems:', error);
  }
}

if (process.argv.includes('--import')) {
  importProblems();
}

if (process.argv.includes('--delete')) {
  deleteProblems();
}
