import mongoose from 'mongoose'

const feederSchema = new mongoose.Schema({
	email: String,
	name: {
		type: String,
		required: true,
		minLength: 1,
	},
})

feederSchema.statics.findByEmail = function(email) {
	return this.find({ email }, '_id name')
}

export default mongoose.model('Feeder', feederSchema)
