const hasRole = (reqRole, options = {}) => {
	return function (req, res, next) {
		const { role } = req.headers;

		if (typeof reqRole === 'string' && reqRole !== role) {
			return res.status(403).json({
				id: 'Denied',
			});
		}

		if (Array.isArray(reqRole) && !reqRole.includes(role)) {
			return res.status(403).json({
				id: 'Denied',
			});
		}

		if (Object.keys(options).length) {
			const reqValue = +req.params[options.urlField];
			const realValue = +req.headers[options.field];

			if (!reqValue) {
				return res.status(403).json({
					id: 'Denied',
				});
			}

			if (reqValue !== realValue) {
				return res.status(403).json({
					id: 'Denied',
				});
			}
		}

		next();
	};
};

module.exports = hasRole;
