const getDbErrors = (err) => {
	return (err.errors || []).map((err) => {
		console.log(err);
		return {
			field: err.path,
			error: err.message,
		};
	});
};

module.exports = getDbErrors;
