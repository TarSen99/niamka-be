const Product = require('../../models/Product');
const Image = require('../../models/Image');
const { getPagDetails } = require('../../helpers/pagination');

const getProductsList = async (req, res) => {
	const { offset, limit, meta } = getPagDetails(req.query);
	const { placeId } = req.params;

	const products = await Product.findAll({
		where: {
			PlaceId: placeId,
		},
		include: Image,
		offset,
		limit,
	});

	const asData = products.map((item) => {
		return item.toJSON();
	});

	return res.status(200).json({
		success: true,
		data: asData,
		meta,
	});
};

module.exports = getProductsList;
