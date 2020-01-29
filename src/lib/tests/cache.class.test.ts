import Cache from '../cache.class'
import faker from 'faker'
import { CacheGetOptions, CacheStrategies } from '../../types/cache.type'

jest.useFakeTimers()

const randomString = 'randomString'

describe('~/lib/cache.class.ts', () => {
  beforeEach(() => {
    faker.name.findName = jest.fn(() => randomString)
  })

  test('Constructor set states correctly', () => {
    // Default setup
    let testCache = new Cache()
    expect(testCache.store).toMatchObject({})
    expect(testCache.maxEntries).toBe(0)
    expect(testCache.ttlSeconds).toBe(0)

    // Invalid parameters
    testCache = new Cache(-1, -1)
    expect(testCache.store).toMatchObject({})
    expect(testCache.maxEntries).toBe(0)
    expect(testCache.ttlSeconds).toBe(0)

    // Valid parameters
    testCache = new Cache(2, 100)
    expect(testCache.store).toMatchObject({})
    expect(testCache.maxEntries).toBe(2)
    expect(testCache.ttlSeconds).toBe(100)
  })

  test('Strategy CacheFirst returns correctly', async () => {
    const valueFromCache = 'valueFromCache'
    const valueFromNetwork = 'valueFromNetwork'
    const fetchFunction = () => Promise.resolve(valueFromNetwork)
    const cacheGetOption: CacheGetOptions = { strategy: CacheStrategies.CacheFirst }

    // Cache hit => return from cache
    let testCache = new Cache()
    testCache.set('key', valueFromCache)
    let getResult = await testCache.get('key', fetchFunction, cacheGetOption)
    expect(getResult).toBe(valueFromCache)

    // Cache miss => return from network
    testCache = new Cache()
    getResult = await testCache.get('key', fetchFunction, cacheGetOption)
    expect(getResult).toBe(valueFromNetwork)
    expect(testCache.store.key.value).toBe(valueFromNetwork)
  })

  test('Strategy NetworkFirst returns correctly', async () => {
    const valueFromCache = 'valueFromCache'
    const valueFromNetwork = 'valueFromNetwork'
    let fetchFunction = () => Promise.resolve(valueFromNetwork)
    const cacheGetOption: CacheGetOptions = { strategy: CacheStrategies.NetworkFirst }

    // Network is okay => return from network
    let testCache = new Cache()
    let getResult = await testCache.get('key', fetchFunction, cacheGetOption)
    expect(getResult).toBe(valueFromNetwork)
    expect(testCache.store.key.value).toBe(valueFromNetwork)

    // Network is failed => return from cache
    fetchFunction = () => Promise.reject(new Error('404'))
    testCache = new Cache()
    testCache.set('key', valueFromCache)
    getResult = await testCache.get('key', fetchFunction, cacheGetOption)
    expect(getResult).toBe(valueFromCache)

    // Network and cache are both failed
    // => Throw error
    fetchFunction = () => Promise.reject(new Error('404'))
    testCache = new Cache()
    expect(testCache.get('key', fetchFunction, cacheGetOption)).rejects.toEqual(new Error('404'))
  })

  test('Strategy CacheOnly returns correctly', async () => {
    const valueFromCache = 'valueFromCache'
    const valueFromNetwork = 'valueFromNetwork'
    const fetchFunction = () => Promise.resolve(valueFromNetwork)
    const cacheGetOption: CacheGetOptions = { strategy: CacheStrategies.CacheOnly }

    // Cache hit => return from cache
    let testCache = new Cache()
    testCache.set('key', valueFromCache)
    const getResult = await testCache.get('key', fetchFunction, cacheGetOption)
    expect(getResult).toBe(valueFromCache)

    // Cache miss => throw error
    let error
    testCache = new Cache()
    try {
      await testCache.get('key', fetchFunction, cacheGetOption)
    } catch (e) {
      error = e
    }
    expect(error).toBeDefined()
  })

  test('Strategy NetworkOnly returns correctly', async () => {
    const valueFromNetwork = 'valueFromNetwork'
    let fetchFunction = () => Promise.resolve(valueFromNetwork)
    const cacheGetOption: CacheGetOptions = { strategy: CacheStrategies.NetworkOnly }

    // Network is okay => return from network
    let testCache = new Cache()
    const getResult = await testCache.get('key', fetchFunction, cacheGetOption)
    expect(getResult).toBe(valueFromNetwork)

    // Network is failed => throw error
    fetchFunction = () => Promise.reject(new Error('500'))
    testCache = new Cache()
    expect(testCache.get('key', fetchFunction, cacheGetOption)).rejects.toEqual(new Error('500'))
  })

  test('Strategy StaleWhileRevalidate returns correctly', async () => {
    const valueFromCache = 'valueFromCache'
    const valueFromNetwork = 'valueFromNetwork'
    const fetchFunction = async () => valueFromNetwork
    const cacheGetOption: CacheGetOptions = { strategy: CacheStrategies.StaleWhileRevalidate }

    // Cache hit
    // => Return from cache
    // => Update cache with data from network
    let testCache = new Cache()
    testCache.set('key', valueFromCache)
    expect(testCache.store.key.value).toBe(valueFromCache)
    let getResult = await testCache.get('key', fetchFunction, cacheGetOption)
    expect(getResult).toBe(valueFromCache)
    expect(testCache.store.key.value).toBe(valueFromNetwork)

    // Cache miss
    // => Update cache with data from network
    // => Return from data from network
    testCache = new Cache()
    getResult = await testCache.get('key', fetchFunction, cacheGetOption)
    expect(getResult).toBe(valueFromNetwork)
    expect(testCache.store.key.value).toBe(valueFromNetwork)
  })

  test('Cache.set method adds a new key with value into cache', () => {
    const testCache = new Cache()
    testCache.set('key', 'value')
    expect(testCache.store.key).toBeDefined()
    expect(testCache.store.key.value).toBe('value')
  })

  test('Cache deletes the least active key if reaching the max number of entries', async () => {
    const testCache = new Cache(2)
    testCache.set('k1', 'v1')
    testCache.set('k2', 'v2')
    // Add a little delay
    setTimeout(() => {}, 100)
    jest.runAllTimers()
    // Make k1 the latest visited key than k2
    testCache.get('k1')

    testCache.set('k3', 'v3')
    expect(Object.keys(testCache.store)).toEqual(['k1', 'k3'])
  })

  test('Cache delete the entry if a key TTL is expired', () => {
    const testCache = new Cache(0, 10)
    testCache.set('k1', 'v1')
    // Add a little delay
    setTimeout(() => {}, 100)
    jest.runAllTimers()
    expect(testCache.store).toMatchObject({})
  })

  test('Cache.del deletes the given key', () => {
    const testCache = new Cache()
    testCache.set('k1', 'v1')
    testCache.set('k2', 'v2')
    testCache.del('k1')
    expect(Object.keys(testCache.store)).toEqual(['k2'])
  })

  test('Cache.delAll deletes all keys', () => {
    const testCache = new Cache()
    testCache.set('k1', 'v1')
    testCache.set('k2', 'v2')
    testCache.delAll()
    expect(testCache.store).toMatchObject({})
  })
})
