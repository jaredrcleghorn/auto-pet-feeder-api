import crypto from 'crypto'

export default function(salt, password) {
	return crypto.createHmac('sha512', salt).update(password).digest('base64')
}
