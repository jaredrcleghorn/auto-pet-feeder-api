import EventEmitter from 'events'
import express, { Router } from 'express'
import mongoose from 'mongoose'
import { verifyToken } from '../functions'
import { Feeder, Meal } from '../models'

const mealsRouter = Router()
const eventEmitter = new EventEmitter()

mealsRouter.post('/', verifyToken, express.json(), async (request, response) => {
	const feeder = await Feeder.findById(request.body.feederId).exec()

	if (feeder !== null && feeder.email === response.locals.email) {
		try {
			const [meal] = await Meal.create([{
				feederId: request.body.feederId,
				name: request.body.name,
				starts: request.body.starts,
				ms: request.body.ms,
				repeat: request.body.repeat,
			}])

			eventEmitter.emit('event', 'creation', meal._id, request.body.starts, request.body.ms, request.body.repeat)
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

mealsRouter.get('/', verifyToken, async (request, response) => {
	const feeder = await Feeder.findById(request.query.feederId).exec()

	if (feeder !== null && feeder.email === response.locals.email) {
		response.json(await Meal.findByFeederId(request.query.feederId))
	} else {
		response.status(400).send('Invalid Feeder ID')
	}
})

mealsRouter.get('/events', verifyToken, async (request, response) => {
	const feeder = await Feeder.findById(request.query.feederId).exec()

	if (feeder !== null && feeder.email === response.locals.email) {
		response.set('Content-Type', 'text/event-stream')
		response.writeHead(200)

		eventEmitter.on('event', (type, id, starts, ms, repeat) => {
			response.write(JSON.stringify({
				type,
				meal: { id, starts, ms, repeat },
			}))
		})
	} else {
		response.sendStatus(400).send('Invalid Feeder ID')
	}
})

export default mealsRouter
