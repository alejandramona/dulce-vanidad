const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const cacheGet = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) { cache.delete(key); return null; }
  return item.value;
};

const cacheSet = (key, value, ttl = CACHE_TTL) => {
  cache.set(key, { value, expiresAt: Date.now() + ttl });
};

const cacheDel = (key) => cache.delete(key);

module.exports = { cacheGet, cacheSet, cacheDel };
