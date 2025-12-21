const redisClient = require('../config/redisClient');

const cache = {
    get: async (key) => {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('Redis Get Error:', err);
            return null;
        }
    },

    set: async (key, value, duration = 3600) => {
        try {
            await redisClient.set(key, JSON.stringify(value), {
                EX: duration
            });
        } catch (err) {
            console.error('Redis Set Error:', err);
        }
    },

    del: async (pattern) => {
        try {
            // redisClient.keys is blocked in some environments, so we might need a scan or just direct delete if it's a specific key.
            // For now, let's implement simple delete for exact keys, and simple pattern matching using KEYS (careful in prod).
            // A better approach for "all users" invalidation is often just invalidating specific known list keys 
            // or using a set to track keys to invalidate.

            // However, for this task, let's try to handle specific keys passed, or if pattern is needed:
            // If pattern ends with *, we can use KEYS (dev) or SCAN (prod).
            // Given the constraints and typical use, let's scan.

            if (pattern.includes('*')) {
                let cursor = 0;
                do {
                    const reply = await redisClient.scan(cursor, {
                        MATCH: pattern,
                        COUNT: 100
                    });
                    cursor = reply.cursor;
                    const keys = reply.keys;
                    if (keys.length > 0) {
                        await redisClient.del(keys);
                    }
                } while (cursor !== 0);

            } else {
                await redisClient.del(pattern);
            }
        } catch (err) {
            console.error('Redis Del Error:', err);
        }
    }
};

module.exports = cache;
