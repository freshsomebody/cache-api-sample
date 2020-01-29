# Cache-api
A set of api which implemented some of common cache functionalities.

## Setup
Install packages
```shell
npm install
```

Build the source code
```shell
npm run build
```

Start the program
```shell
npm run start
```

Build and start the program
```shell
npm run buildAndStart
```

Start the program in the development mode
```shell
npm run dev
```

Test
```shell
npm run test
```

Lint
```shell
npm run lint
```

## Environment variables
You can create a .env file at the root of this project to customize some variables

```
SERVICE_PORT=3000 // service port of endpoints

DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE=cache // database to be used

MAX_ENTRIES=2 // Max amount of entries allowed in a cache
TTL=20000 // Time To Live(TTL) of each cached item (in millisecond)
```

## Endpoints
All api endpoints are:
- Return the cached data for a given key
    - [GET] [http://localhost:3000/cache/data?key=GIVEN_KEY](http://localhost:3000/cache/data?key=test)
- Returns all stored keys in the cache
    - [GET] [http://localhost:3000/cache/keys](http://localhost:3000/cache/keys)
- Create/ Update the data for a give ken
    - [POST] [http://localhost:3000/cache](http://localhost:3000/cache)
    - Post body: { key: string, value: any }
- Remove a given key from the cache
    - [DELETE] [http://localhost:3000/cache?key=GIVEN_KEY](http://localhost:3000/cache?key=GIVEN_KEY)
- Remove all keys from the cache
    - [DELETE] [http://localhost:3000/cache](http://localhost:3000/cache)

## Development checkpoints
### Minimal requirements
- [x] Add an endpoint that returns the cached data for a given key
    - Cache miss
        - [x] Log 'Cache miss'
        - [x] Update the cache with a random string
        - [x] Return the random string
    - Cache hit
        - [x] Log 'Cache hit'
        - [x] Get and return the data
- [x] Add an endpoint that returns all stored keys in the cache
- [x] Add an endpoint that creates/ updates the data for a given key
- [x] Add an endpoint that removes a given key from the cache
- [x] Add an endpoint that removes all keys from the cache
- [x] Overwrite when cache exceed the max amount of entries
    - Explanation is written in the **set** method in ~/lib/cache.class.ts
- [x] Add TTL and reset mechanisms for caches
    - [x] Change TTL check timing to get/ set
- [ ] Add cache strategies [#reference](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [ ] Integrate models with caches
- [x] Store a copy in MongoDB
