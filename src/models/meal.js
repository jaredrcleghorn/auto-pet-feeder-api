import mongoose from 'mongoose'

const repeatStrings = ['never', 'daily', 'weekly']
const repeats = Object.fromEntries(repeatStrings.map((repeatString, index) => [repeatString, index]))

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
		get: repeat => repeatStrings[repeat],
		set: repeatString => repeats[repeatString],
	}
}, {
	toJSON: {
		getters: true,
		virtuals: false,
	},
})

mealSchema.statics.findByFeederId = function(feederId) {
	return this.find({ feederId }, '_id name starts ms repeat')
}

export default mongoose.model('Meal', mealSchema)
