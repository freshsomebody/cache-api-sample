import mongoose from 'mongoose'

const DATABASE_HOST = process.env.DATABASE_HOST || 'localhost'
const DATABASE_PORT = process.env.DATABASE_PORT || 27017
const DATABASE = process.env.DATABASE || 'cache'

mongoose.connect(
  `mongodb://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', console.log.bind(console, 'Connected to MongoDB'))
