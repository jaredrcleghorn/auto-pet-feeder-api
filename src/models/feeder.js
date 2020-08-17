import mongoose from 'mongoose'

const feederSchema = new mongoose.Schema({
	email: String,
	name: {
		type: String,
		required: true,
		minLength: 1,
	},
})

export default mongoose.model('Feeder', feederSchema)
