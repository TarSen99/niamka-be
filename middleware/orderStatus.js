const status = (status) => {
	return function (req, _, next) {
		req.orderStatus = status;

		next();
	};
};

module.exports = status;
