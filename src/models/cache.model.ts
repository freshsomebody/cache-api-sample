import mongoose from 'mongoose'
import { CacheDoc } from '../types/cache.type'

const Schema = mongoose.Schema

const CacheSchema = new Schema({
  key: String,
  value: String
})

const CacheModel = mongoose.model('Caches', CacheSchema)

/**
 * Create/ update a cache doc in database
 * @param cacheDoc cache doc to be created/ updated
 */
export async function findOneAndUpdate (cacheDoc: CacheDoc) {
  if (!cacheDoc.key || !cacheDoc.value) {
    throw new Error('Miss cache key or value')
  }
  const conditions = { key: cacheDoc.key }
  const update = cacheDoc
  const option = { upsert: true, new: true }
  return CacheModel.findOneAndUpdate(conditions, update, option)
}

/**
 * Remove a given or all keys from database
 * @param key Cache key
 */
export async function removeByKey (key?: string) {
  const conditions = (key ? { key } : {})
  return CacheModel.remove(conditions)
}
