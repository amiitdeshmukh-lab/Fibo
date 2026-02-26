const keys = require('./keys');
const redis = require('redis');

// Create a Redis client and a duplicate for subscription (redis v5+)
const redisClient = redis.createClient({
  socket: {
    host: keys.redisHost,
    port: keys.redisPort,
    reconnectStrategy: () => 1000,
  },
});
redisClient.on('error', (err) => console.error('Redis client error', err));

const sub = redisClient.duplicate();
sub.on('error', (err) => console.error('Redis subscriber error', err));
 
const fib = require("./fib");

// Subscribe to 'insert' events and compute/store Fibonacci
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    if (!sub.isOpen) {
      await sub.connect();
    }

    await sub.subscribe('insert', async (message) => {
      const index = parseInt(message, 10);
      if (Number.isNaN(index)) {
        return;
      }

      const result = fib(index);
      await redisClient.hSet('values', message, result);
    });
  } catch (err) {
    console.error('Failed to initialize Redis subscription', err);
  }
})();
