import express, { Router } from 'express'
import { verifyToken } from '../functions'
import { Feeder } from '../models'

const feedersRouter = Router()

feedersRouter.post('/', verifyToken, express.json(), async (request, response) => {
	const [feeder] = await Feeder.create([{
		email: response.locals.email,
		name: request.body.name,
	}])

	response.status(201).json({ id: feeder.id })
})

feedersRouter.get('/', verifyToken, async (request, response) => {
	response.json(await Feeder.findByEmail(response.locals.email).exec())
})

export default feedersRouter
