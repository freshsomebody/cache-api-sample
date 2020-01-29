import mongoose from 'mongoose'
import Cache from '../lib/cache.class'
import { CacheGetOptions, CacheStrategies } from '../types/cache.type'

const Schema = mongoose.Schema

const ItemSchema = new Schema({
  name: String,
  color: String
})

const ItemModel = mongoose.model('Items', ItemSchema)

const itemCache = new Cache()

/**
 * Create/ update a cache doc in database
 * @param cacheDoc cache doc to be created/ updated
 */
export async function findByName (name: string, cacheOptions: CacheGetOptions = {}): Promise<any> {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid item name')
  }
  const conditions = { name }
  return itemCache.get(`findItemByName?name=${name}`, () => ItemModel.find(conditions), cacheOptions)
}
