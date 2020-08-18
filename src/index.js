import regeneratorRuntime from 'regenerator-runtime'
import express from 'express'
import jwt from 'jsonwebtoken'
import { MongoError } from 'mongodb'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'
import { hashPassword } from './functions'
import {
	ConfirmationCode,
	User,
} from './models'
import {
	feedersRouter,
	mealsRouter,
	usersRouter,
} from './routers'
import config from '../config.json'

const app = express()
const transporter = nodemailer.createTransport(config.nodemailer)

app.post('/sendConfirmationCode', express.json(), async (request, response) => {
	try {
		// Check if a user with the given email already exists.
		if (await User.findByEmail(request.body.email).exec() === null) {
			let confirmationCode

			try {
				// Create a confirmation code for the email.
				confirmationCode = await ConfirmationCode.createFromEmail(request.body.email)
			} catch (error) {
				if (error instanceof MongoError && error.code === 11000) {
					// Read the confirmation code for the email.
					confirmationCode = await ConfirmationCode.findByEmail(request.body.email).exec()
				} else if (error instanceof mongoose.Error.ValidationError) {
					response.sendStatus(400)
				} else {
					throw error
				}
			}

			// Send the confirmation code to the user's email.
			await transporter.sendMail({
				from: '"Auto Pet Feeder" <no-reply@autopetfeeder.com>',
				to: confirmationCode.email,
				subject: 'Auto Pet Feeder Confirmation Code',
				text: confirmationCode.confirmationCode,
			})

			response.sendStatus(200)
		} else {
			response.sendStatus(400)
		}
	} catch (error) {
		response.sendStatus(500)
		console.error(error)
	}
})

app.post('/verifyConfirmationCode', express.json(), async (request, response) => {
	try {
		// Read the confirmation code for the given email.
		const confirmationCode = await ConfirmationCode.findByEmail(request.body.email).exec()

		// Check if the given confirmation code is valid.
		if (confirmationCode !== null && request.body.confirmationCode === confirmationCode.confirmationCode) {
			response.sendStatus(200)
		} else {
			response.sendStatus(400)
		}
	} catch (error) {
		response.sendStatus(500)
		console.error(error)
	}
})

app.post('/tokens', express.json(), async (request, response) => {
	// Read the user with the given email.
	const user = await User.findByEmail(request.body.email).exec()

	// Check if the given password is valid.
	if (user !== null && hashPassword(user.salt, request.body.password) === user.hashedPassword) {
		response.json({ token: jwt.sign({ email: user.email }, config.jwt.secret, { expiresIn: '1h' }) })
	} else {
		response.sendStatus(400)
	}
})

// Use Routers.
app.use('/feeders', feedersRouter)
app.use('/meals', mealsRouter)
app.use('/users', usersRouter)

// Connect to the database.
mongoose.connect(`mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
})
	.then(() => {
		console.log('Connected to the database')

		// Build indexes.
		return Promise.all(mongoose.modelNames().map(modelName => mongoose.model(modelName).init()))
	})
	.then(() => {
		console.log('Built indexes')

		// Start listening.
		app.listen(config.express.port, () => console.log(`Auto Pet Feeder API listening at http://localhost:${config.express.port}`))
	})
	.catch(console.error)
