import app from './app'
import dotenv from 'dotenv'
dotenv.config()

const SERVICE_PORT = process.env.SERVICE_PORT || 3000
app.listen(SERVICE_PORT, () => console.log(`Server is listening at http://localhost:${SERVICE_PORT}`))
