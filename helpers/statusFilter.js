const { Op } = require('sequelize');

module.exports = function (status) {
	let statusFilter = {};

	if (status) {
		const statusV = status.split(',');

		if (statusV.length === 1) {
			if (statusV[0] === 'all') {
				statusFilter = {
					status: {
						[Op.not]: null,
					},
				};
			} else {
				statusFilter = {
					status: statusV[0],
				};
			}
		} else {
			statusFilter = {
				status: {
					[Op.or]: statusV,
				},
			};
		}
	}

	return statusFilter;
};
