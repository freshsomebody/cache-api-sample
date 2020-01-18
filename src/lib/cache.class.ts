import faker from 'faker'

interface CacheStore {
  [key: string]: {
    value: any,
    ttlTimer: null | NodeJS.Timeout,
    lastUpdateAt: number
  }
}

export default class Cache {
  store: CacheStore // Store of cahce entries
  maxEntries: number // The number of entries allowed in the cache
  ttl: number // Time To Live In millisecond

  constructor (maxEntries: number = 0, ttl: number = 0) {
    this.store = {}

    if (typeof maxEntries !== 'number' || maxEntries < 0) {
      this.maxEntries = 0
    } else {
      this.maxEntries = maxEntries
    }

    if (typeof ttl !== 'number' || ttl < 0) {
      this.ttl = 0
    } else {
      this.ttl = ttl
    }
  }

  /**
   * Get the cache data of the given key
   * @param key Cache key
   * @returns CacheData: any = Cache data of the given key
   */
  get (key: string): any {
    if (!this.store[key]) {
      // Cache miss
      // => Call miss handler
      this.missHandler(key)
    } else {
      // Cache hit
      console.log('Cache hit')
      // => Reset TTL timer
      this.store[key].ttlTimer = this.setTTLTimer(key)
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
    // IF exceed
    if (
      !this.store[key] && // Not just replacement
      this.maxEntries !== 0 && // maxEntries is enabled
      Object.keys(this.store).length >= this.maxEntries // item amount reaches the limit
    ) {
      // => Delete one item
      /**
       * **Approach explanation**
       * Each item of a cache has a property, lastUpdatedAt, which is a postive integer.
       * Everytime a item is created, updated or retrieved, lastUpdatedAt will be updated
       *  to the current unix timestamp by new Date().getTime().
       * The cached item with the smallest lastUpdatedAt will be replaced by the new item.
       * Using unix timestamp is because numbers are much easier to compare than strings.
       */
      let oldestCacheKey: string = ''
      let oldestLastUpdateAt = Number.MAX_SAFE_INTEGER

      // Find the key of the least active cache
      Object.keys(this.store).forEach(key => {
        const lastUpdateAt = this.store[key].lastUpdateAt
        if (lastUpdateAt < oldestLastUpdateAt) {
          oldestCacheKey = key
          oldestLastUpdateAt = lastUpdateAt
        }
      })

      // Delete the cache item
      this.del(oldestCacheKey)
    }

    // Set cache data of the given key
    this.store[key] = {
      value,
      ttlTimer: this.setTTLTimer(key),
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

    // Clear ttl timer
    this.store[key].ttlTimer = this.setTTLTimer(key, true)
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

  /**
   * Reset the TTL timer of the given key
   * @param key Cache key
   * @param clearOnly Whether clears a timer and doesn't reset it, default false
   */
  setTTLTimer (key: string, clearOnly: boolean = false): null | NodeJS.Timeout {
    // If ttlTime is set => clear it
    if (this.store[key] && this.store[key].ttlTimer) {
      clearTimeout(this.store[key].ttlTimer)
    }

    if (clearOnly || this.ttl === 0) {
      return null
    }

    // Else set a new timeout
    return setTimeout(() => {
      this.set(key, this.generateRandomString())
    }, this.ttl)
  }
}
