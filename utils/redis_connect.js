const redis = require("redis");

const redisPort = 6379;

const client = redis.createClient(redisPort);

client.on("error", (err) => {
  logger.error(err);
});

client.connect();

module.exports = client;