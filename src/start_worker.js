const submissionWorker = require('./workers/submissionWorker');

console.log('Submission worker started...');

// Keep process alive
process.on('SIGTERM', async () => {
    console.log('Closing worker...');
    await submissionWorker.close();
    process.exit(0);
});
