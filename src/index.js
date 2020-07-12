import express from 'express'
import config from '../config.json'

const app = express()

app.get('/', (request, response) => response.send('hello, world'))

// Start listening.
app.listen(config.express.port, () => console.log(`Auto Pet Feeder API listening at http://localhost:${config.express.port}`))
