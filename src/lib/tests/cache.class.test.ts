import Cache from '../cache.class'
import faker from 'faker'

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
    expect(testCache.ttl).toBe(0)

    // Invalid parameters
    testCache = new Cache(-1, -1)
    expect(testCache.store).toMatchObject({})
    expect(testCache.maxEntries).toBe(0)
    expect(testCache.ttl).toBe(0)

    // Valid parameters
    testCache = new Cache(2, 100)
    expect(testCache.store).toMatchObject({})
    expect(testCache.maxEntries).toBe(2)
    expect(testCache.ttl).toBe(100)
  })

  test('Cache.get method logs "Cache miss" when a key is not found', () => {
    const log = jest.spyOn(global.console, 'log')
    const testCache = new Cache()
    testCache.get('key')
    expect(log).toHaveBeenCalledWith('Cache miss')
  })

  test('Cache.get method assigns and returns a random string when a key is not found', () => {
    const testCache = new Cache()
    const getResult = testCache.get('key')
    expect(testCache.store.key.value).toBe(randomString)
    expect(getResult).toBe(randomString)
  })

  test('Cache.get method logs "Cache hit" when a key is found', () => {
    const log = jest.spyOn(global.console, 'log')
    const testCache = new Cache()
    testCache.set('key', 'value')
    testCache.get('key')
    expect(log).toHaveBeenCalledWith('Cache hit')
  })

  test('Cache.get method returns the data when a key is found', () => {
    const testCache = new Cache()
    testCache.set('key', 'value')
    const getResult = testCache.get('key')
    expect(getResult).toBe('value')
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

  test('Cache reset the data with a random string if a key TTL is expired', () => {
    const testCache = new Cache(0, 100)
    testCache.set('k1', 'v1')
    jest.runOnlyPendingTimers()
    expect(testCache.store.k1.value).toBe(randomString)
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
