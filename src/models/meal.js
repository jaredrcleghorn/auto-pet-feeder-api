import mongoose from 'mongoose'

const repeats = Object.fromEntries(['never', 'daily', 'weekly'].map((repeatString, index) => [repeatString, index]))

const mealSchema = new mongoose.Schema({
	feederId: mongoose.Schema.ObjectId,
	name: {
		type: String,
		required: true,
		minLength: 1,
	},
	starts: {
		type: Date,
		required: true,
	},
	ms: {
		type: Number,
		required: true,
		validate: Number.isInteger,
		min: 1,
	},
	repeat: {
		type: Number,
		required: true,
		set: repeatString => repeats[repeatString],
	}
})

export default mongoose.model('Meal', mealSchema)
