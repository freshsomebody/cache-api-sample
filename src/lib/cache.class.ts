import faker from 'faker'

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
   * @returns CacheData: any = Cache data of the given key
   */
  get (key: string): any {
    const minTimestamp = Date.now() - this.ttlSeconds * 1000
    if (!this.store[key] || this.store[key].lastUpdateAt < minTimestamp) {
      // Cache miss
      // => Call miss handler
      this.missHandler(key)
    } else {
      // Cache hit
      console.log('Cache hit')
      // => Update the last update time
      this.store[key].lastUpdateAt = this.setLastUpdateAt()
    }
    return this.store[key].value
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
    const minTimestamp = Date.now() - this.ttlSeconds * 1000
    let oldestCacheKey: string = ''
    let oldestLastUpdateAt = Number.MAX_SAFE_INTEGER

    Object.keys(this.store).forEach(key => {
      const { lastUpdateAt } = this.store[key]
      // Delete the cache if ttlSeconds is set and the cache is expried
      if (this.ttlSeconds > 0 && lastUpdateAt < minTimestamp) {
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
   * Handle cache miss event
   * @param key Cache key
   */
  missHandler (key: string) {
    console.log('Cache miss')
    // Set cache data with a random string
    this.set(key, this.generateRandomString())
  }

  /**
   * Generate a random string
   */
  generateRandomString (): string {
    return faker.name.findName()
  }
}
