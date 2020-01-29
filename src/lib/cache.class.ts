import faker from 'faker'
import { CacheGetOptions, CacheStrategies } from '../types/cache.type'

interface CacheStore {
  [key: string]: {
    value: any
    lastUpdateAt: number // unix timestamp
  }
}

export default class Cache {
  store: CacheStore // Store of cahce entries
  maxEntries: number // The number of entries allowed in the cache
  ttlSeconds: number // Time To Live In second

  constructor (maxEntries: number = 0, ttlSeconds: number = 0) {
    this.store = {}

    if (typeof maxEntries !== 'number' || maxEntries < 0) {
      this.maxEntries = 0
    } else {
      this.maxEntries = maxEntries
    }

    if (typeof ttlSeconds !== 'number' || ttlSeconds < 0) {
      this.ttlSeconds = 0
    } else {
      this.ttlSeconds = ttlSeconds
    }
  }

  /**
   * Get the cache data of the given key
   * @param key Cache key
   * @param fetchFunction Function to fetch data from network
   * @param overrideOptions Options to override the default cache options
   * @returns CacheData: any = Cache data of the given key
   */
  async get (key: string, fetchFunction?: Function, overrideOptions: CacheGetOptions = {}) {
    const defaultOptions: CacheGetOptions = {
      strategy: CacheStrategies.CacheFirst
    }
    const options = { ...defaultOptions, ...overrideOptions }

    switch (options.strategy) {
      case CacheStrategies.CacheFirst:
        return this.CacheFirst(key, fetchFunction)
      case CacheStrategies.NetworkFirst:
        return this.NetworkFirst(key, fetchFunction)
      case CacheStrategies.CacheOnly:
        return this.CacheOnly(key)
      case CacheStrategies.NetworkOnly:
        return this.NetworkOnly(fetchFunction)
      case CacheStrategies.StaleWhileRevalidate:
        return this.StaleWhileRevalidate(key, fetchFunction)
      default:
        return this.CacheFirst(key, fetchFunction)
    }
  }

  /**
   * @see https://developers.google.com/web/tools/workbox/modules/workbox-strategies#cache_first_cache_falling_back_to_network
   * @param key Cache key
   * @param fetchFunction Function to fetch data from network
   */
  async CacheFirst (key: string, fetchFunction: Function) {
    // Try to return the data from cache first
    if (this.isCacheHit(key)) {
      // If cache hit
      // => return data from cache
      return this.store[key].value
    } else {
      // If cache miss
      // => Fetch data from network
      // => Set cache and return data
      const data = await fetchFunction()
      this.set(key, data)
      return data
    }
  }

  /**
   * @see https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_first_network_falling_back_to_cache
   * @param key Cache key
   * @param fetchFunction Function to fetch data from network
   */
  async NetworkFirst (key: string, fetchFunction: Function) {
    try {
      // Try to fetch data from network first
      const data = await fetchFunction()
      // If fetch successfully
      // => set cache and return data
      this.set(key, data)
      return data
    } catch (error) {
      // Fail to fetch data from network
      if (this.isCacheHit(key)) {
        // If cache hit
        // => return data from cache
        return this.store[key].value
      }
      // If cache miss => throw error
      throw error
    }
  }

  /**
   * @see https://developers.google.com/web/tools/workbox/modules/workbox-strategies#cache_only
   * @param key Cache key
   */
  async CacheOnly (key: string) {
    if (this.isCacheHit(key)) {
      return this.store[key].value
    }
    throw new Error('404')
  }

  /**
   * @see https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_only
   * @param fetchFunction Function to fetch data from network
   */
  async NetworkOnly (fetchFunction: Function) {
    return fetchFunction()
  }

  /**
   * @see https://developers.google.com/web/tools/workbox/modules/workbox-strategies#stale-while-revalidate
   * @param key Cache key
   * @param fetchFunction Function to fetch data from network
   */
  async StaleWhileRevalidate (key: string, fetchFunction: Function) {
    if (this.isCacheHit(key)) {
      // If cahce hit
      // => Don't await for cache updated from network data
      fetchFunction().then(data => {
        this.set(key, data)
      })
      // => Return data from cache immediately
      return this.store[key].value
    } else {
      // If cache miss
      // => Await for cache updated from network data
      const data = await fetchFunction()
      this.set(key, data)
      // => Return data
      return data
    }
  }

  /**
   * Return all stored keys in the cache
   */
  getKeys (): string[] {
    return Object.keys(this.store)
  }

  /**
   * Set cache data for the given key
   * @param key Cache key
   * @param value Cache data to be set
   */
  set (key: string, value: any) {
    // Check whether cache exceeds the max amount of entries
    if (
      !this.store[key] && // Not just replacement
      this.maxEntries !== 0 && // maxEntries is enabled
      Object.keys(this.store).length >= this.maxEntries // item amount reaches the limit
    ) {
      // If exceeded
      // => Delete expired and stale entries
      this.deleteExpiredAndStaleEntries()
    }

    // Set cache data of the given key
    this.store[key] = {
      value,
      lastUpdateAt: this.setLastUpdateAt()
    }
  }

  /**
   * Set last updated time
   * @returns unix timestamp: number
   */
  setLastUpdateAt (): number {
    return new Date().getTime()
  }

  /**
   * Delete a given key from the cache
   * @param key Cache key
   */
  del (key: string) {
    if (!this.store[key]) {
      return
    }

    // Delete the cache item
    delete this.store[key]
    console.log(`${key} is deleted`)
  }

  delAll () {
    Object.keys(this.store).forEach(key => {
      this.del(key)
    })
    this.store = {}
  }

  /**
   * Delete expired and stale cache entries
   */
  deleteExpiredAndStaleEntries () {
    let oldestCacheKey: string = ''
    let oldestLastUpdateAt = Number.MAX_SAFE_INTEGER

    Object.keys(this.store).forEach(key => {
      const { lastUpdateAt } = this.store[key]
      // Delete the cache if ttlSeconds is set and the cache is expried
      if (this.isExpired(key)) {
        this.del(key)
        return
      }

      // If maxEntries is set and the amount of entries is exceeded
      // => Store the oldest cache key and lastUpdateAt corrently found
      if (this.maxEntries > 0 && Object.keys(this.store).length >= this.maxEntries) {
        if (lastUpdateAt < oldestLastUpdateAt) {
          oldestCacheKey = key
          oldestLastUpdateAt = lastUpdateAt
        }
      }
    })

    // If maxEntries is set and the amount of entries is exceeded
    // => Delete the oldest cache
    if (this.maxEntries > 0 && Object.keys(this.store).length >= this.maxEntries) {
      this.del(oldestCacheKey)
    }
  }

  /**
   * Check whether it is a cache hit for the given key
   * @param key Cache key
   * @returns true = cache hit, false = cache miss
   */
  isCacheHit (key: string): boolean {
    if (this.store[key] && !this.isExpired(key)) {
      this.store[key].lastUpdateAt = this.setLastUpdateAt()
      return true
    }
    return false
  }

  /**
   * Check whether an entry is expired
   * @param key Cache key
   * @returns true = expired, false = not expired
   */
  isExpired (key: string): boolean {
    const minTimestamp = Date.now() - this.ttlSeconds * 1000
    return (this.ttlSeconds > 0 ? this.store[key].lastUpdateAt < minTimestamp : false)
  }

  /**
   * Generate a random string
   */
  generateRandomString (): string {
    return faker.name.findName()
  }
}
