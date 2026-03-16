class CustomValidationError extends Error {
	constructor(message) {
		super(message);
		this.statusCode = 400;
		this.name = 'ValidationError';
	}
}

module.exports = CustomValidationError;