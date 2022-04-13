const LIMIT = 25;

const getPagDetails = ({ page = 1, limit = LIMIT }) => {
	const offset = Math.ceil(page * limit - limit);

	const meta = {
		page: +page,
		offset: +offset,
		limit: +limit,
	};

	return {
		meta,
		...meta,
	};
};

module.exports = {
	getPagDetails,
};
