const logger = require("./logger");
const client = require("./redis_connect");

function rateLimiter({ secondsWindow, allowedHits }) {
  return async function (req, res, next) {
    const ip = (
      req.headers["x-forwarded-for"] || req.connection.remoteAddress
    ).slice(0, 9);
    
    const requests = await client.incr(ip);

    let ttl;

    if (requests === 1) {
      await client.expire(ip, secondsWindow);
      ttl = secondsWindow;
    } 
    else {
      ttl = await client.ttl(ip);
    }

    if (requests > allowedHits) {
      logger.error(
        JSON.stringify({
          Response: "error",
          callsInAMinute: requests,
          TTL: ttl,
        })
      );

      logger.warn("Wait for " + ttl + " seconds.");
      
      return res.status(503).json({
        response: "error",
        callsInAMinute: requests,
        ttl,
      });
    }

    logger.info(
      JSON.stringify({ Response: "OK", Requests: requests, TTL: ttl })
    );

    next();
  };
}

module.exports = rateLimiter;
