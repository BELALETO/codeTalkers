const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Submission = require('../models/submissionModel');
const Problem = require('../models/problemModel');
const TestCase = require('../models/testCaseModel');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Connect to DB as worker needs it
connectDB();

const TEMP_DIR = path.join(__dirname, '../../temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const runCode = (language, code, input, timeLimit) => {
    return new Promise((resolve, reject) => {
        const jobId = Math.random().toString(36).substring(7);
        const fileName = `job_${jobId}`;
        let filePath;
        let command;
        let args;

        if (language === 'cpp') {
            filePath = path.join(TEMP_DIR, `${fileName}.cpp`);
            fs.writeFileSync(filePath, code);
            const outPath = path.join(TEMP_DIR, `${fileName}.out`);
            // Compile
            const compile = spawn('g++', [filePath, '-o', outPath]);
            compile.on('close', (code) => {
                if (code !== 0) {
                    fs.unlinkSync(filePath);
                    return resolve({ status: 'Compilation Error', output: 'Compilation failed' });
                }
                // Run
                runProcess(outPath, [], input, timeLimit, true)
                    .then((res) => {
                        fs.unlinkSync(filePath);
                        fs.unlinkSync(outPath);
                        resolve(res);
                    })
                    .catch(reject);
            });
            return; // Early return for C++ compilation step
        } else {
            return resolve({ status: 'Runtime Error', output: 'Unsupported language. Only C/C++ are supported in this specialized worker.' });
        }
    });
};

const runProcess = (command, args, input, timeLimit, isBinary, filePathToDelete = null) => {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args);
        let stdout = '';
        let stderr = '';
        let killed = false;

        const timer = setTimeout(() => {
            process.kill();
            killed = true;
            if (filePathToDelete && fs.existsSync(filePathToDelete)) fs.unlinkSync(filePathToDelete);
            resolve({ status: 'Time Limit Exceeded', output: '' });
        }, timeLimit);

        if (input) {
            process.stdin.write(input);
            process.stdin.end();
        }

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            clearTimeout(timer);
            if (killed) return;

            if (filePathToDelete && fs.existsSync(filePathToDelete)) fs.unlinkSync(filePathToDelete);

            if (code !== 0) {
                resolve({ status: 'Runtime Error', output: stderr || 'Runtime Error' });
            } else {
                resolve({ status: 'Accepted', output: stdout });
            }
        });

        process.on('error', (err) => {
            clearTimeout(timer);
            if (filePathToDelete && fs.existsSync(filePathToDelete)) fs.unlinkSync(filePathToDelete);
            resolve({ status: 'Runtime Error', output: err.message });
        });
    });
};

const submissionWorker = new Worker('submissionQueue', async (job) => {
    console.log('Job started:', job.id);
    let submission;

    try {
        const { submissionId } = job.data;
        submission = await Submission.findById(submissionId);
        if (!submission) throw new Error('Submission not found');

        submission.status = 'processing';
        await submission.save();

        const problem = await Problem.findById(submission.problem);
        if (!problem) throw new Error('Problem not found');

        const testCases = await TestCase.find({ problem: problem._id }).sort('order');
        let overallVerdict = 'Accepted';
        let overallOutput = '';

        for (const testCase of testCases) {
            const result = await runCode(submission.language, submission.code, testCase.input, problem.constraints.timeLimit || 1000);

            if (result.status !== 'Accepted') {
                overallVerdict = result.status;
                overallOutput = result.output; // Show error of first failing case
                break;
            }

            const expected = testCase.expectedOutput.trim();
            const actual = result.output.trim();

            if (expected !== actual) {
                overallVerdict = 'Wrong Answer';
                // For debug purposes, maybe show what was wrong?
                // overallOutput = `Expected: ${expected}\nGot: ${actual}`; 
                break;
            }
        }

        submission.status = 'completed';
        submission.verdict = overallVerdict;
        submission.output = overallOutput; // This might be empty if Accepted, or error msg
        await submission.save();

        return { status: 'success', submissionId, verdict: overallVerdict };

    } catch (err) {
        console.error('Worker error:', err);
        if (submission) {
            submission.status = 'failed';
            submission.verdict = 'Runtime Error'; // Internal error
            submission.output = err.message;
            await submission.save();
        }
        throw err;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379
    }
});

submissionWorker.on('completed', (job) => {
    console.log('Job completed:', job.id);
})
submissionWorker.on('failed', (job, err) => {
    console.log('Job failed:', job.id, err);
})

module.exports = submissionWorker;