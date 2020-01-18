import express from 'express'
import Cache from '../lib/cache.class'
import { CacheDoc } from '../types/cache.type'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

// Initialize the cache
const MAX_ENTRIES = Number(process.env.MAX_ENTRIES) || 0
const TTL = Number(process.env.TTL) || 0 // in millisecond
const cache = new Cache(MAX_ENTRIES, TTL)

/**
 * Get all stored keys in the cache
 * Endpoint: [GET] /cache/keys
 */
router.get('/keys', (req, res) => {
  try {
    const cacheKeys = cache.getKeys()
    res.status(200).send(cacheKeys)
  } catch (error) {
    res.status(500).send(error)
  }
})

/**
 * Get the cache data for a given key
 * Endpoint: [GET] /cache/data?key=CACHEKEY
 */
router.get('/data', (req, res) => {
  try {
    const cacheKey = req.query.key
    if (!cacheKey) {
      res.status(400).send('Missing cache key')
      return
    }

    const cacheData = cache.get(cacheKey)
    res.status(200).send(cacheData)
  } catch (error) {
    res.status(500).send(error)
  }
})

/**
 * Create/ update the data for a given key
 * Endpoint: [POST] /cache
 * Expected req.body: { key: string, value: any }
 */
router.post('/', (req, res) => {
  const newCacheData: CacheDoc = req.body
  if (!newCacheData.key || !newCacheData.value) {
    res.status(400).send('Missing cache key or value')
    return
  }
  try {
    const { key, value } = newCacheData
    cache.set(key, value)
    res.status(200).send(`Cache key - ${key} - has been added`)
  } catch (error) {
    res.status(500).send(error)
  }
})

/**
 * Delete all or the given key from the cache
 * Endpoint: [DELETE] /cache[?key=CACHEKEY]
 */
router.delete('/', (req, res) => {
  try {
    const cacheKey = req.query.key
    // If a key is given => delete the key
    if (cacheKey) {
      cache.del(req.params.key)
      res.status(200).send(`Cache key - ${req.params.key} - has been deleted`)
    } else {
      // Else => delete all keys
      cache.delAll()
      res.status(200).send('All data are deleted')
    }
  } catch (error) {
    res.status(500).send(error)
  }
})

export default router
