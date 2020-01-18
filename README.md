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
MAX_ENTRIES=2 // Max amount of entries allowed in a cache
TTL=20000 // Time To Live(TTL) of each cached item (in millisecond)
```

## Endpoints
All api endpoints are:
- Return the cached data for a given key
- Returns all stored keys in the cache
- Create/ Update the data for a give ken
- Remove a given key from the cache
- Remove all keys from the cache

## Development checkpoints
### Minimal requirements
- Add an endpoint that returns the cached data for a given key
    - Cache miss
        - [ ] Log 'Cache miss'
        - [ ] Update the cache with a random string
        - [ ] Return the random string
    - Cache hit
        - [ ] Log 'Cache hit'
        - [ ] Get and return the data
- [ ] Add an endpoint that returns all stored keys in the cache
- [ ] Add an endpoint that creates/ updates the data for a given key
- [ ] Add an endpoint that removes a given key from the cache
- [ ] Add an endpoint that removes all keys from the cache
- [ ] Overwrite when cache exceed the max amount of entries
- [ ] Add TTL and reset mechanisms for caches
- [ ] Store a copy in MongoDB
