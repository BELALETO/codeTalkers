// const submissionQueue = require('../queues/submissionQueue');
const { Worker } = require('bullmq');


const submissionWorker = new Worker('submissionQueue', async (job) => {
    console.log('Job started:', job.id);
    console.log(job.data);
    // TODO: Implement submission processing logic
    return job.data;
}, {
    connection: {
        host: 'localhost',
        port: 6379
    }
})

submissionWorker.on('completed', (job) => {
    console.log('Job completed:', job.id);
})
submissionWorker.on('failed', (job) => {
    console.log('Job failed:', job.id);
})

module.exports = submissionWorker;