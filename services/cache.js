const redis = require("redis");
const keys = require("../config/keys");
const mongoose = require("mongoose");

const exec = mongoose.Query.prototype.exec;
const client = redis.createClient({ url: keys.redisUrl });
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "default");
  return this; // * So you can chain this function with other query params
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) return exec.apply(this, arguments);

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // * See if we have a value of key in redis
  const cacheValue = await client.hGet(this.hashKey, key);

  // * If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  // * Otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments);
  client.hSet(this.hashKey, key, JSON.stringify(result), "EX", 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
