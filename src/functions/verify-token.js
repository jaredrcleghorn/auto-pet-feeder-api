import jwt from 'jsonwebtoken'
import config from '../../config.json'

export default function(request, response, next) {
	const [authorizationType, token] = request.get('Authorization').split(' ')

	// Check if the given authorization type is valid.
	if (authorizationType === 'Bearer') {
		try {
			response.locals.email = jwt.verify(token, config.jwt.secret).email
			next()
		} catch (error) {
			if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
				response.status(400).send('Invalid Token')
			} else {
				response.sendStatus(500)
				console.error(error)
			}
		}
	} else {
		response.status(400).send('Invalid Authorization Type')
		return
	}
}
