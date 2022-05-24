const { Product, Image } = require('../../models');
const { getPagDetails } = require('../../helpers/pagination');
const getStatusFilter = require('../../helpers/statusFilter.js');

const getProductsList = async (req, res) => {
	const { offset, limit, meta } = getPagDetails(req.query);
	const { status } = req.query;
	const { placeId } = req.params;

	let data;
	const statusFilter = getStatusFilter(status);

	try {
		data = await Product.findAndCountAll({
			where: {
				PlaceId: placeId,
				...statusFilter,
			},
			include: Image,
			offset,
			limit,
			order: [['createdAt', 'DESC']],
		});
	} catch (e) {
		return res.status(400).json({
			success: false,
		});
	}

	const asData = data.rows.map((item) => {
		return item.toJSON();
	});

	return res.status(200).json({
		success: true,
		data: asData,
		meta: {
			...meta,
			count: data.count,
		},
	});
};

module.exports = getProductsList;
