const beautify = (message = ' ') => {
	let result = message[0].toUpperCase();

	return result + message.slice(1, message.length);
};

const validate = (schema, data) => {
	return schema
		.validate(data, { abortEarly: false })
		.then(() => ({ valid: true }))
		.catch((e) => {
			return {
				valid: false,
				errors: e.inner.map((err) => {
					return {
						error: beautify(err.message),
						field: err.path,
					};
				}),
			};
		});
};

module.exports = validate;
