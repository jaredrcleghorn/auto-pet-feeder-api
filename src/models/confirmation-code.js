import mongoose from 'mongoose'
import { generateConfirmationCode } from '../functions'

const confirmationCodeSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: true,
		alias: 'email',
		match: /^\S+@\S+\.\S+$/,
	},
	confirmationCode: {
		type: String,
		default: generateConfirmationCode,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: '1h',
	},
})

confirmationCodeSchema.statics.createFromEmail = function(email) {
	return this.create({ email })
}
confirmationCodeSchema.statics.findByEmail = function(email) {
	return this.findById(email)
}
confirmationCodeSchema.statics.deleteByEmail = function(email, session) {
	return this.deleteOne(this.translateAliases({ email }), { session })
}

export default mongoose.model('Confirmation Code', confirmationCodeSchema, 'confirmationCodes')
