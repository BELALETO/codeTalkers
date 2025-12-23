const { Queue } = require('bullmq');

const submissionQueue = new Queue('submissionQueue', {
    connection: {
        host: 'localhost',
        port: 6379
    }
});


module.exports = submissionQueue;
