const keys = require('./keys');
const redis = require('redis');

// Create a Redis client and a duplicate for subscription
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

// Fibonacci calculation function
function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// Subscribe to 'insert' events and compute/store Fibonacci
sub.on('message', (channel, message) => {
  const result = fib(parseInt(message));
  redisClient.hset('values', message, result);
});

sub.subscribe('insert');
