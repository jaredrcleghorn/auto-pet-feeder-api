import crypto from 'crypto'

export default function() {
	let confirmationCode = ''

	while (confirmationCode.length !== 6) {
		const randomUInt8 = crypto.randomBytes(1).readUInt8()

		if (randomUInt8 < 250) {
			confirmationCode += randomUInt8 % 10
		}
	}

	return confirmationCode
}
