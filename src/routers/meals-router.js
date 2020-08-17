import express, { Router } from 'express'
import mongoose from 'mongoose'
import { verifyToken } from '../functions'
import { Feeder, Meal } from '../models'

const mealsRouter = Router()

mealsRouter.post('/', verifyToken, express.json(), async (request, response) => {
	const feeder = await Feeder.findById(request.body.feederId).exec()

	if (feeder !== null && feeder.email === response.locals.email) {
		try {
			await Meal.create([{
				feederId: request.body.feederId,
				name: request.body.name,
				starts: request.body.starts,
				ms: request.body.ms,
				repeat: request.body.repeat,
			}])

			response.sendStatus(201)
		} catch (error) {
			if (error instanceof mongoose.Error.ValidationError) {
				response.sendStatus(400)
			} else {
				response.sendStatus(500)
				console.error(error)
			}
		}
	} else {
		response.status(400).send('Invalid Feeder ID')
	}
})

export default mealsRouter
