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
    } else {
      // Cache hit
      console.log('Cache hit')
      // => Reset TTL timer
      // => Update the last update time
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
    // => remove one item

    // Reset TTL timer
    // Set cache data of the given key
  }

  /**
   * Delete a given key from the cache
   * @param key Cache key
   */
  del (key: string) {
    // Clear ttl timer
    // Delete the cache item
  }

  /**
   * Handle cache miss event
   * @param key Cache key
   */
  missHandler (key: string) {
    console.log('Cache miss')
    // Set cache data with a random string
  }

  /**
   * Generate a random string
   */
  generateRandomString (): string {
    return 'randomString'
  }
}