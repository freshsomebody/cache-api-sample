import request from 'supertest'
import app from '../../app'

jest.mock('../../lib/cache.class', () => {
  return jest.fn()
    .mockImplementation(() => {
      return {
        get: jest.fn(() => 'v1'),
        getKeys: jest.fn(() => ['k1', 'k2']),
        set: jest.fn(),
        del: jest.fn(),
        delAll: jest.fn()
      }
    })
})

jest.mock('../../models/cache.model')

describe('~/routes/cache.route.ts', () => {
  test('[GET] /cache/keys returns all stored keys in the cache', async () => {
    const response = await request(app).get('/cache/keys')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(['k1', 'k2'])
  })

  test('[GET] /cache/data?key=CACHEKEY returns cache data for the given key', async () => {
    let response = await request(app).get('/cache/data')
    expect(response.statusCode).toBe(400)

    response = await request(app).get('/cache/data?key=k1')
    expect(response.statusCode).toBe(200)
    expect(response.text).toBe('v1')
  })

  test('[POST] /cache returns correct status codes', async () => {
    let response = await request(app).post('/cache')
    expect(response.statusCode).toBe(400)

    response = await request(app).post('/cache').send({ key: 'key', value: 'value' })
    expect(response.statusCode).toBe(200)
  })

  test('[DELET] /cache[?key=CACHEKEY] returns correct status codes', async () => {
    let response = await request(app).delete('/cache')
    expect(response.statusCode).toBe(200)

    response = await request(app).delete('/cache?key=k1')
    expect(response.statusCode).toBe(200)
  })
})
