import express, { Router } from 'express'
import mongoose from 'mongoose'
import config from '../../config.json'
import {
	generateSalt,
	hashPassword,
} from '../functions'
import {
	ConfirmationCode,
	User,
} from '../models'

const usersRouter = Router()

usersRouter.post('/', express.json(), async (request, response) => {
	try {
		const confirmationCode = await ConfirmationCode.findByEmail(request.body.email).exec()

		// Check if the given confirmation code is valid.
		if (confirmationCode === null || request.body.confirmationCode !== confirmationCode.confirmationCode) {
			response.status(400).send('Invalid Confirmation Code')
			return
		}

		// Check if the given password is valid.
		if (request.body.password.length < 6) {
			response.status(400).send('Invalid Password')
			return
		}

		// Generate a salt.
		const salt = generateSalt()

		// Make sure the users collection eists, since collections can't be created in transactions.
		await User.createCollection()

		// Start a session.
		const session = await mongoose.startSession()

		// Start a transaction.
		await session.startTransaction()

		try {
			// Delete the confirmation code for the given email and create the user.
			await Promise.all([
				ConfirmationCode.deleteByEmail(request.body.email, session).exec(),
				User.create([{
					email: request.body.email,
					salt,
					hashedPassword: hashPassword(salt, request.body.password),
				}], { session })
			])

			// Commit the transaction.
			await session.commitTransaction()

			response.sendStatus(201)
		} catch (error) {
			// Abort the transaction.
			await session.abortTransaction()

			throw error
		} finally {
			// End the session.
			session.endSession()
		}
	} catch (error) {
		if (error instanceof mongoose.Error.ValidationError) {
			response.sendStatus(400)
		} else {
			response.sendStatus(500)
			console.error(error)
		}
	}
})

export default usersRouter
