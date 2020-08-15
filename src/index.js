import express from 'express'
import mongoose from 'mongoose'
import config from '../config.json'

const app = express()

app.get('/', (request, response) => response.send('hello, world'))

// Connect to the database.
mongoose.connect(`mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => {
		console.log('Connected to the database')

		// Start listening.
		app.listen(config.express.port, () => console.log(`Auto Pet Feeder API listening at http://localhost:${config.express.port}`))
	})
	.catch(console.error)
