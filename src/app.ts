import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cacheRoute from './routes/cache.route'
import './models/init'

const app = express()

app.use(compression())

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/cache', cacheRoute)

export default app
