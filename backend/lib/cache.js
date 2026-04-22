const NodeCache = require("node-cache");

// TTL in seconds: 5 min for pages, 1 min for dynamic data
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

function getCache(key) {
  return cache.get(key);
}

function setCache(key, value, ttl = 300) {
  cache.set(key, value, ttl);
}

function delCache(key) {
  cache.del(key);
}

function flushCache() {
  cache.flushAll();
}

// Middleware: cache full page responses
function pageCache(ttl = 300) {
  return (req, res, next) => {
    if (req.method !== "GET") return next();
    const key = `page:${req.originalUrl}`;
    const cached = getCache(key);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.send(cached);
    }
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (res.statusCode === 200) setCache(key, body, ttl);
      res.setHeader("X-Cache", "MISS");
      return originalSend(body);
    };
    next();
  };
}

module.exports = { getCache, setCache, delCache, flushCache, pageCache };
