const isNull = (v) => {
	if (!v) {
		return true;
	}

	return v === 'null' || v === 'undefined' || v === 'NaN';
};

module.exports = {
	isNull,
};
