const mongoose = require("mongoose")
const redis = require("redis")
const redisUrl = "redis://127.0.0.1:6379"
const client = redis.createClient(redisUrl)
const util = require("util")
client.hget = util.promisify(client.hget)

const exec  = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function(options={}){
 this.useCache = true
 this.hashKey = JSON.stringify(options.key || "")
 return this
} 

mongoose.Query.prototype.exec =  async function(){
 if(!this.useCache){
  return exec.apply(this,arguments)
 }
 const key = JSON.stringify(
  Object.assign({},this.getQuery(),{
  collection:this.mongooseCollection.name
 })
 )
 //check if the value exist
 const catcheValue = await client.hget(this.hashKey,key)
  if(catcheValue){
   const doc = JSON.parse(catcheValue)
   return Array.isArray(doc) ?doc.map(d=> new this.model(doc)) :new this.model(doc)
   }


 const result = await  exec.apply(this,arguments )
 client.hset(key, JSON.stringify(this.hashKey, result),'EX',10)
 return result
}