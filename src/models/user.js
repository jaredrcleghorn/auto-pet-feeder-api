import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
	_id: {
		type: String,
		alias: 'email',
	},
	salt: String,
	hashedPassword: String,
})

userSchema.statics.findByEmail = function(email) {
	return this.findById(email)
}

export default mongoose.model('User', userSchema)
